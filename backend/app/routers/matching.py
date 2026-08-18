"""
Job Matching Router
===================
Endpoints for AI-powered resume-to-job compatibility analysis.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.job import Job
from app.models.match import JobMatch
from app.schemas.match import JobMatchRequest
from app.utils.auth import get_current_user
from app.ai.matcher import match_resume_to_job

router = APIRouter(prefix="/matching", tags=["matching"])


def _job_to_dict(job: Job) -> dict:
    """Serialize a Job ORM object to a plain dict safely."""
    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "description": job.description,
        "experience_required": job.experience_required or 0.0,
        "education_required": job.education_required,
        "salary_range": job.salary_range,
        "job_type": job.job_type,
        "is_active": job.is_active,
        "created_at": job.created_at.isoformat() if job.created_at else None,
        "skills": [s.name for s in job.skills],
    }


def _match_to_dict(match: JobMatch, job: Job) -> dict:
    """Serialize a JobMatch ORM object + Job to a plain dict safely."""
    def _parse_json(val):
        if isinstance(val, str):
            try:
                return json.loads(val)
            except Exception:
                return []
        return val or []

    return {
        "id": match.id,
        "resume_id": match.resume_id,
        "job_id": match.job_id,
        "overall_score": match.overall_score,
        "skill_score": match.skill_score,
        "semantic_score": match.semantic_score,
        "experience_score": match.experience_score,
        "education_score": match.education_score,
        "matching_skills": _parse_json(match.matching_skills),
        "missing_skills": _parse_json(match.missing_skills),
        "suggestions": _parse_json(match.suggestions),
        "created_at": match.created_at.isoformat() if match.created_at else None,
        "job": _job_to_dict(job),
    }


@router.post("/analyze")
def analyze_match(
    req: JobMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze compatibility between a resume and a job.
    Runs the full AI scoring pipeline and saves the result.
    """
    resume = db.query(Resume).filter(
        Resume.id == req.resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    job = db.query(Job).filter(Job.id == req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Prepare inputs for matching algorithm
    resume_skills = [s.normalized_name for s in resume.skills]
    job_skills = [s.normalized_name for s in job.skills]

    try:
        resume_edu = json.loads(resume.education) if resume.education else []
    except Exception:
        resume_edu = []

    # Run AI matching
    match_res = match_resume_to_job(
        resume_text=resume.extracted_text or "",
        resume_skills=resume_skills,
        resume_education=resume_edu,
        resume_experience_years=resume.experience_years or 0,
        job_description=job.description or "",
        job_skills=job_skills,
        job_experience_required=job.experience_required or 0,
        job_education_required=job.education_required or ""
    )

    # Save result to DB
    job_match = JobMatch(
        resume_id=req.resume_id,
        job_id=req.job_id,
        overall_score=match_res["overall_score"],
        skill_score=match_res["skill_score"],
        semantic_score=match_res["semantic_score"],
        experience_score=match_res["experience_score"],
        education_score=match_res["education_score"],
        matching_skills=json.dumps(match_res["matching_skills"]),
        missing_skills=json.dumps(match_res["missing_skills"]),
        suggestions=json.dumps(match_res["suggestions"])
    )
    db.add(job_match)
    db.commit()
    db.refresh(job_match)

    return _match_to_dict(job_match, job)


@router.get("/history")
def get_match_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all past match analyses for the current user's resumes.
    Ordered by most recent first.
    """
    resume_ids = [
        r[0] for r in
        db.query(Resume.id).filter(Resume.user_id == current_user.id).all()
    ]
    if not resume_ids:
        return []

    matches = (
        db.query(JobMatch)
        .filter(JobMatch.resume_id.in_(resume_ids))
        .order_by(JobMatch.created_at.desc())
        .all()
    )

    return [_match_to_dict(m, m.job) for m in matches]


@router.get("/{resume_id}/{job_id}")
def get_match(
    resume_id: int,
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the most recent match result for a specific resume-job pair.
    """
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    match = (
        db.query(JobMatch)
        .filter(JobMatch.resume_id == resume_id, JobMatch.job_id == job_id)
        .order_by(JobMatch.created_at.desc())
        .first()
    )
    if not match:
        raise HTTPException(status_code=404, detail="Match not found. Please run an analysis first.")

    return _match_to_dict(match, match.job)
