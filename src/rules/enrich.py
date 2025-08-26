# src/rules/enrich.py
from typing import List, Dict, Optional
from src.finder.surfaces import find_surfaces, Surface

CONTROLLED_ROLES = {"user_input", "rendered_user_content"}

def _pick_surface_for_evidence(surfaces: List[Surface], evidence: Optional[str]) -> Optional[Surface]:
    if not evidence:
        return None
    ev = evidence.strip().lower()
    if not ev:
        return None

    # 1) exact substring in sample_text
    for s in surfaces:
        if (s.sample_text or "").lower().find(ev) != -1:
            return s

    # 2) relaxed: overlap on any 8+ character token from the evidence
    tokens = [t for t in ev.split() if len(t) >= 8]
    for t in tokens:
        for s in surfaces:
            if (s.sample_text or "").lower().find(t) != -1:
                return s
    return None

def enrich_with_surfaces(findings: List[Dict], html: Optional[str]) -> List[Dict]:
    """
    For each finding without a selector, try to attach one by matching its 'evidence'
    against surface sample_text. Set is_user_controlled based on role.
    """
    if not html:
        return findings

    try:
        surfaces = find_surfaces(html)
    except Exception:
        return findings

    for f in findings:
        # don't overwrite if already set
        if f.get("selector"):
            if "is_user_controlled" not in f:
                # Default: infer from selector role if present in details
                role = (f.get("details") or {}).get("role")
                f["is_user_controlled"] = bool(role in CONTROLLED_ROLES) if role else None
            continue

        s = _pick_surface_for_evidence(surfaces, f.get("evidence"))
        if s:
            f["selector"] = s.selector
            f.setdefault("details", {})["role"] = s.role
            f["is_user_controlled"] = s.role in CONTROLLED_ROLES
        else:
            # If we couldn't map it, default to None (explicit)
            if "is_user_controlled" not in f:
                f["is_user_controlled"] = None

    return findings
