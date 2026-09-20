"""Cloudflare Python Worker entrypoint for the private Portal kernel service."""

import json
from typing import Any, Dict
from urllib.parse import urlparse

from workers import Response, WorkerEntrypoint

from identity.registry import IdentityRegistry
from kernel.boot import Kernel


TOKEN_VARIABLES = (
    "PORTAL_SYSTEM_TOKEN",
    "PORTAL_SERVICE_TOKEN",
    "PORTAL_OBSERVER_TOKEN",
    "PORTAL_SYSTEM_LICENSE_TIER",
    "PORTAL_SERVICE_LICENSE_TIER",
    "PORTAL_OBSERVER_LICENSE_TIER",
)


def _json_response(status: int, payload: Dict[str, Any]) -> Response:
    return Response(
        json.dumps(payload, sort_keys=True, separators=(",", ":")),
        status=status,
        headers={"content-type": "application/json; charset=utf-8"},
    )


class Default(WorkerEntrypoint):
    """Expose only the health and synchronous kernel message contracts."""

    def _kernel(self) -> Kernel:
        kernel = getattr(self, "_portal_kernel", None)
        if kernel is None:
            environment = {
                name: getattr(self.env, name)
                for name in TOKEN_VARIABLES
                if getattr(self.env, name, None)
            }
            kernel = Kernel(IdentityRegistry(environment))
            kernel.boot()
            self._portal_kernel = kernel
        return kernel

    async def fetch(self, request):
        path = urlparse(request.url).path
        if request.method == "GET" and path == "/health":
            return _json_response(200, {"ok": True, "service": "portal-os-kernel"})
        if request.method != "POST" or path != "/api/kernel/message":
            return _json_response(404, {"ok": False, "error": {"code": "NOT_FOUND", "message": "Route not found"}})
        try:
            envelope = await request.json()
            if not isinstance(envelope, dict):
                raise ValueError("message envelope must be an object")
        except Exception as error:
            return _json_response(400, {"ok": False, "error": {"code": "INVALID_JSON", "message": str(error)}})

        result = self._kernel().handle_message(envelope)
        code = result.get("error", {}).get("code") if not result.get("ok") else None
        status = {"UNAUTHENTICATED": 401, "FORBIDDEN": 403, "INVALID_MESSAGE": 400}.get(
            code, 500 if code else 200
        )
        return _json_response(status, result)
