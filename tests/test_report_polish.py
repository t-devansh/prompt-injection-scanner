from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

def test_report_contains_anchor_selector_and_toc():
    html = "<div><input id='q'><div class='ai-output'>AI reply</div></div>"
    r = client.post("/report", json={"html": html})
    assert r.status_code == 200
    body = r.text
    # has an anchor id pattern for HX1 (first and only)
    assert 'id="f-1-HX1"' in body or 'id="f-1-hx1"' in body.lower()
    # selector is rendered in a <code> block
    assert "<code>div.ai-output</code>" in body
    # a TOC link exists
    assert "<ul" in body and "</ul>" in body
