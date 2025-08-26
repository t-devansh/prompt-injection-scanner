import argparse, sys, json
from src.loader.html_loader import load_from_html
from src.loader.url_loader import load_from_url
from src.rules.text_utils import html_to_text
from src.rules.runner import run_rules
from src.rules.severity import meets_threshold
from datetime import datetime, timezone

def main():
    p = argparse.ArgumentParser(description="Prompt-Injection Scanner CLI")
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--html", help="Inline HTML to scan")
    g.add_argument("--url", help="URL to fetch and scan")
    p.add_argument("--fail-on", choices=["low", "medium", "high"], help="Fail if findings meet/exceed this severity")
    args = p.parse_args()

    if args.html:
        lp = load_from_html(args.html)
        target = "inline-html"
    else:
        lp = load_from_url(args.url)
        target = args.url

    text = html_to_text(lp.html)
    findings = run_rules(text, html=lp.html)

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

    out = {"summary": summary, "findings": findings}
    print(json.dumps(out, indent=2))

    if meets_threshold(findings, args.fail_on):
        sys.exit(1)

if __name__ == "__main__":
    main()
