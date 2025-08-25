# src/finder/surfaces.py
from __future__ import annotations
from dataclasses import dataclass
from typing import List, Dict
from bs4 import BeautifulSoup  # we'll vendor lightweight parsing via bs4
import re

@dataclass
class Surface:
    role: str                 # "user_input" | "rendered_user_content" | "ai_output" | "other"
    selector: str             # CSS-ish selector
    sample_text: str          # short, masked text
    visible: bool             # naive heuristic

def _css_selector(el) -> str:
    # very naive: tag + id or tag + nth-of-type
    if el.get("id"):
        return f"{el.name}#{el.get('id')}"
    # count position among same-tag siblings
    idx = 1
    for sib in el.previous_siblings:
        if getattr(sib, "name", None) == el.name:
            idx += 1
    return f"{el.name}:nth-of-type({idx})"

def _text_sample(el_text: str, max_len: int = 80) -> str:
    s = re.sub(r"\s+", " ", (el_text or "")).strip()
    if len(s) > max_len:
        s = s[: max_len - 1] + "…"
    # mask basic secrets-looking chunks (toy)
    s = re.sub(r"[A-Za-z0-9]{24,}", "***MASKED***", s)
    return s

def _is_visible(el) -> bool:
    style = (el.get("style") or "").lower()
    if "display:none" in style or "visibility:hidden" in style:
        return False
    return True

def find_surfaces(html: str) -> List[Surface]:
    soup = BeautifulSoup(html or "", "html.parser")
    surfaces: List[Surface] = []

    # 1) user input candidates
    for el in soup.select("input, textarea, [contenteditable]"):
        role = "user_input"
        if el.name == "input":
            t = (el.get("type") or "").lower()
            if t in {"hidden", "submit", "button", "image", "reset", "checkbox", "radio", "file"}:
                continue
        sel = _css_selector(el)
        txt = el.get("value") or el.get_text()
        surfaces.append(Surface(role, sel, _text_sample(txt), _is_visible(el)))

    # 2) rendered user content (very naive: things that often hold user text)
    for el in soup.select("article, .comment, .post, .message, .chat-message, .user-content, [data-user-content]"):
        sel = _css_selector(el)
        txt = el.get_text(separator=" ")
        if txt.strip():
            surfaces.append(Surface("rendered_user_content", sel, _text_sample(txt), _is_visible(el)))

    # 3) AI output (very naive: common classes/areas)
    for el in soup.select(".ai-output, .assistant, .model-reply, [data-ai-output]"):
        sel = _css_selector(el)
        txt = el.get_text(separator=" ")
        if txt.strip():
            surfaces.append(Surface("ai_output", sel, _text_sample(txt), _is_visible(el)))

    return surfaces
