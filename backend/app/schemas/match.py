from pydantic import BaseModel, ConfigDict
from app.schemas.job import JobResponse
import json

class JobMatchRequest(BaseModel):
    resume_id: int
    job_id: int

class JobMatchResponse(BaseModel):
    id: int
    resume_id: int
    job_id: int
    overall_score: float
    skill_score: float
    semantic_score: float
    experience_score: float
    education_score: float
    matching_skills: list[str]
    missing_skills: list[str]
    suggestions: list[str]
    job: JobResponse

    model_config = ConfigDict(from_attributes=True)

    def __init__(self, **data):
        # Handle parsing JSON strings from the DB if needed
        for field in ['matching_skills', 'missing_skills', 'suggestions']:
            if isinstance(data.get(field), str):
                try:
                    data[field] = json.loads(data[field])
                except Exception:
                    data[field] = []
        super().__init__(**data)
