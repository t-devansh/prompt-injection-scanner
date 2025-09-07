# src/loader/url_loader.py
from typing import List
from .html_loader import LoadedPage  # dataclass: url, html, headers, network
import httpx
from src.config import get_http_timeout

def load_from_url(url: str, timeout: float | None = None) -> LoadedPage:
    """
    Simple HTTP loader using httpx. Fetches the final HTML and headers.
    Returns a LoadedPage; keeps 'network' as a minimal single-line log.
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }
    t = timeout if timeout is not None else get_http_timeout()
    with httpx.Client(follow_redirects=True, timeout=t, headers=headers) as client:
        resp = client.get(url)
        resp.raise_for_status()
        html = resp.text
        network = [f"{resp.request.method} {resp.request.url} -> {resp.status_code}"]
        return LoadedPage(
            url=str(resp.request.url),
            html=html,
            headers=dict(resp.headers),
            network=network,
        )

def load_from_url(url: str, timeout: float = 15.0) -> LoadedPage:
    """
    Simple HTTP loader using httpx. Fetches the final HTML and headers.
    Returns a LoadedPage; keeps 'network' as a minimal single-line log.
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }
    with httpx.Client(follow_redirects=True, timeout=timeout, headers=headers) as client:
        resp = client.get(url)
        resp.raise_for_status()
        html = resp.text
        # Minimal network trail (expand later)
        network = [f"{resp.request.method} {resp.request.url} -> {resp.status_code}"]
        return LoadedPage(
            url=str(resp.request.url),
            html=html,
            headers=dict(resp.headers),
            network=network,  # type: List[str]
        )


# keep existing Playwright stub below (unchanged)
def load_url_with_playwright(url: str, wait: str = "networkidle") -> LoadedPage:
    """
    Skeleton/stub. Real implementation will use Playwright (later).
    """
    return LoadedPage(
        url=url,
        html="<!doctype html><title>stub</title>",
        headers={},
        network=[]  # type: List[str]
    )
