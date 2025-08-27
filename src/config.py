# src/config.py
import os
from typing import Optional, Dict

def _parse_overrides(raw: str | None) -> Dict[str, str]:
    """
    Parse "R1:high,R2:low" (case-insensitive severities) → {"R1": "high", "R2": "low"}.
    Whitespace tolerated.
    """
    out: Dict[str, str] = {}
    if not raw:
        return out
    for pair in raw.split(","):
        pair = pair.strip()
        if not pair or ":" not in pair:
            continue
        rid, sev = pair.split(":", 1)
        rid = rid.strip()
        sev_l = (sev or "").strip().lower()
        if rid and sev_l in {"low", "medium", "high"}:
            out[rid] = sev_l
    return out

def get_severity_override(rule_id: Optional[str]) -> Optional[str]:
    """
    Return "low"|"medium"|"high" if overridden via env SCANNER_SEVERITY_OVERRIDES, else None.
    Example: SCANNER_SEVERITY_OVERRIDES="R1:high,R2:low"
    """
    if not rule_id:
        return None
    raw = os.environ.get("SCANNER_SEVERITY_OVERRIDES")
    table = _parse_overrides(raw)
    return table.get(rule_id)

def get_dampener_strength() -> float:
    """
    Read SCANNER_DAMPENER (0..1). 1.0 = no extra dampening; 0.5 halves confidence.
    Defaults to 1.0. Values are clamped into [0.0, 1.0].
    """
    raw = os.environ.get("SCANNER_DAMPENER")
    try:
        v = float(raw) if raw is not None else 1.0
    except ValueError:
        v = 1.0
    return max(0.0, min(1.0, v))

def get_http_timeout() -> float:
    """
    Read SCANNER_HTTP_TIMEOUT_SECONDS as float. Defaults to 10.0 seconds.
    """
    raw = os.environ.get("SCANNER_HTTP_TIMEOUT_SECONDS")
    try:
        v = float(raw) if raw is not None else 10.0
    except ValueError:
        v = 10.0
    return max(0.1, v)