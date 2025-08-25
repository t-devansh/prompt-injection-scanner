# src/rules/dampener.py
import re
from typing import Dict

_FENCE_PATTERNS = [
    re.compile(r"(^|[\r\n])\s*```.+?```", re.DOTALL),           # markdown fenced
    re.compile(r"<pre\b[^>]*>\s*<code\b[^>]*>.*?</code>\s*</pre>", re.DOTALL|re.IGNORECASE),
    re.compile(r"&lt;[^&]+&gt;"),                               # lots of escaped tags
]

def looks_fenced_or_escaped(text: str) -> bool:
    if not text:
        return False
    t = text if len(text) <= 200_000 else text[:200_000]
    return any(p.search(t) for p in _FENCE_PATTERNS)

def apply_dampener(text: str, finding: Dict) -> Dict:
    """Reduce confidence/severity a bit when content appears safely fenced/escaped."""
    if not looks_fenced_or_escaped(text):
        return finding

    conf = finding.get("confidence")
    try:
        conf = float(conf) if conf is not None else None
    except Exception:
        conf = None

    if conf is not None:
        conf = max(0.0, conf - 0.2)
        finding["confidence"] = conf

    sev = (finding.get("severity") or "").lower()
    if sev == "high" and (conf is None or conf < 0.6):
        finding["severity"] = "medium"
    return finding