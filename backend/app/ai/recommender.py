"""
Job Recommendation Engine
=========================
Content-based recommendation engine that matches candidate resume profiles
against available jobs and returns ranked recommendations with explanations.
"""

import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.ai.matcher import match_resume_to_job
from app.ai.skill_extractor import get_matching_skills

logger = logging.getLogger(__name__)


def generate_reason(matching_skills: List[str], score: float, job_title: str, job_company: str) -> str:
    """
    Generate a human-readable recommendation reason.

    Args:
        matching_skills: Skills found in both resume and job
        score: Overall match score (0-100)
        job_title: Job title
        job_company: Company name

    Returns:
        Human-readable string explaining why this job was recommended.
    """
    if not matching_skills:
        if score >= 60:
            return (
                f"Your overall profile and experience level shows strong alignment "
                f"with the {job_title} role at {job_company}."
            )
        return f"Your profile partially matches the requirements for {job_title} at {job_company}."

    if len(matching_skills) >= 7:
        skills_str = ", ".join(matching_skills[:5])
        return (
            f"Excellent match! Your skills in {skills_str} and "
            f"{len(matching_skills)} other areas directly align with this {job_title} role."
        )
    elif len(matching_skills) >= 4:
        skills_str = ", ".join(matching_skills[:4])
        return (
            f"Strong match based on your expertise in {skills_str}. "
            f"Your profile closely aligns with {job_company}'s requirements."
        )
    elif len(matching_skills) >= 2:
        skills_str = " and ".join(matching_skills[:3])
        return (
            f"Your skills in {skills_str} match key requirements for "
            f"the {job_title} position at {job_company}."
        )
    else:
        return (
            f"Your {matching_skills[0]} skill is relevant to the {job_title} "
            f"position. Consider developing more skills to improve your match."
        )


def generate_recommendations(
    resume,  # Resume model instance
    jobs: List[Any],  # List of Job model instances
    db: Session,
    top_n: int = 10
) -> List[Dict]:
    """
    Generate job recommendations using content-based filtering.

    Compares the candidate's resume profile against all active jobs,
    ranks them by overall compatibility score, and returns the top N.

    Args:
        resume: SQLAlchemy Resume model instance
        jobs: List of active Job model instances
        db: Database session
        top_n: Maximum number of recommendations to return

    Returns:
        List of recommendation dicts with job info, score, reason, and skill breakdown.
    """
    import json

    if not jobs:
        logger.info("No jobs available for recommendation.")
        return []

    # Parse stored JSON fields from resume
    try:
        education_list = json.loads(resume.education) if resume.education else []
    except (json.JSONDecodeError, TypeError):
        education_list = []

    resume_skills = [skill.name for skill in resume.skills]
    resume_text = resume.extracted_text or ""
    experience_years = resume.experience_years or 0.0

    recommendations = []

    for job in jobs:
        try:
            job_skills = [skill.name for skill in job.skills]
            job_description = job.description or ""
            job_experience_required = job.experience_required or 0.0
            job_education_required = job.education_required or ""

            # Run full matching algorithm
            match_result = match_resume_to_job(
                resume_text=resume_text,
                resume_skills=resume_skills,
                resume_education=education_list,
                resume_experience_years=experience_years,
                job_description=job_description,
                job_skills=job_skills,
                job_experience_required=job_experience_required,
                job_education_required=job_education_required
            )

            overall_score = match_result["overall_score"]
            matching_skills = match_result["matching_skills"]
            missing_skills = match_result["missing_skills"]

            # Generate human-readable reason
            reason = generate_reason(
                matching_skills=matching_skills,
                score=overall_score,
                job_title=job.title,
                job_company=job.company
            )

            recommendations.append({
                "job_id": job.id,
                "job_title": job.title,
                "job_company": job.company,
                "job_location": job.location,
                "job_type": job.job_type,
                "salary_range": job.salary_range,
                "experience_required": job_experience_required,
                "education_required": job_education_required,
                "job_skills": job_skills,
                "overall_score": overall_score,
                "skill_score": round(match_result["skill_score"] * 100, 1),
                "semantic_score": round(match_result["semantic_score"] * 100, 1),
                "experience_score": round(match_result["experience_score"] * 100, 1),
                "education_score": round(match_result["education_score"] * 100, 1),
                "matching_skills": matching_skills,
                "missing_skills": missing_skills,
                "suggestions": match_result["suggestions"],
                "reason": reason,
            })

        except Exception as e:
            logger.error(f"Error computing recommendation for job {job.id}: {e}")
            continue

    # Sort by overall score descending
    recommendations.sort(key=lambda x: x["overall_score"], reverse=True)

    # Return top N, filter out very poor matches (score < 10)
    top_recommendations = [r for r in recommendations if r["overall_score"] >= 10][:top_n]

    logger.info(
        f"Generated {len(top_recommendations)} recommendations for resume {resume.id} "
        f"out of {len(jobs)} jobs."
    )
    return top_recommendations
