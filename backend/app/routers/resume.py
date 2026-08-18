"""
Resume Router
=============
Endpoints for resume upload, parsing, skill extraction, and management.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.skill import Skill
from app.utils.auth import get_current_user
from app.utils.file_handler import save_upload_file, delete_file
from app.ai.resume_parser import parse_resume, compute_resume_score
from app.ai.skill_extractor import extract_skills_from_text, normalize_skill

router = APIRouter(prefix="/resumes", tags=["resumes"])


def _resume_dict(resume: Resume) -> dict:
    """Safely serialize Resume ORM object (no _sa_instance_state)."""
    return {
        "id": resume.id,
        "user_id": resume.user_id,
        "filename": resume.filename,
        "name": resume.name,
        "email": resume.email,
        "phone": resume.phone,
        "education": resume.education,
        "experience_years": resume.experience_years or 0.0,
        "resume_score": resume.resume_score or 0.0,
        "projects": resume.projects,
        "certifications": resume.certifications,
        "keywords": resume.keywords,
        "upload_date": resume.upload_date.isoformat() if resume.upload_date else None,
        "skills": [s.name for s in resume.skills],
    }


@router.post("/upload")
def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a PDF or DOCX resume.
    Automatically extracts text, skills, education, experience, projects,
    certifications, and keywords using the AI parsing pipeline.
    """
    file_path = save_upload_file(file, current_user.id)
    try:
        # Parse resume — uses Groq AI if key configured, else regex
        parsed_data = parse_resume(file_path)

        # Use Groq-extracted skills if available, else NLP extraction
        if parsed_data.get("_groq_skills"):
            extracted_skills = parsed_data["_groq_skills"]
            logger.info(f"Using {len(extracted_skills)} Groq-extracted skills")
        else:
            extracted_skills = extract_skills_from_text(parsed_data["text"])

        # Also try Groq skill extraction separately for extra skills
        try:
            from app.ai.groq_engine import extract_skills_with_groq, is_groq_available
            if is_groq_available() and not parsed_data.get("_groq_skills"):
                groq_skills = extract_skills_with_groq(parsed_data["text"])
                if groq_skills:
                    combined = list(set(extracted_skills + groq_skills))
                    extracted_skills = combined
                    logger.info(f"Combined skills total: {len(extracted_skills)}")
        except Exception:
            pass

        # Create Resume record
        resume = Resume(
            user_id=current_user.id,
            filename=file.filename,
            file_path=file_path,
            extracted_text=parsed_data["text"],
            name=parsed_data["name"],
            email=parsed_data["email"],
            phone=parsed_data["phone"],
            education=parsed_data["education"],
            experience_years=parsed_data["experience_years"],
            projects=parsed_data["projects"],
            certifications=parsed_data["certifications"],
            keywords=parsed_data["keywords"]
        )
        db.add(resume)
        db.flush()  # Get resume.id

        # Add skills (get or create each)
        for sk in extracted_skills:
            norm = normalize_skill(sk).lower()
            skill_obj = db.query(Skill).filter(Skill.normalized_name == norm).first()
            if not skill_obj:
                skill_obj = Skill(name=sk, normalized_name=norm, category="extracted")
                db.add(skill_obj)
                db.flush()
            if skill_obj not in resume.skills:
                resume.skills.append(skill_obj)

        # Compute resume quality score
        score_data = {**parsed_data, "skills": extracted_skills}
        resume.resume_score = compute_resume_score(score_data)

        db.commit()
        db.refresh(resume)

        return _resume_dict(resume)

    except Exception as e:
        delete_file(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")


@router.get("")
def get_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all resumes uploaded by the current user."""
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.upload_date.desc())
        .all()
    )
    return [_resume_dict(r) for r in resumes]


@router.get("/{id}")
def get_resume(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific resume by ID (must belong to current user)."""
    resume = db.query(Resume).filter(
        Resume.id == id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return _resume_dict(resume)


@router.delete("/{id}")
def delete_resume(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a resume and its associated file."""
    resume = db.query(Resume).filter(
        Resume.id == id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    delete_file(resume.file_path)
    db.delete(resume)
    db.commit()
    return {"detail": "Resume deleted successfully"}
