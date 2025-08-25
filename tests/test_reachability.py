from typing import List, Dict
from src.finder.surfaces import find_surfaces

def reachability_check(html: str) -> List[Dict]:
    """Detect if user-controlled input surfaces and AI output surfaces both exist."""
    findings: List[Dict] = []
    try:
        surfaces = find_surfaces(html or "")
    except Exception:
        return findings

    has_user = any(s.role in ("user_input", "rendered_user_content") for s in surfaces)
    has_ai   = any(s.role == "ai_output" for s in surfaces)

    if has_user and has_ai:
        findings.append({
            "rule_id": "HX1",
            "title": "Potential user→AI reachability",
            "severity": "medium",
            "confidence": 0.6,
            "evidence": "User input fields and AI output surfaces both present",
            "details": {
                "risk_path": ["user_input", "ai_output"]
            }
        })

    return findings
