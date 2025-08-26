from fastapi.testclient import TestClient
from src.api.main import app
import re

client = TestClient(app)

def test_report_contains_anchor_selector_and_toc():
    html = "<div><input id='q'><div class='ai-output'>AI reply</div></div>"
    r = client.post("/report", json={"html": html})
    assert r.status_code == 200
    body = r.text

    # accept any index for HX1 anchor: id="f-<n>-HX1"
    assert re.search(r'id="f-\d+-HX1"', body, flags=re.IGNORECASE)

    # selector is rendered in a <code> block
    assert "<code>div.ai-output</code>" in body

    # a TOC link exists
    assert "<ul" in body and "</ul>" in body
