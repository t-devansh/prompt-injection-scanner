from dataclasses import dataclass
from html.parser import HTMLParser
from typing import List, Dict, Optional

@dataclass
class Surface:
    role: str                # "user_input" | "rendered_user_content" | "ai_output"
    selector: str            # "tag#id" | "tag.class" | "tag"
    sample_text: str
    visible: bool

__all__ = ["Surface", "find_surfaces"]

# ---- Lightweight DOM representation (stdlib only) ----

class Node:
    __slots__ = ("tag", "attrs", "children", "parent", "text", "_hidden_self")
    def __init__(self, tag: str, attrs: Dict[str, str], parent: Optional["Node"]):
        self.tag = tag.lower()
        # normalize attrs -> dict (lowercase keys)
        self.attrs = { (k.lower() if isinstance(k, str) else k): (v if v is not None else "") for k, v in attrs.items() }
        self.children: List["Node"] = []
        self.parent: Optional["Node"] = parent
        self.text: List[str] = []     # accumulate text nodes
        self._hidden_self: Optional[bool] = None  # cache own-visibility (not ancestor)
    def append(self, child: "Node"):
        self.children.append(child)
        child.parent = self
    def add_text(self, data: str):
        if data:
            self.text.append(data)
    def get_attr(self, name: str) -> Optional[str]:
        return self.attrs.get(name.lower())
    def classes(self) -> List[str]:
        cls = self.get_attr("class")
        if not cls:
            return []
        # split on whitespace
        return [c for c in cls.replace("\t"," ").replace("\n"," ").split(" ") if c]
    def own_visible(self) -> bool:
        """Visibility of this node ignoring ancestors."""
        if self._hidden_self is not None:
            return self._hidden_self
        # hidden flag
        if "hidden" in self.attrs:
            self._hidden_self = False
            return False
        # aria-hidden
        aria_hidden = self.get_attr("aria-hidden")
        if isinstance(aria_hidden, str) and aria_hidden.strip().lower() == "true":
            self._hidden_self = False
            return False
        # style checks
        style = self.get_attr("style") or ""
        style_l = style.lower()
        if "display:none" in style_l or "visibility:hidden" in style_l:
            self._hidden_self = False
            return False
        # input type=hidden
        if self.tag == "input":
            ty = (self.get_attr("type") or "").lower()
            if ty == "hidden":
                self._hidden_self = False
                return False
        self._hidden_self = True
        return True
    def visible(self) -> bool:
        node = self
        while node is not None:
            if not node.own_visible():
                return False
            node = node.parent
        return True
    def iter_text(self) -> List[str]:
        out: List[str] = []
        def rec(n: "Node", skip=False):
            # skip text inside script/style
            sk = skip or (n.tag in ("script","style"))
            if n.text and not sk:
                out.extend(n.text)
            for ch in n.children:
                rec(ch, sk)
        rec(self, False)
        return out
    def descendant_has_tag(self, tags: set) -> bool:
        for ch in self.children:
            if ch.tag in tags or ch.descendant_has_tag(tags):
                return True
        return False

class DOMBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("document", {}, None)
        self.stack = [self.root]
    def handle_starttag(self, tag, attrs):
        # attrs is a list of (key, value). Convert to dict (last wins).
        ad = {}
        for k, v in attrs:
            # In HTML, attributes without value may appear (e.g., "hidden")
            if v is None:
                ad[k] = ""
            else:
                ad[k] = v
        node = Node(tag, ad, self.stack[-1])
        self.stack[-1].append(node)
        # void elements shouldn't push
        if tag.lower() in ("area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"):
            return
        self.stack.append(node)
    def handle_endtag(self, tag):
        # pop until matching tag or root
        tag_l = tag.lower()
        for i in range(len(self.stack)-1, -1, -1):
            if self.stack[i].tag == tag_l:
                del self.stack[i:]
                break
    def handle_data(self, data):
        if data:
            self.stack[-1].add_text(data)
    def error(self, message):
        pass

