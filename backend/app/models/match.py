from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    overall_score = Column(Float)
    skill_score = Column(Float)
    semantic_score = Column(Float)
    experience_score = Column(Float)
    education_score = Column(Float)
    matching_skills = Column(Text)
    missing_skills = Column(Text)
    suggestions = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="job_matches")
    job = relationship("Job", back_populates="job_matches")
