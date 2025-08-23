from fastapi import FastAPI, APIRouter
from src.loader.html_loader import load_from_html
from datetime import datetime, timezone
from .schemas import ScanRequest, ScanResponse, ScanSummary

app = FastAPI(title="Prompt-Injection Risk Scanner", version="0.1.0")
router = APIRouter()

@app.get("/health")
def health():
    return {"status": "ok"}

@router.post("/scan", response_model=ScanResponse)
def scan(request: ScanRequest):
    # must provide exactly one of url or html
    if (request.url and request.html) or (not request.url and not request.html):
        return {"error": "must provide exactly one of url or html"}

    target = request.url or "inline-html"
    now = datetime.now(timezone.utc).isoformat()

    # normalize if html is provided (not used yet)
    if request.html:
        _lp = load_from_html(request.html, url=None)

    summary = ScanSummary(
        counts={"high": 0, "medium": 0, "low": 0},
        scanned_at=now,
        target=target
    )
    return ScanResponse(summary=summary, findings=[])

# register routes on the app
app.include_router(router)
