# src/loader/playwright_loader.py
from typing import List
from src.loader.html_loader import LoadedPage  # url, html, headers, network

def load_url_with_playwright(url: str, wait: str = "networkidle") -> LoadedPage:
    """
    Render the page with Playwright (if installed) and capture network.
    Raises RuntimeError if Playwright isn't available, so callers can fallback.
    """
    try:
        from playwright.sync_api import sync_playwright
    except Exception as e:
        raise RuntimeError("playwright not installed") from e

    network: List[str] = []
    headers = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # capture simple response log
        def _on_response(resp):
            try:
                req = resp.request
                network.append(f"{req.method} {resp.url} -> {resp.status}")
            except Exception:
                pass

        page.on("response", _on_response)
        page.goto(url, wait_until=wait)
        html = page.content()

        # attempt to read some headers from main response (best-effort)
        try:
            main = page.main_frame
            # Playwright doesn’t expose headers of the *final* response directly here; skip.
        except Exception:
            pass

        page.close()
        context.close()
        browser.close()

    return LoadedPage(url=url, html=html, headers=headers, network=network)
