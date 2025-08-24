# tests/test_scan_url.py
from fastapi.testclient import TestClient
from src.api.main import app
from src.loader.html_loader import LoadedPage

client = TestClient(app)

def test_scan_with_url_wires_loader(monkeypatch):
    # fake loader to avoid http calls
    def fake_loader(url: str):
        return LoadedPage(
            url=url,
            html="<!doctype html><title>ok</title>",
            headers={"Content-Type": "text/html"},
            network=["GET https://example.com -> 200"]
        )

    # monkeypatch our load_from_url
    import src.loader.url_loader as url_loader
    monkeypatch.setattr(url_loader, "load_from_url", fake_loader)

    resp = client.post("/scan", json={"url": "https://example.com"})
    assert resp.status_code == 200
    data = resp.json()
    # summary exists and target echoes the URL
    assert data["summary"]["target"] == "https://example.com"
    # still stubbed findings for now
    assert data["findings"] == []
