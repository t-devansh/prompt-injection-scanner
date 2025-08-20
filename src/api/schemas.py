from pydantic import BaseModel, field_validator
from typing import Optional

class ScanRequest(BaseModel):
    url: Optional[str] = None
    html: Optional[str] = None

    @field_validator('html', mode='after')
    @classmethod
    def ensure_one_input(cls, v, values):
        url = values.get('url')
        if (url is None and v is None) or (url and v):
            raise ValueError(\"Provide exactly one of 'url' or 'html'.\")
        return v

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
