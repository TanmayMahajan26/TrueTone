from typing import Dict, List

from pydantic import BaseModel


class BatchReviewItem(BaseModel):
    review: str
    confidence: float

class BatchRowResult(BaseModel):
    """One analyzed row, used for exporting results."""
    row: int
    review: str
    sentiment: int
    confidence: float
    reliability: str
    trust_score: float
    flags: List[str]

class BatchResponse(BaseModel):
    total: int
    processed: int
    skipped: int
    sentiment_distribution: Dict[str, int]
    avg_confidence: float
    top_complaints: List[BatchReviewItem]
    top_praised: List[BatchReviewItem]
    suspicious_count: int
    reliability_breakdown: Dict[str, int]
    model_used: str = "lr"
    results: List[BatchRowResult] = []
