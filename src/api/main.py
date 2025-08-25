# at the top of src/api/main.py
from fastapi import FastAPI, APIRouter
from fastapi.responses import HTMLResponse
from datetime import datetime, timezone
from src.finder.surfaces import find_surfaces

from src.api.schemas import ScanRequest, ScanResponse, ScanSummary
from src.loader.html_loader import load_from_html
from src.loader.url_loader import load_from_url
from src.rules.text_utils import html_to_text
from src.rules.runner import run_rules
from src.report.html_report import render_report

app = FastAPI(title="Prompt-Injection Risk Scanner", version="0.1.0")
router = APIRouter()


@app.get("/health")
def health():
    return {"status": "ok"}


def _count_by_severity(findings):
    counts = {"high": 0, "medium": 0, "low": 0}
    for f in findings:
        sev = (f.get("severity") or "").lower()
        if sev in counts:
            counts[sev] += 1
    return counts


def html_to_text(html: str) -> str:
    # extremely simple HTML → text for now
    # keeps it dependency‑free; we’ll improve later if needed
    import re
    text = re.sub(r"<[^>]+>", " ", html)       # strip tags
    text = re.sub(r"\s+", " ", text).strip()   # collapse whitespace
    return text


@router.post("/scan", response_model=ScanResponse)
def scan(request: ScanRequest):
    # must provide exactly one of url or html
    if (request.url and request.html) or (not request.url and not request.html):
        raise HTTPException(status_code=400, detail="must provide exactly one of url or html")

    target = request.url or "inline-html"
    now = datetime.now(timezone.utc).isoformat()

    # Normalize to a LoadedPage
    if request.url:
        try:
            lp = load_from_url(request.url)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"failed to fetch url: {e}")
    else:
        lp = load_from_html(request.html, url=None)

    # Extract text and run rules
    text = html_to_text(lp.html)
    findings = run_rules(text, html=lp.html)

    surfaces = find_surfaces(lp.html)  # not returned yet; will use for reachability soon
    # findings already computed via run_rules(text)

    summary = ScanSummary(
        counts=_count_by_severity(findings),
        scanned_at=now,
        target=target,
    )
    return ScanResponse(summary=summary, findings=findings)


app.include_router(router)

@app.post("/report", response_class=HTMLResponse)
def report(req: ScanRequest):
    # Normalize to LoadedPage (lp)
    if req.html:
        lp = load_from_html(req.html)
        target = "inline-html"
    else:
        lp = load_from_url(req.url)  # type: ignore[arg-type]
        target = req.url or "url"

    # Run rules
    text = html_to_text(lp.html)
    findings = run_rules(text, html=lp.html)

    # Build summary (reuse your logic if already exists)
    counts = {"high": 0, "medium": 0, "low": 0}
    for f in findings:
        sev = (f.get("severity") or "").lower()
        if sev in counts:
            counts[sev] += 1

    summary = {
        "counts": counts,
        "scanned_at": datetime.now(timezone.utc).isoformat(),
        "target": target,
    }

    html_out = render_report(summary, findings)
    return HTMLResponse(content=html_out, status_code=200)
