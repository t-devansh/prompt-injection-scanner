# tests/test_url_loader.py
import pytest
from src.loader.url_loader import load_url_with_playwright
from src.loader.html_loader import LoadedPage

@pytest.mark.skip("Playwright not available in CI yet")
def test_load_url_with_playwright_stub():
    lp = load_url_with_playwright("https://example.com")
    assert isinstance(lp, LoadedPage)
    assert lp.url.startswith("http")
