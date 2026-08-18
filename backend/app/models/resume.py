from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.skill import resume_skills

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String(255))
    file_path = Column(String(500))
    extracted_text = Column(Text)
    name = Column(String(200))
    email = Column(String(150))
    phone = Column(String(50))
    education = Column(Text)
    experience_years = Column(Float, default=0)
    projects = Column(Text)
    certifications = Column(Text)
    languages = Column(Text)
    keywords = Column(Text)
    resume_score = Column(Float, default=0)
    upload_date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    skills = relationship("Skill", secondary=resume_skills, back_populates="resumes")
    job_matches = relationship("JobMatch", back_populates="resume", cascade="all, delete-orphan")
