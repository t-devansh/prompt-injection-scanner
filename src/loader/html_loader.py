# src/loader/html_loader.py
from typing import Optional
from pydantic import BaseModel

class LoadedPage(BaseModel):
    url: Optional[str] = None
    html: str
    source: str = "raw_html"  # later: "browser" when we add Playwright

def load_from_html(html: str, url: Optional[str] = None) -> LoadedPage:
    """
    Normalize pasted HTML into a consistent object the scanner can consume.
    """
    return LoadedPage(url=url, html=html, source="raw_html")
