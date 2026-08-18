from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    name: str | None
    email: str | None
    education: str | None
    experience_years: float
    resume_score: float
    upload_date: datetime
    skills: list[str] = []

    model_config = ConfigDict(from_attributes=True)
