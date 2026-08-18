from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.schemas.job import JobResponse
from typing import Optional

class ApplicationCreate(BaseModel):
    job_id: int
    cover_note: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    status: str
    applied_at: datetime
    job: JobResponse

    model_config = ConfigDict(from_attributes=True)

class SavedJobResponse(BaseModel):
    id: int
    job_id: int
    saved_at: datetime
    job: JobResponse

    model_config = ConfigDict(from_attributes=True)
