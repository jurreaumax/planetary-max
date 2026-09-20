"""Structured Umbrella physics surfaces activated by the kernel."""

from typing import Any, Dict, Mapping


UMBRELLA_LANES = ("identity", "governance", "structural", "physics", "routing")


def activate_umbrella_lane(operation: str, identity: Mapping[str, Any]) -> Dict[str, Any]:
    """Return the deterministic physics contract for an authorized lane."""
    lane = operation.removeprefix("umbrella.")
    if lane not in UMBRELLA_LANES:
        raise ValueError(f"unsupported Umbrella lane: {lane}")

    safe_identity = {
        "subject": identity.get("subject") or identity.get("id"),
        "role": identity.get("role"),
        "capabilities": list(identity.get("capabilities") or ()),
    }
    read_only = safe_identity["role"] == "observer"
    layers: Dict[str, Any] = {
        "identity": safe_identity,
        "governance": {
            "permissions": list(safe_identity["capabilities"]),
            "constraints": ["authenticated", "default-deny"] + (["read-only"] if read_only else []),
            "rules": ["role-capability-enforced", "explicit-deny-wins"],
        },
        "structural": {
            "os": "Portal-OS",
            "engine": "Umbrella",
            "simulation": {
                "model": "SIM",
                "scheduler": "multi-domain",
                "structure": "worker-kernel-lanes",
            },
        },
        "physics": {
            "state": "active",
            "layers": ["identity", "structural", "governance", "routing"],
            "enforcement": "strict",
        },
        "routing": {
            "selectedLane": lane,
            "dispatch": "orchestration",
            "availableLanes": [f"/api/umbrella/{name}" for name in UMBRELLA_LANES],
        },
    }
    return {
        "umbrella": {"active": True, "lane": lane},
        "identity": safe_identity,
        "physics": layers[lane],
    }
