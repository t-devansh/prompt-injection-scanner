# src/cli.py
import argparse, sys, json
from datetime import datetime, timezone
from typing import List, Dict, Any
from src.loader.html_loader import load_from_html
from src.loader.url_loader import load_from_url
from src.rules.text_utils import html_to_text
from src.rules.runner import run_rules
from src.rules.severity import meets_threshold

def _scan_one_html(html: str) -> Dict[str, Any]:
    lp = load_from_html(html)
    target = "inline-html"
    text = html_to_text(lp.html)
    findings = run_rules(text, html=lp.html)
    counts = {"high": 0, "medium": 0, "low": 0}
    for f in findings:
        sev = (f.get("severity") or "").lower()
        if sev in counts: counts[sev] += 1
    summary = {"counts": counts, "scanned_at": datetime.now(timezone.utc).isoformat(), "target": target}
    return {"summary": summary, "findings": findings}

def _scan_one_url(url: str) -> Dict[str, Any]:
    lp = load_from_url(url)
    target = url
    text = html_to_text(lp.html)
    findings = run_rules(text, html=lp.html)
    counts = {"high": 0, "medium": 0, "low": 0}
    for f in findings:
        sev = (f.get("severity") or "").lower()
        if sev in counts: counts[sev] += 1
    summary = {"counts": counts, "scanned_at": datetime.now(timezone.utc).isoformat(), "target": target}
    return {"summary": summary, "findings": findings}

def main():
    p = argparse.ArgumentParser(description="Prompt-Injection Scanner CLI")
    p.add_argument("--html", action="append", help="Inline HTML to scan (can be repeated)")
    p.add_argument("--url", action="append", help="URL to fetch and scan (can be repeated)")
    p.add_argument("--fail-on", choices=["low", "medium", "high"], help="Fail if any finding meets/exceeds this severity")
    p.add_argument("--json-only", action="store_true", help="Reserved: print JSON only (default behavior)")
    args = p.parse_args()

    if not args.html and not args.url:
        p.error("Provide at least one --html or --url")

    results: List[Dict[str, Any]] = []
    if args.html:
        for h in args.html: results.append(_scan_one_html(h))
    if args.url:
        for u in args.url: results.append(_scan_one_url(u))

    if len(results) == 1:
        out = results[0]
        print(json.dumps(out, indent=2))
        if meets_threshold(out.get("findings", []), args.fail_on): sys.exit(1)
        sys.exit(0)

    aggregate_counts = {"high": 0, "medium": 0, "low": 0}
    all_findings = []
    for r in results:
        c = r["summary"]["counts"]
        for k in aggregate_counts: aggregate_counts[k] += int(c.get(k, 0))
        all_findings.extend(r.get("findings", []))
    failed = meets_threshold(all_findings, args.fail_on)

    multi_out = {
        "aggregate": {"targets": len(results), "counts": aggregate_counts, "failed_threshold": bool(failed), "fail_on": args.fail_on},
        "results": results,
    }
    print(json.dumps(multi_out, indent=2))
    sys.exit(1 if failed else 0)

if __name__ == "__main__":
    main()
