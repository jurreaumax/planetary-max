"""Identity validation for every Portal-OS message."""

from dataclasses import dataclass, field
import os
from typing import Any, Dict, Iterable, Mapping, Optional


ROLE_CAPABILITIES = {
    "admin": ("*",),
    "operator": ("umbrella:read", "umbrella:operate", "universe:read", "universe:write"),
    "observer": ("umbrella:read", "universe:read"),
}


class IdentityError(ValueError):
    """Raised when a message does not carry a registered identity token."""


@dataclass(frozen=True)
class Identity:
    id: str
    name: str
    roles: tuple[str, ...]
    attributes: Mapping[str, Any] = field(default_factory=dict)

    @property
    def role(self) -> str:
        for role in ("admin", "operator", "observer"):
            if role in self.roles:
                return role
        return self.roles[0] if self.roles else "unknown"

    @property
    def capabilities(self) -> tuple[str, ...]:
        return ROLE_CAPABILITIES.get(self.role, ())

    def as_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "roles": list(self.roles),
            "attributes": dict(self.attributes),
            "subject": self.id,
            "role": self.role,
            "capabilities": list(self.capabilities),
        }


class IdentityRegistry:
    """Small token registry for the synchronous bridge adapter.

    Deployments should construct this registry from their identity provider. The
    built-ins make local boot and integration tests deterministic.
    """

    def __init__(self, environment: Optional[Mapping[str, Any]] = None) -> None:
        self._tokens: Dict[str, Identity] = {}
        source = environment if environment is not None else os.environ
        configured = (
            ("PORTAL_SYSTEM_TOKEN", "PORTAL_SYSTEM_LICENSE_TIER", "system", ("admin",)),
            ("PORTAL_SERVICE_TOKEN", "PORTAL_SERVICE_LICENSE_TIER", "portal-worker", ("operator",)),
            ("PORTAL_OBSERVER_TOKEN", "PORTAL_OBSERVER_LICENSE_TIER", "observer", ("observer",)),
        )
        for token_variable, tier_variable, name, roles in configured:
            token = source.get(token_variable)
            if token:
                configured_tier = source.get(tier_variable)
                attributes = {"licenseTier": configured_tier} if configured_tier else {}
                self.register(token, name, roles, attributes)

    def register(self, token: str, name: str, roles: Iterable[str], attributes: Optional[Mapping[str, Any]] = None) -> Identity:
        if not token or not token.strip():
            raise IdentityError("identity token cannot be empty")
        identity = Identity(name, name, tuple(sorted(set(roles))), dict(attributes or {}))
        self._tokens[token] = identity
        return identity

    def validate(self, identity_token: Any) -> Identity:
        if isinstance(identity_token, Mapping):
            return self._validate_envelope(identity_token)
        if not isinstance(identity_token, str) or not identity_token:
            raise IdentityError("missing identity token")
        identity = self._tokens.get(identity_token)
        if identity is None:
            raise IdentityError("invalid identity token")
        return identity

    def _validate_envelope(self, envelope: Mapping[str, Any]) -> Identity:
        proof = envelope.get("proof")
        if not isinstance(proof, str) or not proof:
            raise IdentityError("identity envelope proof is missing")
        identity = self._tokens.get(proof)
        if identity is None:
            raise IdentityError("invalid identity token")
        capabilities = envelope.get("capabilities")
        if (
            envelope.get("subject") != identity.id
            or envelope.get("role") != identity.role
            or not isinstance(capabilities, list)
            or capabilities != list(identity.capabilities)
        ):
            raise IdentityError("identity envelope does not match configured token")
        return identity
