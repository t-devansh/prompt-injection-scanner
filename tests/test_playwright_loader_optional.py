import pytest

playwright = pytest.importorskip("playwright.sync_api", reason="Playwright not installed")

from src.loader.playwright_loader import load_url_with_playwright

def test_playwright_loads_example_com():
    lp = load_url_with_playwright("https://example.com", wait="networkidle")
    assert "<title>Example Domain</title>" in lp.html
    assert isinstance(lp.network, list)
