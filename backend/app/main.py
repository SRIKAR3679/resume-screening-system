import logging
import os
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── API Routes ────────────────────────────────────────────────────────────────
app.include_router(auth.router,                  prefix="/api")
app.include_router(resume.router,                prefix="/api")
app.include_router(jobs.router,                  prefix="/api")
app.include_router(applications.jobs_router,     prefix="/api")
app.include_router(matching.router,              prefix="/api")
app.include_router(recommendations.router,       prefix="/api")
app.include_router(applications.router,          prefix="/api")
app.include_router(admin.router,                 prefix="/api")

# ─── Startup ───────────────────────────────────────────────────────────────────
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

# ─── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
def health_check():
    from app.models.user import User
    from app.models.resume import Resume
    from app.models.job import Job
    from app.models.match import JobMatch
    from app.models.application import Application
    from app.models.skill import Skill

    db: Session = SessionLocal()
    try:
        total_users   = db.query(User).count()
        total_resumes = db.query(Resume).count()
        total_jobs    = db.query(Job).filter(Job.is_active == True).count()
        total_matches = db.query(JobMatch).count()
        total_applies = db.query(Application).count()
        total_skills  = db.query(Skill).count()
        db_status     = "connected"
    except Exception as e:
        total_users = total_resumes = total_jobs = total_matches = total_applies = total_skills = 0
        db_status = f"error: {str(e)}"
    finally:
        db.close()

    from app.config import settings
    groq_enabled = bool(settings.GROQ_API_KEY)

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
        "features": {
            "groq_ai": groq_enabled,
            "resume_upload": True,
            "job_matching": True,
            "recommendations": True,
            "jwt_auth": True,
        }
    }

# ─── Serve React Frontend ──────────────────────────────────────────────────────
# Mount static assets (JS, CSS, images) from the built React app
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static")

if os.path.exists(STATIC_DIR):
    # Serve static files (assets folder)
    assets_dir = os.path.join(STATIC_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/", include_in_schema=False)
    def serve_root():
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        """Catch-all: serve React app for all non-API routes (React Router support)."""
        # Don't intercept API or docs routes
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json", "health"):
            return {"detail": "Not Found"}
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        # All other routes → return index.html (React Router handles it)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
