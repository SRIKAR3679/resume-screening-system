from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class JobBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    description: str
    experience_required: float = 0.0
    education_required: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: str = 'Full-time'

class JobCreate(JobBase):
    skills: list[str] = []

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    experience_required: Optional[float] = None
    education_required: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None
    skills: Optional[list[str]] = None

class JobResponse(JobBase):
    id: int
    is_active: bool
    created_at: datetime
    skills: list[str] = []

    model_config = ConfigDict(from_attributes=True)
