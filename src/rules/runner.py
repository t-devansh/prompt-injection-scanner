from typing import List, Dict, Optional, Union
from .basic import (
    rule_ignore_instructions,        # R1
    rule_reveal_secrets,             # R2
    rule_homoglyph_zero_width,       # R3 
    rule_obfuscation_zero_width_or_homoglyphs,  # R4
)
from .scoring import apply_scoring

RuleResult = Union[None, Dict, List[Dict]]

def _add(findings: List[Dict], res: RuleResult) -> None:
    """Flatten rule outputs. Accept dict or list[dict]; ignore None/empty."""
    if not res:
        return
    if isinstance(res, dict):
        findings.append(res)
    elif isinstance(res, list):
        findings.extend([r for r in res if isinstance(r, dict)])

def run_rules(text: str, html: Optional[str] = None) -> List[Dict]:
    findings: List[Dict] = []

    # TEXT rules
    for fn in (
        rule_ignore_instructions,
        rule_reveal_secrets,
        rule_homoglyph_zero_width,                 # R3
        rule_obfuscation_zero_width_or_homoglyphs  # R4
    ):
        _add(findings, fn(text))

    # Reachability heuristic (needs HTML)
    if html:
        from .reachability import reachability_check
        _add(findings, reachability_check(html))

    findings = [apply_scoring(f) for f in findings]

    # HTML-based R4 (hidden CSS) will be added separately later
    return findings
