from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

class PredictRequest(BaseModel):
    review: str = Field(..., max_length=5000)
    model: Optional[str] = Field("lr")

class AspectSentiment(BaseModel):
    aspect: str
    sentiment: int
    confidence: float

class TokenWeight(BaseModel):
    text: str
    weight: float = Field(..., description="Push toward positive (>0) or negative (<0), scaled to [-1, 1]")

class TermWeight(BaseModel):
    term: str
    weight: float

class Explanation(BaseModel):
    segments: List[TokenWeight]
    top_positive: List[TermWeight]
    top_negative: List[TermWeight]

class PredictResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    sentiment: int
    confidence: float
    reliability: str
    aspects: List[AspectSentiment]
    trust_score: float
    flags: List[str]
    model_used: str
    explanation: Optional[Explanation] = Field(
        None, description="Per-word contributions; only for the TF-IDF models"
    )
