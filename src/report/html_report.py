# src/report/html_report.py
from typing import Any, Dict, List
import html

def _badge(sev: str) -> str:
    sev = (sev or "").lower()
    colors = {"high": "#b91c1c", "medium": "#b45309", "low": "#065f46"}
    return f'<span style="padding:2px 8px;border-radius:9999px;background:{colors.get(sev,"#374151")};color:white;font-size:12px;">{html.escape(sev.title())}</span>'

def _escape(s: Any) -> str:
    return html.escape("" if s is None else str(s))

def render_report(summary: Dict[str, Any], findings: List[Dict[str, Any]]) -> str:
    # header counts
    counts = summary.get("counts", {})
    h = int(counts.get("high", 0))
    m = int(counts.get("medium", 0))
    l = int(counts.get("low", 0))

    # cards
    cards = []
    for f in findings:
        rule_id = _escape(f.get("rule_id"))
        title = _escape(f.get("title"))
        sev = _escape(f.get("severity"))
        conf = f.get("confidence")
        conf_str = f"{conf:.2f}" if isinstance(conf, (int, float)) else _escape(conf)
        evidence = _escape(f.get("evidence"))
        selector = _escape(f.get("selector"))
        details = f.get("details") or {}
        in_sel = _escape(details.get("input_selector"))
        out_sel = _escape(details.get("output_selector"))

        cards.append(f"""
        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;margin:10px 0;background:#fff;">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
            <code style="font-size:12px;color:#6b7280;">{rule_id}</code>
            {_badge(sev)}
            <span style="font-size:12px;color:#6b7280;">Confidence: {conf_str}</span>
          </div>
          <div style="font-weight:600;margin-bottom:6px;">{title}</div>
          {"<div style='color:#374151;margin-bottom:6px;'>"+evidence+"</div>" if evidence else ""}
          {"<div style='font-size:12px;color:#6b7280;margin-bottom:6px;'>Selector: <code>"+selector+"</code></div>" if selector else ""}
          {"<div style='font-size:12px;color:#6b7280;'>Path: <code>"+in_sel+"</code> → <code>"+out_sel+"</code></div>" if in_sel or out_sel else ""}
        </div>
        """)

    cards_html = "\n".join(cards) if cards else "<p style='color:#6b7280;'>No findings.</p>"

    return f"""<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Prompt‑Injection Scan Report</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<body style="margin:0;background:#f9fafb;font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial;">
  <div style="max-width:960px;margin:0 auto;padding:24px;">
    <h1 style="font-size:20px;margin:0 0 10px 0;">Prompt‑Injection Scan Report</h1>
    <div style="color:#6b7280;font-size:14px;margin-bottom:16px;">
      Target: <strong>{_escape(summary.get("target",""))}</strong> · Scanned at: {_escape(summary.get("scanned_at",""))}
    </div>

    <div style="display:flex;gap:8px;margin-bottom:16px;">
      <div style="padding:10px 12px;border-radius:10px;background:#fee2e2;">High: <strong>{h}</strong></div>
      <div style="padding:10px 12px;border-radius:10px;background:#ffedd5;">Medium: <strong>{m}</strong></div>
      <div style="padding:10px 12px;border-radius:10px;background:#d1fae5;">Low: <strong>{l}</strong></div>
    </div>

    <section>
      {cards_html}
    </section>
  </div>
</body>
</html>"""
