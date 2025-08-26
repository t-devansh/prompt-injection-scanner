# tests/test_cli_multi.py
import subprocess, sys, json

SAFE_HTML = "<div><p>hello world</p></div>"
RISKY_HTML = "<div><input><div class='ai-output'>AI reply</div></div>"  # HX1 (medium)

def run_cli(args):
    result = subprocess.run([sys.executable, "-m", "src.cli"] + args, capture_output=True)
    return result.returncode, result.stdout.decode("utf-8"), result.stderr.decode("utf-8")

def test_cli_multi_targets_aggregates_and_exits_nonzero_on_medium():
    code, out, err = run_cli(["--html", SAFE_HTML, "--html", RISKY_HTML, "--fail-on", "medium"])
    assert code == 1, out + err
    data = json.loads(out)
    assert "aggregate" in data
    assert data["aggregate"]["targets"] == 2
    # HX1 should appear in at least one result
    assert any(any(f.get("rule_id") == "HX1" for f in r.get("findings", [])) for r in data["results"])

def test_cli_multi_targets_pass_on_high_threshold():
    code, out, err = run_cli(["--html", SAFE_HTML, "--html", RISKY_HTML, "--fail-on", "high"])
    assert code == 0, out + err
    data = json.loads(out)
    assert data["aggregate"]["failed_threshold"] is False

def test_cli_single_target_back_compat_shape():
    code, out, err = run_cli(["--html", RISKY_HTML, "--fail-on", "high"])
    assert code == 0
    data = json.loads(out)
    assert "summary" in data and "findings" in data
