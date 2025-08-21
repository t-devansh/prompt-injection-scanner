# src/rules/basic.py
from typing import List, Dict
import re

def rule_ignore_instructions(text: str):
    """Detects 'ignore previous instructions' style injections."""
    if "ignore previous instructions" in text.lower():
        return [{
            "rule_id": "R1", 
            "message": "Ignore previous instructions attempt detected"}]
    return []

