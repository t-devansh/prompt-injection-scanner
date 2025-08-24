# src/rules/normalize.py
import re

# Zero-width characters: ZWSP, ZWNJ, ZWJ, WORD JOINER, INVISIBLE SEP/PLUS/TIMES, BOM/ZWNBSP, etc.
ZERO_WIDTH_CHARS = r"\u200B\u200C\u200D\u2060\u2061\u2062\u2063\uFEFF"
ZERO_WIDTH_RE = re.compile(f"[{ZERO_WIDTH_CHARS}]")

# Script ranges
_LATIN     = r"\u0041-\u005A\u0061-\u007A"   # A-Z a-z
_CYRILLIC  = r"\u0400-\u04FF"
_GREEK     = r"\u0370-\u03FF"

LATIN_RE     = re.compile(f"[{_LATIN}]")
CYRILLIC_RE  = re.compile(f"[{_CYRILLIC}]")
GREEK_RE     = re.compile(f"[{_GREEK}]")

def has_zero_width(text: str):
    """
    Return (found: bool, snippet: str). Snippet makes the location visible for evidence.
    """
    m = ZERO_WIDTH_RE.search(text or "")
    if not m:
        return False, ""
    i = m.start()
    start = max(0, i - 8)
    end = min(len(text), i + 8)
    marker = f"<ZW-{ord(text[i]):04X}>"
    snippet = (text[start:i] + marker + text[i+1:end]).replace("\n", " ")
    return True, snippet

def looks_mixed_script(text: str) -> bool:
    """Very light heuristic: contains Latin AND (Cyrillic OR Greek)."""
    t = text or ""
    has_latin = LATIN_RE.search(t) is not None
    has_cyr   = CYRILLIC_RE.search(t) is not None
    has_gr    = GREEK_RE.search(t) is not None
    return has_latin and (has_cyr or has_gr)
