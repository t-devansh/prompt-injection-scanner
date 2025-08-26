from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

def test_report_download_header_present():
    html = "<div><input><div class='ai-output'>AI</div></div>"
    r = client.post("/report?download=1&filename=my.html", json={"html": html})
    assert r.status_code == 200
    cd = r.headers.get("content-disposition", "")
    assert "attachment" in cd.lower()
    assert "my.html" in cd
    assert r.headers.get("content-type", "").startswith("text/html")
