from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

resume_skills = Table(
    'resume_skills', Base.metadata,
    Column('resume_id', Integer, ForeignKey('resumes.id')),
    Column('skill_id', Integer, ForeignKey('skills.id'))
)

job_skills = Table(
    'job_skills', Base.metadata,
    Column('job_id', Integer, ForeignKey('jobs.id')),
    Column('skill_id', Integer, ForeignKey('skills.id'))
)

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    normalized_name = Column(String(100), unique=True, nullable=False)
    category = Column(String(50))

    resumes = relationship("Resume", secondary=resume_skills, back_populates="skills")
    jobs = relationship("Job", secondary=job_skills, back_populates="skills")
