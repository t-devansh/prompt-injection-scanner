from pydantic import BaseModel, model_validator
from typing import Optional

class ScanRequest(BaseModel):
    url: Optional[str] = None
    html: Optional[str] = None

    @model_validator(mode="after")
    def _only_one_input(self):
        if (self.url is None and self.html is None) or (self.url and self.html):
            raise ValueError("Provide exactly one of 'url' or 'html'.")
        return self

class ScanSummary(BaseModel):
    counts: dict
    scanned_at: str
    target: Optional[str] = None

class ScanFinding(BaseModel):
    id: str
    title: str
    severity: str
    confidence: float
    details: dict = {}

class ScanResponse(BaseModel):
    summary: ScanSummary
    findings: list[ScanFinding]
