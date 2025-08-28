# Prompt-Injection Risk Scanner (MVP scaffold)

FastAPI service that will scan AI-powered pages for prompt-injection risks.  
This repo currently ships a working API skeleton + tests + Docker one-command run.

## Quickstart (Docker)

```bash
docker compose up --build -d

curl http://localhost:8000/health
# -> {"status":"ok"}
```

## Local dev (Windows PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest -q
uvicorn src.api.main:app --reload
```

## API

- `GET /health` → `{"status":"ok"}`

- `POST /scan` → accepts **exactly one** of:
  - `{ "url": "..." }`
  - `{ "html": "<p>...</p>" }`  
  Returns a stub summary.

## Roadmap

Surface finder, rule engine, scoring, and HTML report (see Issues & Project board).

### Rendered scanning (optional Playwright)

Rendered scans use a headless browser to capture the DOM/network:

```bash
# optional: only if you want rendered mode locally
pip install -r requirements-playwright.txt
python -m playwright install chromium

# CLI
python -m src.cli --url https://example.com --fail-on high
# API
POST /scan?rendered=1 { "url": "https://example.com" }
