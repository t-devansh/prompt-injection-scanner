from fastapi import FastAPI
from datetime import datetime, timezone
from .schemas import ScanRequest, ScanResponse, ScanSummary

app = FastAPI(title="Prompt-Injection Risk Scanner", version="0.1.0")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/scan", response_model=ScanResponse)
def scan(request: ScanRequest):
    target = request.url or "inline-html"
    now = datetime.now(timezone.utc).isoformat()
    summary = ScanSummary(
        counts={"high": 0, "medium": 0, "low": 0},
        scanned_at=now,
        target=target
    )
    return ScanResponse(summary=summary, findings=[])
