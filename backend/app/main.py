import logging
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import create_tables, SessionLocal
from app.routers import auth, resume, jobs, matching, recommendations, applications, admin

app = FastAPI(
    title="AI-Based Resume Screening & Job Recommendation System",
    description="FastAPI backend for AI-powered resume screening and job recommendations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(applications.jobs_router, prefix="/api")  # /api/jobs/{id}/apply
app.include_router(matching.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.on_event("startup")
def startup_event():
    create_tables()
    db = SessionLocal()
    try:
        import seed_data
        seed_data.seed_if_empty(db)
    except Exception as e:
        logging.error(f"Error seeding data: {e}")
    finally:
        db.close()

@app.get("/health", tags=["health"])
def health_check():
    """
    Detailed health check — returns system status, database stats, and API info.
    """
    from app.models.user import User
    from app.models.resume import Resume
    from app.models.job import Job
    from app.models.match import JobMatch
    from app.models.application import Application
    from app.models.skill import Skill

    db: Session = SessionLocal()
    try:
        # Query live database counts
        total_users      = db.query(User).count()
        total_resumes    = db.query(Resume).count()
        total_jobs       = db.query(Job).filter(Job.is_active == True).count()
        total_matches    = db.query(JobMatch).count()
        total_applies    = db.query(Application).count()
        total_skills     = db.query(Skill).count()
        db_status        = "connected"
    except Exception as e:
        total_users = total_resumes = total_jobs = total_matches = total_applies = total_skills = 0
        db_status = f"error: {str(e)}"
    finally:
        db.close()

    return {
        "status": "ok",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "database": {
            "status": db_status,
            "users": total_users,
            "resumes": total_resumes,
            "active_jobs": total_jobs,
            "match_analyses": total_matches,
            "applications": total_applies,
            "skills_indexed": total_skills,
        },
        "api": {
            "docs": "http://localhost:8000/docs",
            "redoc": "http://localhost:8000/redoc",
            "frontend": "http://localhost:5174",
        },
        "features": [
            "Resume Upload (PDF/DOCX)",
            "AI Skill Extraction (200+ skills)",
            "Resume-Job Matching (TF-IDF + Jaccard)",
            "Job Recommendations (Content-Based)",
            "JWT Authentication",
            "Admin Dashboard",
        ]
    }

