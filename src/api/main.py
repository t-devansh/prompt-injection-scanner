from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse, JSONResponse
from datetime import datetime, timezone

from src.api.schemas import ScanRequest, ScanResponse, ScanSummary
from src.loader.html_loader import load_from_html
from src.loader.url_loader import load_from_url
from src.rules.text_utils import html_to_text
from src.rules.runner import run_rules
from src.rules.severity import meets_threshold
from src.finder.surfaces import find_surfaces  # if you still want to compute surfaces
from src.report.html_report import render_report



app = FastAPI(title="Prompt-Injection Risk Scanner", version="0.1.0")
router = APIRouter()


@router.get("/health")
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
def scan(request: ScanRequest, fail_on: str | None = Query(default=None, pattern="^(low|medium|high)$")):
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
        lp = load_from_html(request.html)  # no url kwarg

    # Extract text and run rules
    text = html_to_text(lp.html)
    findings = run_rules(text, html=lp.html)

    # (Optional) surfaces for future use
    _ = find_surfaces(lp.html)

    # Build summary
    counts = {"high": 0, "medium": 0, "low": 0}
    for f in findings:
        sev = (f.get("severity") or "").lower()
        if sev in counts:
            counts[sev] += 1

    summary = ScanSummary(
        counts=counts,
        scanned_at=now,
        target=target,
    )

    resp = ScanResponse(summary=summary, findings=findings)

    # Fail-on severity gate
    if meets_threshold(findings, fail_on):
        return JSONResponse(status_code=409, content=resp.model_dump())

    return resp


@router.post("/report", response_class=HTMLResponse)
def report(
    req: ScanRequest,
    download: str | None = Query(default=None),   # accept "1", "true", "yes", etc.
    filename: str | None = Query(default=None)):
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

    # Build summary
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

    # Normalize "download" truthiness
    flag = (download or "").strip().lower()
    is_download = flag in {"1", "true", "yes", "y", "on"}

    if is_download:
        fname = filename or "scan-report.html"
        headers = {"Content-Disposition": f'attachment; filename="{fname}"'}
        return HTMLResponse(content=html_out, headers=headers, status_code=200)

    return HTMLResponse(content=html_out, status_code=200)

app.include_router(router)