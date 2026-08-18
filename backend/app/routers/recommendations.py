"""
Recommendations Router
======================
Endpoints for AI-powered job recommendations based on candidate resume.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.job import Job
from app.models.recommendation import Recommendation
from app.utils.auth import get_current_user
from app.ai.recommender import generate_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("")
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate fresh AI-powered job recommendations for the current user
    based on their latest uploaded resume.

    Returns top 10 recommended jobs with match scores and reasons.
    """
    # Get user's latest resume
    latest_resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.upload_date.desc())
        .first()
    )
    if not latest_resume:
        raise HTTPException(
            status_code=400,
            detail="Please upload a resume first to get job recommendations."
        )

    # Get all active jobs
    jobs = db.query(Job).filter(Job.is_active == True).all()
    if not jobs:
        return []

    # Generate recommendations using AI engine
    recs = generate_recommendations(latest_resume, jobs, db, top_n=10)

    # Persist recommendations to DB (upsert)
    for rec_data in recs:
        existing = (
            db.query(Recommendation)
            .filter(
                Recommendation.user_id == current_user.id,
                Recommendation.job_id == rec_data["job_id"]
            )
            .first()
        )
        if existing:
            existing.score = rec_data["overall_score"]
            existing.reason = rec_data["reason"]
        else:
            new_rec = Recommendation(
                user_id=current_user.id,
                job_id=rec_data["job_id"],
                score=rec_data["overall_score"],
                reason=rec_data["reason"]
            )
            db.add(new_rec)

    db.commit()

    # Format response with full recommendation details
    result = []
    for rec_data in recs:
        job = db.query(Job).filter(Job.id == rec_data["job_id"]).first()
        if not job:
            continue
        result.append({
            "job_id": rec_data["job_id"],
            "job_title": rec_data["job_title"],
            "job_company": rec_data["job_company"],
            "job_location": rec_data["job_location"],
            "job_type": rec_data["job_type"],
            "salary_range": rec_data["salary_range"],
            "experience_required": rec_data["experience_required"],
            "education_required": rec_data["education_required"],
            "job_skills": [s.name for s in job.skills],
            "overall_score": rec_data["overall_score"],
            "skill_score": rec_data["skill_score"],
            "semantic_score": rec_data["semantic_score"],
            "experience_score": rec_data["experience_score"],
            "education_score": rec_data["education_score"],
            "matching_skills": rec_data["matching_skills"],
            "missing_skills": rec_data["missing_skills"],
            "suggestions": rec_data["suggestions"],
            "reason": rec_data["reason"],
        })

    return result


@router.get("/history")
def get_recommendation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve previously saved recommendation records for the current user.
    """
    recs = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == current_user.id)
        .order_by(Recommendation.score.desc())
        .all()
    )
    result = []
    for rec in recs:
        job = rec.job
        result.append({
            "id": rec.id,
            "job_id": rec.job_id,
            "score": rec.score,
            "reason": rec.reason,
            "created_at": rec.created_at.isoformat() if rec.created_at else None,
            "job_title": job.title if job else "Unknown",
            "job_company": job.company if job else "Unknown",
            "job_location": job.location if job else "",
            "job_skills": [s.name for s in job.skills] if job else [],
        })
    return result
