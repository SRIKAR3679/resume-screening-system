from pydantic import BaseModel, ConfigDict
from app.schemas.job import JobResponse

class RecommendationResponse(BaseModel):
    id: int
    job_id: int
    score: float
    reason: str
    job: JobResponse

    model_config = ConfigDict(from_attributes=True)
