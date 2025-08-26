# src/rules/severity.py
from typing import Iterable

_LEVEL = {"low": 1, "medium": 2, "high": 3}

def meets_threshold(findings: Iterable[dict], fail_on: str | None) -> bool:
    if not fail_on:
        return False
    thr = _LEVEL.get(fail_on.lower())
    if thr is None:
        return False
    for f in findings:
        sev = (f.get("severity") or "").lower()
        if _LEVEL.get(sev, 0) >= thr:
            return True
    return False
