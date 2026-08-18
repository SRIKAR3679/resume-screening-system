"""
Applications Router
===================
Endpoints for job applications and status tracking.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.utils.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/applications", tags=["applications"])
jobs_router = APIRouter(prefix="/jobs", tags=["applications"])


class ApplyRequest(BaseModel):
    cover_note: str = ""


class ApplicationStatusUpdate(BaseModel):
    status: str


def _app_dict(app: Application) -> dict:
    """Safely serialize Application + Job ORM objects."""
    job = app.job
    return {
        "id": app.id,
        "user_id": app.user_id,
        "job_id": app.job_id,
        "status": app.status,
        "cover_note": app.cover_note,
        "applied_at": app.applied_at.isoformat() if app.applied_at else None,
        "job": {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "job_type": job.job_type,
            "salary_range": job.salary_range,
            "skills": [s.name for s in job.skills],
            "is_active": job.is_active,
            "created_at": job.created_at.isoformat() if job.created_at else None,
            "description": job.description,
            "experience_required": job.experience_required or 0.0,
            "education_required": job.education_required,
        } if job else None
    }


@jobs_router.post("/{id}/apply")
def apply_job(
    id: int,
    req: ApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply to a job posting."""
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job.is_active:
        raise HTTPException(status_code=400, detail="This job is no longer accepting applications")

    existing = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.job_id == id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied to this job")

    application = Application(
        user_id=current_user.id,
        job_id=id,
        cover_note=req.cover_note,
        status="applied"
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    return _app_dict(application)


@router.get("")
def get_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all job applications for the current user."""
    apps = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.applied_at.desc())
        .all()
    )
    return [_app_dict(a) for a in apps]


@router.put("/{id}")
def update_application(
    id: int,
    req: ApplicationStatusUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update application status (admin only)."""
    valid_statuses = ["applied", "under_review", "accepted", "rejected"]
    if req.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = req.status
    db.commit()
    return {"detail": f"Application status updated to '{req.status}'"}