# ---- Utilities ----

def collapse_ws(s: str, limit: int = 200) -> str:
    import re
    s = re.sub(r"\s+", " ", s or "").strip()
    if len(s) > limit:
        return s[:limit-1] + "…"
    return s

def build_selector(node: Node) -> str:
    tag = node.tag
    id_attr = node.get_attr("id")
    if id_attr:
        return f"{tag}#{id_attr}"
    classes = node.classes()
    if classes:
        return f"{tag}.{classes[0]}"
    return tag

# ---- Role detection heuristics ----

USER_INPUT_TAGS = {"input","textarea","select"}
RENDERED_CONTENT_TAGS = {"article","blockquote","p","div","section"}
RENDERED_CLASS_HINTS = (
    "user", "user-content", "content", "post", "comment", "message",
    "markdown", "md", "thread", "reply", "body"
)
AI_OUTPUT_HINTS = (
    "ai", "assistant", "model", "gpt", "llm", "bot", "answer", "output", "response"
)

def is_rendered_user_content(node: Node) -> bool:
    if node.tag in RENDERED_CONTENT_TAGS:
        idcls = " ".join(filter(None, [node.get_attr("id"), node.get_attr("class") or ""])) .lower()
        # strong hints
        for h in RENDERED_CLASS_HINTS:
            if h in idcls:
                return True
    return False

def is_ai_output(node: Node) -> bool:
    idcls = " ".join(filter(None, [node.get_attr("id"), node.get_attr("class") or ""])) .lower()
    for h in AI_OUTPUT_HINTS:
        if h in idcls:
            return True
    # also common tags with data-role or role attributes
    role_attr = (node.get_attr("role") or "").lower()
    if "status" in role_attr or "log" in role_attr:
        # coarse, but many chatbots render in live-region/status containers
        return True
    return False

def input_sample(node: Node) -> str:
    # textarea text resides as child text
    if node.tag == "textarea":
        return collapse_ws("".join(node.iter_text()))
    if node.tag == "select":
        # prefer selected option text
        for opt in node.children:
            if opt.tag != "option":
                continue
            sel = (opt.get_attr("selected") is not None) or ((opt.get_attr("aria-selected") or "").lower() == "true")
            if sel:
                return collapse_ws("".join(opt.iter_text()))
        # fallback: first option
        for opt in node.children:
            if opt.tag == "option":
                return collapse_ws("".join(opt.iter_text()))
        return ""
    # input
    val = node.get_attr("value") or ""
    if val.strip():
        return collapse_ws(val)
    ph = node.get_attr("placeholder") or ""
    return collapse_ws(ph)

def collect_text(node: Node) -> str:
    return collapse_ws("".join(node.iter_text()))

def find_surfaces(html: str) -> List[Surface]:
    """Parse HTML and return a list of Surface objects with role/selector/sample_text/visible."""
    if not isinstance(html, str):
        html = "" if html is None else str(html)
    parser = DOMBuilder()
    try:
        parser.feed(html)
        parser.close()
    except Exception:
        # still attempt to use what we have
        pass

    out: List[Surface] = []

    def traverse(n: Node):
        # visit children
        for ch in n.children:
            # Determine role
            role: Optional[str] = None
            sample: str = ""
            if ch.tag in USER_INPUT_TAGS:
                role = "user_input"
                sample = input_sample(ch)
            elif is_ai_output(ch):
                role = "ai_output"
                sample = collect_text(ch)
            elif is_rendered_user_content(ch):
                role = "rendered_user_content"
                sample = collect_text(ch)
            # Visibility
            visible = ch.visible()
            if role:
                sel = build_selector(ch)
                # if sample is empty for inputs, that's fine; but prefer something
                out.append(Surface(role=role, selector=sel, sample_text=sample, visible=visible))
            traverse(ch)

    traverse(parser.root)
    return out
