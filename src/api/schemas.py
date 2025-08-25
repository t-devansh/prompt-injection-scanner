from pydantic import BaseModel, model_validator
from typing import Optional
from typing import Any, Dict, List

class ScanRequest(BaseModel):
    url: Optional[str] = None
    html: Optional[str] = None

    @model_validator(mode="after")
    def _only_one_input(self):
        if (self.url is None and self.html is None) or (self.url and self.html):
            raise ValueError("Provide exactly one of 'url' or 'html'.")
        return self

class ScanSummary(BaseModel):
    counts: Dict[str, int]
    scanned_at: str
    target: str

class ScanFinding(BaseModel):
    rule_id: str
    title: str
    severity: str                  # "high" | "medium" | "low"
    confidence: float
    evidence: Optional[str] = None
    message: Optional[str] = None
    sample_attack: Optional[str] = None
    fix: Optional[str] = None
    references: List[str] = []
    selector: Optional[str] = None  # if rule is tied to a DOM surface
    details: Dict[str, Any] = {}    # extra per-rule info
    # inside class ScanFinding(BaseModel):
    is_user_controlled: Optional[bool] = None


class ScanResponse(BaseModel):
    summary: ScanSummary
    findings: List[ScanFinding] = []

