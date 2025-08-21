# src/rules/runner.py
from typing import List, Dict
from .basic import rule_ignore_instructions

def run_rules(text: str) -> List[Dict]:
    """Run all rules against the input text and return findings."""
    findings = []
    
    # Run the ignore-instructions rule
    result = rule_ignore_instructions(text)
    if result:
        findings.extend(result)   # ✅ extend instead of append
    
    return findings
