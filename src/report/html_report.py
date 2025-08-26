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
    counts = summary.get("counts", {})
    h = int(counts.get("high", 0))
    m = int(counts.get("medium", 0))
    l = int(counts.get("low", 0))

    # Build a simple table of contents with anchors
    toc_items = []
    cards = []
    for idx, f in enumerate(findings, start=1):
        rule_id = _escape(f.get("rule_id") or "")
        title = _escape(f.get("title") or "")
        sev = (f.get("severity") or "").lower()
        conf = f.get("confidence")
        conf_str = f"{float(conf):.2f}" if isinstance(conf, (int, float)) else _escape(conf)
        evidence = _escape(f.get("evidence") or "")
        selector = _escape(f.get("selector") or "")
        details = f.get("details") or {}
        in_sel = _escape(details.get("input_selector"))
        out_sel = _escape(details.get("output_selector"))

        fid = f"f-{idx}-{rule_id or 'X'}"
        toc_items.append(f'<li><a href="#{fid}" style="text-decoration:none;color:#2563eb;">{rule_id}</a> · {title}</li>')

        cards.append(f"""
        <article id="{fid}" style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;margin:10px 0;background:#fff;">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
            <code style="font-size:12px;color:#6b7280;">{rule_id}</code>
            {_badge(sev)}
            <span style="font-size:12px;color:#6b7280;">Confidence: {conf_str}</span>
          </div>
          <div style="font-weight:600;margin-bottom:6px;">{title}</div>
          {"<div style='color:#374151;margin-bottom:6px;'>"+evidence+"</div>" if evidence else ""}
          {"<div style='font-size:12px;color:#6b7280;margin:6px 0;'>Selector: <code>"+selector+"</code></div>" if selector else ""}
          {"<div style='font-size:12px;color:#6b7280;margin:6px 0;'>Path: <code>"+in_sel+"</code> → <code>"+out_sel+"</code></div>" if in_sel or out_sel else ""}
          <div style="text-align:right;margin-top:8px;">
            <a href="#top" style="text-decoration:none;color:#2563eb;font-size:12px;">Back to top ↑</a>
          </div>
        </article>
        """)

    toc_html = (
        "<ul style='margin:0;padding-left:18px;'>\n" + "\n".join(toc_items) + "\n</ul>"
        if toc_items else "<p style='color:#6b7280;'>No findings.</p>"
    )
    cards_html = "\n".join(cards) if cards else "<p style='color:#6b7280;'>No findings.</p>"

    return f"""<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Prompt-Injection Scan Report</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<body style="margin:0;background:#f9fafb;font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial;">
  <a id="top"></a>
  <div style="max-width:960px;margin:0 auto;padding:24px;">
    <h1 style="font-size:20px;margin:0 0 10px 0;">Prompt-Injection Scan Report</h1>
    <div style="color:#6b7280;font-size:14px;margin-bottom:16px;">
      Target: <strong>{_escape(summary.get("target",""))}</strong> · Scanned at: {_escape(summary.get("scanned_at",""))}
    </div>

    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
      <div style="padding:10px 12px;border-radius:10px;background:#fee2e2;">High: <strong>{h}</strong></div>
      <div style="padding:10px 12px;border-radius:10px;background:#ffedd5;">Medium: <strong>{m}</strong></div>
      <div style="padding:10px 12px;border-radius:10px;background:#d1fae5;">Low: <strong>{l}</strong></div>
    </div>

    <h2 style="font-size:16px;margin:12px 0;">Findings</h2>
    {toc_html}

    <section style="margin-top:10px;">
      {cards_html}
    </section>
  </div>
</body>
</html>"""

