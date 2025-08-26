from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

HTML_HX1 = """
<div>
  <input id="q" type="text" value="hello">
  <div class="ai-output">Assistant reply</div>
</div>
"""

def test_scan_fail_on_medium_trips_conflict():
    # HX1 is medium by scoring table
    r = client.post("/scan?fail_on=medium", json={"html": HTML_HX1})
    assert r.status_code == 409
    data = r.json()
    assert any(f["rule_id"] == "HX1" for f in data["findings"])
    # summary counts should still be present
    assert "counts" in data["summary"]

def test_scan_fail_on_high_allows_200():
    # HX1 is medium; fail_on=high should NOT trip
    r = client.post("/scan?fail_on=high", json={"html": HTML_HX1})
    assert r.status_code == 200
