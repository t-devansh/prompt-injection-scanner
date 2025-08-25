from typing import List, Dict
from src.finder.surfaces import find_surfaces

def reachability_check(html: str) -> List[Dict]:
    """Detect if user-controlled input surfaces and AI output surfaces both exist, with selectors."""
    findings: List[Dict] = []
    try:
        surfaces = find_surfaces(html or "")
    except Exception:
        return findings

    inputs = [s for s in surfaces if s.role in ("user_input", "rendered_user_content")]
    outputs = [s for s in surfaces if s.role == "ai_output"]

    if inputs and outputs:
        in_sel = inputs[0].selector
        out_sel = outputs[0].selector
        findings.append({
            "rule_id": "HX1",
            "title": "Potential user→AI reachability",
            "severity": "medium",     # normalized by scoring later
            "confidence": 0.6,        # normalized by scoring later
            "evidence": "User input fields and AI output surfaces both present",
            "selector": out_sel,      # primary selector = AI output surface
            "details": {
                "risk_path": ["user_input", "ai_output"],
                "input_selector": in_sel,
                "output_selector": out_sel
            }
        })

    return findings
