from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

def test_scan_requires_exactly_one_input():
    assert client.post("/scan", json={}).status_code == 422
    assert client.post("/scan", json={"url":"https://x.com","html":"<p/>"}).status_code == 422

def test_scan_accepts_html_stub():
    r = client.post("/scan", json={"html":"<p>Hello</p>"})
    assert r.status_code == 200
    data = r.json()
    assert "summary" in data and "findings" in data
    assert data["summary"]["counts"] == {"high":0,"medium":0,"low":0}
