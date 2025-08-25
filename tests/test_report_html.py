from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

def test_report_returns_html():
    html = """
    <div>
      <input id="q" type="text" value="hello">
      <div class="ai-output">Assistant reply</div>
    </div>
    """
    resp = client.post("/report", json={"html": html})
    assert resp.status_code == 200
    body = resp.text
    assert "<html" in body.lower()
    assert "scan report" in body.lower()
    # HX1 should appear as a card title or badge region
    assert "potential user→ai reachability".lower() in body.lower()
