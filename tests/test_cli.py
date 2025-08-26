import subprocess, sys

def test_cli_exits_nonzero_on_medium(tmp_path):
    cmd = [
        sys.executable, "-m", "src.cli",
        "--html", "<div><input><div class='ai-output'>AI reply</div></div>",
        "--fail-on", "medium"
    ]
    result = subprocess.run(cmd, capture_output=True)
    assert result.returncode == 1
    assert b"HX1" in result.stdout
