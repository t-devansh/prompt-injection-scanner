from src.rules.reachability import reachability_check

def test_reachability_detects_user_and_ai():
    html = """
    <div>
      <input id="x" type="text">
      <div class="ai-output">Assistant response</div>
    </div>
    """
    findings = reachability_check(html)
    assert findings, "Expected a reachability finding"
    f = findings[0]
    assert f["rule_id"] == "HX1"
    assert f["details"]["risk_path"] == ["user_input", "ai_output"]
