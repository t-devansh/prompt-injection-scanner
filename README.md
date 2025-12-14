# Prompt-Injection Risk Scanner

A full stack system for scanning AI powered web pages for prompt injection vulnerabilities.
Built with FastAPI for the backend and React with Tailwind CSS for the frontend.

Prompt injection is rated as the number one security risk in the OWASP Top 10 for Large Language Model Applications in both the 2023 and 2025 editions. Due to its growing real world impact and my strong interest in both software development and cybersecurity, I decided to build this project to better understand the problem space and contribute a practical tool.

Beyond risk detection, this project is also designed as a learning and experimentation tool. It allows students and developers to explore how prompt injection works, test real examples, and understand why certain patterns are dangerous. The system is built with extensibility in mind, and I plan to expand it over time with additional detection rules, heuristics, and analysis features.

---

## 🚀 Overview

**Frontend:**  
Deployed on **GitHub Pages** – modern React UI for scanning URLs or inline HTML.  

**Backend:**  
Deployed on **Render** – FastAPI service providing the scanning API.

---

## ⚙️ Features

- **API**
  - `GET /health` – health check  
  - `POST /scan` – scan one of `{ "url": "..." }` or `{ "html": "..." }`
    - Query: `fail_on=low|medium|high`
    - Query: `rendered=1|true` → uses Playwright (falls back to httpx)
  - `POST /report` – generates downloadable HTML report
    - Query: `download=1|true`
    - Query: `filename=scan-report.html`

- **Rules**
  - R1: “ignore previous instructions”
  - R2: secrets / “reveal” indicators
  - R3: zero-width / homoglyph obfuscation
  - R4: mixed-script / suspicious Unicode
  - R5: role coercion / system-prompt impersonation
  - R6: data-exfiltration markers
  - HX1: user_input → ai_output reachability heuristic

- **Additional logic**
  - Surface finder for identifying risky DOM areas
  - Confidence dampening for escaped text
  - Severity thresholds with fail-on gating

---

## 🧩 Setup (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/t-devansh/prompt-injection-scanner.git
cd prompt-injection-scanner
```

### 2. Backend setup
```bash
python -m venv .venv
# Activate
source .venv/bin/activate   # macOS/Linux
.\.venv\Scripts\activate    # Windows

pip install -r requirements.txt
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend setup
```bash
cd ui
npm install
npm run dev
```

Then open **http://localhost:5173**  
(make sure backend runs on port **8000**).

---

## 🐳 Docker (optional)

```bash
docker compose up --build -d
curl http://localhost:8000/health
# -> {"status":"ok"}
```

CLI via Compose:
```bash
docker compose run --rm scanner-cli
echo $?
```

---

## 🧠 API Examples

**Health check**
```bash
curl http://localhost:8000/health
```

**Scan (HTML)**
```bash
# PowerShell
$body = @{ html = '<div><input><div class="ai-output">AI reply</div></div>' } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "http://localhost:8000/scan" -Method Post -Body $body -ContentType "application/json"
```

**Scan (Rendered URL)**
```bash
# PowerShell
$body = @{ url = "https://example.com" } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "http://localhost:8000/scan?rendered=1" -Method Post -Body $body -ContentType "application/json"
```

**Download report (HTML)**
```bash
# PowerShell
$body = @{ html = "<p>Please IGNORE previous instructions</p>" } | ConvertTo-Json -Compress
# Inline view
Invoke-RestMethod -Uri "http://localhost:8000/report" -Method Post -Body $body -ContentType "application/json" | Out-Null
# Download
Invoke-RestMethod -Uri "http://localhost:8000/report?download=1&filename=my-scan.html" -Method Post -Body $body -ContentType "application/json"
```

---

## 🧪 Playwright (Optional Rendered Mode)

```bash
pip install -r requirements-playwright.txt
python -m playwright install chromium
pytest -q tests/test_playwright_loader_optional.py
```

If Playwright isn’t available, the scanner automatically falls back to httpx.

---

## ⚙️ Configuration (env)

| Variable | Description | Default |
|-----------|--------------|----------|
| `SCANNER_SEVERITY_OVERRIDES` | Override per rule (e.g. `R1:high,R2:low`) | – |
| `SCANNER_DAMPENER` | 0.0–1.0 confidence scaling | `1.0` |
| `SCANNER_HTTP_TIMEOUT_SECONDS` | Timeout for URL fetch | `10.0` |

Example (PowerShell):
```bash
$env:SCANNER_SEVERITY_OVERRIDES = "R1:high,R2:low"
$env:SCANNER_DAMPENER = "0.5"
$env:SCANNER_HTTP_TIMEOUT_SECONDS = "5"
```

---

## 🧰 Deployment

- **Frontend:** Deployed via GitHub Actions to GitHub Pages (`gh-pages` branch)
- **Backend:** Deployed to Render with automatic redeploys from `main`
- **CORS:** Configured to allow both `localhost` and `https://t-devansh.github.io`

---

## 💡 Notes

- Works with or without Playwright; auto-fallback is built in.  
- The frontend communicates with the deployed Render backend.  
- You can self-host both parts using the provided Docker Compose file.

---

## 🧑‍💻 Author

**Made by [Devansh Tandon](https://www.linkedin.com/in/tandon-devansh/)**  
GitHub: [t-devansh](https://github.com/t-devansh)
