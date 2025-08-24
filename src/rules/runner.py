# src/rules/runner.py
from typing import List, Dict
from .basic import rule_ignore_instructions, rule_reveal_secrets

def run_rules(text: str) -> List[Dict]:
    findings: List[Dict] = []
    for rule_fn in (rule_ignore_instructions, rule_reveal_secrets):
        results = rule_fn(text)  # each returns List[Dict]
        if results:
            findings.extend(results)
    return findings