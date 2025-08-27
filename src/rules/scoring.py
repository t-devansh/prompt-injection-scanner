from typing import Dict
from src.config import get_severity_override

# Central rule scoring table
_RULE_SCORES: Dict[str, Dict] = {
    "R1": {"severity": "medium", "confidence": 0.7},
    "R2": {"severity": "high", "confidence": 0.8},
    "R3": {"severity": "high", "confidence": 0.6},
    "R4": {"severity": "medium", "confidence": 0.5},
    "HX1": {"severity": "medium", "confidence": 0.6},
}

def apply_scoring(finding: Dict) -> Dict:
    """Apply standardized severity/confidence based on rule_id."""
    rid = finding.get("rule_id")
    if rid in _RULE_SCORES:
        finding["severity"] = _RULE_SCORES[rid]["severity"]
        finding["confidence"] = _RULE_SCORES[rid]["confidence"]

    # Apply env-based override if present
    override = get_severity_override(finding.get("rule_id"))
    if override:
        finding["severity"] = override
    return finding
