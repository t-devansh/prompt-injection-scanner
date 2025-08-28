from fastapi.testclient import TestClient
from src.api.main import app
from src.loader.html_loader import LoadedPage

client = TestClient(app)

def test_rendered_flag_gracefully_falls_back_when_playwright_missing(monkeypatch):
    # simulate playwright loader raising
    import src.api.main as api_main
    monkeypatch.setattr("src.api.main.load_url_with_playwright", lambda url: (_ for _ in ()).throw(RuntimeError("playwright not installed")))

    # stub httpx loader to avoid real network
    def fake_httpx_loader(url: str) -> LoadedPage:
        return LoadedPage(url=url, html="<html><body><p>ok</p></body></html>", headers={}, network=["GET http://fake -> 200"])
    monkeypatch.setattr("src.api.main.load_from_url", fake_httpx_loader)

    r = client.post("/scan?rendered=1", json={"url": "https://example.com"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data.get("findings"), list)
    assert "counts" in data.get("summary", {})
