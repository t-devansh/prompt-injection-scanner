# src/loader/html_loader.py
from typing import Dict, List, Optional
from pydantic import BaseModel
from dataclasses import dataclass, field

@dataclass
class LoadedPage:
    url: Optional[str]
    html: str
    headers: Dict[str, str] = field(default_factory=dict)
    network: List[str] = field(default_factory=list)

def load_from_html(html: str, url: Optional[str] = None) -> LoadedPage:
    html = html or ""
    return LoadedPage(url=url, html=html, headers={}, network=[])
