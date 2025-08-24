import unicodedata
from typing import Tuple
import re
from html import unescape

# Common zero-width chars
ZERO_WIDTH = {
    "\u200B",  # ZWSP
    "\u200C",  # ZWNJ
    "\u200D",  # ZWJ
    "\u2060",  # WORD JOINER
    "\uFEFF",  # BOM/ZWNBSP
}

def normalize_text(s: str) -> str:
    """Unicode normalize to NFKC for more consistent matching."""
    return unicodedata.normalize("NFKC", s)

def has_zero_width(s: str) -> Tuple[bool, str]:
    """Return (found, snippet) if any zero-width char is present."""
    for ch in s:
        if ch in ZERO_WIDTH:
            # Create a small visible snippet around the first hit
            idx = s.index(ch)
            start = max(0, idx - 8)
            end = min(len(s), idx + 8)
            # Make the zero-width visible as <ZW-XXXX>
            marker = f"<ZW-{ord(ch):04X}>"
            snippet = (s[start:idx] + marker + s[idx+1:end]).replace("\n", " ")
            return True, snippet
    return False, ""

_TAG_RE = re.compile(r"<[^>]+>")

def html_to_text(html: str) -> str:
    """Very light HTML → visible text conversion for rule matching."""
    # remove tags, unescape entities, collapse whitespace
    no_tags = _TAG_RE.sub(" ", html or "")
    text = " ".join(unescape(no_tags).split())
    return text