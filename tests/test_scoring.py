from src.rules.scoring import apply_scoring

def test_apply_scoring_sets_values():
    f = {"rule_id": "R1", "title": "test", "severity": "low", "confidence": 0.1}
    scored = apply_scoring(f.copy())
    assert scored["severity"] == "medium"
    assert scored["confidence"] == 0.7
