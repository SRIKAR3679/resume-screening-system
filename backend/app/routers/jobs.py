"""
Jobs Router
===========
CRUD for job postings + save/unsave functionality.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.saved_job import SavedJob
from app.models.skill import Skill
from app.schemas.job import JobCreate, JobUpdate
from app.utils.auth import get_current_user, get_admin_user, get_current_active_user

router = APIRouter(prefix="/jobs", tags=["jobs"])


def _job_dict(job: Job) -> dict:
    """Safely serialize Job ORM object (no _sa_instance_state)."""
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


@router.get("")
def get_jobs(
    search: Optional[str] = None,
    location: Optional[str] = None,
    min_exp: Optional[float] = None,
    max_exp: Optional[float] = None,
    skills: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List active jobs with optional search/filter.
    Supports: search (title/company), location, experience range, skills filter, pagination.
    """
    query = db.query(Job).filter(Job.is_active == True)

    if search:
        query = query.filter(
            or_(Job.title.ilike(f"%{search}%"), Job.company.ilike(f"%{search}%"))
        )
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if min_exp is not None:
        query = query.filter(Job.experience_required >= min_exp)
    if max_exp is not None:
        query = query.filter(Job.experience_required <= max_exp)

    jobs = query.all()

    # Skills filter (in Python for simplicity with many-to-many)
    if skills:
        filter_skills = [s.strip().lower() for s in skills.split(",") if s.strip()]
        jobs = [
            j for j in jobs
            if any(
                fs in sk.name.lower() or fs in sk.normalized_name
                for fs in filter_skills
                for sk in j.skills
            )
        ]

    return [_job_dict(j) for j in jobs]


@router.get("/saved")
def get_saved_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all jobs saved/bookmarked by the current user."""
    saved = db.query(SavedJob).filter(SavedJob.user_id == current_user.id).all()
    return [
        {
            "id": s.id,
            "job_id": s.job_id,
            "saved_at": s.saved_at.isoformat() if s.saved_at else None,
            "job": _job_dict(s.job)
        }
        for s in saved
    ]


@router.get("/{id}")
def get_job(id: int, db: Session = Depends(get_db)):
    """Get a single job by ID."""
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return _job_dict(job)


@router.post("")
def create_job(
    job: JobCreate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new job posting (admin only)."""
    new_job = Job(**job.model_dump(exclude={"skills"}), created_by=current_user.id)
    db.add(new_job)
    db.flush()

    for sk in job.skills:
        norm = sk.lower().strip()
        skill_obj = db.query(Skill).filter(Skill.normalized_name == norm).first()
        if not skill_obj:
            skill_obj = Skill(name=sk, normalized_name=norm, category="custom")
            db.add(skill_obj)
            db.flush()
        if skill_obj not in new_job.skills:
            new_job.skills.append(skill_obj)

    db.commit()
    db.refresh(new_job)
    return _job_dict(new_job)


@router.put("/{id}")
def update_job(
    id: int,
    job: JobUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update an existing job (admin only)."""
    db_job = db.query(Job).filter(Job.id == id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")

    update_data = job.model_dump(exclude_unset=True, exclude={"skills"})
    for key, value in update_data.items():
        setattr(db_job, key, value)

    if job.skills is not None:
        db_job.skills = []
        db.flush()
        for sk in job.skills:
            norm = sk.lower().strip()
            skill_obj = db.query(Skill).filter(Skill.normalized_name == norm).first()
            if not skill_obj:
                skill_obj = Skill(name=sk, normalized_name=norm, category="custom")
                db.add(skill_obj)
                db.flush()
            db_job.skills.append(skill_obj)

    db.commit()
    db.refresh(db_job)
    return _job_dict(db_job)


@router.delete("/{id}")
def delete_job(
    id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Soft-delete (deactivate) a job posting (admin only)."""
    db_job = db.query(Job).filter(Job.id == id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    db_job.is_active = False
    db.commit()
    return {"detail": "Job deactivated successfully"}


@router.post("/{id}/save")
def save_job(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Bookmark/save a job for later."""
    db_job = db.query(Job).filter(Job.id == id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = db.query(SavedJob).filter(
        SavedJob.job_id == id,
        SavedJob.user_id == current_user.id
    ).first()
    if not existing:
        saved = SavedJob(user_id=current_user.id, job_id=id)
        db.add(saved)
        db.commit()
    return {"detail": "Job saved successfully"}


@router.delete("/{id}/save")
def unsave_job(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove a job from bookmarks."""
    existing = db.query(SavedJob).filter(
        SavedJob.job_id == id,
        SavedJob.user_id == current_user.id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
    return {"detail": "Job removed from saved jobs"}
