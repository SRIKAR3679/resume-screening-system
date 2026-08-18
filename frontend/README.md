# 🤖 AI-Based Resume Screening & Job Recommendation System

> A production-style, full-stack AI-powered web application for intelligent resume analysis, job matching, and personalized career recommendations. Built as a college-level AI & Data Science project.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)](https://python.org)
[![SQLite](https://img.shields.io/badge/Database-SQLite%2FPostgreSQL-003B57?logo=sqlite)](https://sqlite.org)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Folder Structure](#folder-structure)
6. [Database Schema](#database-schema)
7. [AI Matching Algorithm](#ai-matching-algorithm)
8. [API Documentation](#api-documentation)
9. [Installation](#installation)
10. [Environment Variables](#environment-variables)
11. [Backend Setup](#backend-setup)
12. [Frontend Setup](#frontend-setup)
13. [Running the Application](#running-the-application)
14. [Testing](#testing)
15. [Demo Credentials](#demo-credentials)
16. [Application Pages](#application-pages)
17. [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

This system enables:
- **Candidates** to upload resumes and receive AI-powered skill analysis, job matching scores, and personalized job recommendations.
- **Administrators** to manage job postings and monitor platform analytics.

The AI engine extracts structured information from PDF/DOCX resumes, identifies skills using NLP, and computes compatibility scores using a weighted multi-dimensional algorithm (TF-IDF, Cosine Similarity, Jaccard Similarity, Semantic Embeddings).

---

## ✨ Features

### Candidate Features
- 📄 **Resume Upload** — Upload PDF or DOCX resumes
- 🔍 **AI Resume Parsing** — Auto-extract name, email, education, experience, skills, projects, certifications
- 🧠 **Skill Extraction** — NLP-based skill identification with normalization (200+ skills, 70+ aliases)
- 📊 **Resume Analysis** — Score your resume (0–100) with strengths and improvement areas
- 🎯 **Job Matching** — Compare resume against any job with detailed score breakdown
- 💡 **AI Explainability** — See WHY a job matched (matching skills, missing skills, suggestions)
- ⭐ **Job Recommendations** — Personalized top-10 job recommendations ranked by compatibility
- 🔖 **Save Jobs** — Bookmark interesting jobs
- 📝 **Apply to Jobs** — Track job applications with status
- 🏠 **Dashboard** — Visual overview with charts, stats, and recent activity

### Admin Features
- 👥 **User Management** — View all users, deactivate accounts
- 💼 **Job Management** — Full CRUD for job postings
- 📈 **Analytics Dashboard** — Platform-wide stats and charts
- 🔒 **Role-Based Access** — Admin-only routes fully protected

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                             │
│                    React/Vite Frontend                          │
│         (14 Pages + Recharts + Tailwind CSS + Axios)           │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP/REST (JWT Auth)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                            │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐  │
│  │   Routers   │  │   Schemas   │  │   Auth (JWT/bcrypt)    │  │
│  │  auth       │  │  Pydantic   │  │   OAuth2 Bearer Token  │  │
│  │  resume     │  │  Validation │  └────────────────────────┘  │
│  │  jobs       │  └─────────────┘                              │
│  │  matching   │                                               │
│  │  recs       │  ┌──────────────────────────────────────────┐ │
│  │  admin      │  │          AI/NLP Engine (Modular)         │ │
│  └─────────────┘  │                                          │ │
│                   │  resume_parser.py  ← PDF/DOCX Text       │ │
│                   │  skill_extractor.py ← NLP Skill ID       │ │
│                   │  matcher.py        ← Scoring Algorithm   │ │
│                   │  recommender.py    ← Content-Based Recs  │ │
│                   └──────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           SQLAlchemy ORM (SQLite / PostgreSQL)           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Data Flow:**
```
Resume Upload → Text Extraction → Text Cleaning → Skill Extraction
             → Education/Experience Extraction → Resume Score
             → Job Matching (TF-IDF + Embeddings + Jaccard)
             → Recommendations (Content-Based Ranking)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | SPA framework |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Charts** | Recharts | Dashboard visualizations |
| **HTTP Client** | Axios | API communication |
| **Routing** | React Router v6 | Client-side routing |
| **Notifications** | react-hot-toast | Toast messages |
| **Backend** | FastAPI (Python) | REST API framework |
| **ORM** | SQLAlchemy 2 | Database abstraction |
| **Auth** | JWT (python-jose) + passlib | Authentication |
| **PDF Parsing** | PyMuPDF (fitz) | PDF text extraction |
| **DOCX Parsing** | python-docx | Word document parsing |
| **NLP** | spaCy | Named Entity Recognition |
| **ML** | scikit-learn (TF-IDF) | Text vectorization |
| **Embeddings** | sentence-transformers | Semantic similarity |
| **Database** | SQLite (dev) / PostgreSQL (prod) | Data persistence |
| **Testing** | pytest + httpx | Backend testing |

---

## 📁 Folder Structure

```
resume-screening-system/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app + CORS + startup
│   │   ├── config.py            # Environment settings (pydantic-settings)
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   │
│   │   ├── models/              # SQLAlchemy ORM models
│   │   │   ├── user.py          # User (candidate/admin)
│   │   │   ├── resume.py        # Uploaded resume + extracted data
│   │   │   ├── job.py           # Job postings
│   │   │   ├── skill.py         # Skills + association tables
│   │   │   ├── match.py         # Resume-Job match results
│   │   │   ├── recommendation.py # Job recommendations
│   │   │   ├── saved_job.py     # Bookmarked jobs
│   │   │   └── application.py   # Job applications
│   │   │
│   │   ├── schemas/             # Pydantic request/response models
│   │   │   ├── user.py
│   │   │   ├── resume.py
│   │   │   ├── job.py
│   │   │   ├── match.py
│   │   │   ├── recommendation.py
│   │   │   └── application.py
│   │   │
│   │   ├── routers/             # FastAPI route handlers
│   │   │   ├── auth.py          # Register / Login / Me
│   │   │   ├── resume.py        # Upload / List / Get / Delete
│   │   │   ├── jobs.py          # CRUD + Save/Unsave + Filter
│   │   │   ├── matching.py      # Analyze + History
│   │   │   ├── recommendations.py # Generate + History
│   │   │   ├── applications.py  # Apply + List
│   │   │   └── admin.py         # Users + Analytics
│   │   │
│   │   ├── ai/                  # AI/NLP Engine (modular, upgradeable)
│   │   │   ├── resume_parser.py # PDF/DOCX extraction + entity detection
│   │   │   ├── skill_extractor.py # 200+ skill NLP extraction + normalization
│   │   │   ├── matcher.py       # Weighted scoring algorithm
│   │   │   └── recommender.py   # Content-based recommendation engine
│   │   │
│   │   └── utils/
│   │       ├── auth.py          # JWT creation + verification + dependencies
│   │       └── file_handler.py  # Upload validation + file saving
│   │
│   ├── tests/
│   │   ├── conftest.py          # Test fixtures (DB, client, tokens)
│   │   ├── test_auth.py         # Auth endpoint tests
│   │   ├── test_resume.py       # Resume upload + skill extraction tests
│   │   ├── test_matching.py     # AI algorithm tests
│   │   └── test_jobs.py         # Job CRUD + save/apply tests
│   │
│   ├── seed_data.py             # 7 realistic jobs + admin + demo user
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Layout.jsx       # Sidebar + Header layout
│   │   │   ├── JobCard.jsx      # Job listing card
│   │   │   ├── SkillBadge.jsx   # Colored skill pill
│   │   │   ├── ScoreGauge.jsx   # SVG circular score gauge
│   │   │   ├── MatchResultCard.jsx # Full match result display
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── ProtectedRoute.jsx # Auth + Admin guards
│   │   │
│   │   ├── pages/               # 14 application pages
│   │   │   ├── Home.jsx         # Landing page
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx    # Candidate dashboard + charts
│   │   │   ├── ResumeUpload.jsx # Drag-drop upload
│   │   │   ├── ResumeAnalysis.jsx # Extracted info display
│   │   │   ├── JobSearch.jsx    # Search + filter jobs
│   │   │   ├── JobDetails.jsx   # Full job details
│   │   │   ├── JobMatch.jsx     # Resume vs Job comparison
│   │   │   ├── Recommendations.jsx # AI recommendations
│   │   │   ├── SavedJobs.jsx    # Bookmarked jobs
│   │   │   ├── Applications.jsx # Application tracking
│   │   │   ├── Profile.jsx      # User profile
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx # Admin analytics
│   │   │       └── JobManagement.jsx  # Job CRUD with modals
│   │   │
│   │   ├── services/
│   │   │   └── api.js           # Axios API service layer (all endpoints)
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # Global auth state + JWT management
│   │   │
│   │   ├── hooks/
│   │   │   └── useApi.js        # Generic API call hook with loading/error
│   │   │
│   │   ├── App.jsx              # Routes definition
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Tailwind directives + global styles
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

---

## 🗃️ Database Schema

```sql
users
├── id (PK)
├── name VARCHAR(100)
├── email VARCHAR(150) UNIQUE
├── password_hash VARCHAR(255)
├── role VARCHAR(20) [candidate|admin]
├── is_active BOOLEAN
└── created_at DATETIME

resumes
├── id (PK)
├── user_id (FK → users.id)
├── filename, file_path
├── extracted_text TEXT
├── name, email, phone
├── education TEXT (JSON)
├── experience_years FLOAT
├── projects, certifications, keywords (JSON)
├── resume_score FLOAT
└── upload_date DATETIME

skills
├── id (PK)
├── name VARCHAR(100)
├── normalized_name VARCHAR(100) UNIQUE
└── category VARCHAR(50)

resume_skills (Association)
├── resume_id (FK → resumes.id)
└── skill_id (FK → skills.id)

jobs
├── id (PK)
├── title, company, location
├── description TEXT
├── experience_required FLOAT
├── education_required VARCHAR(100)
├── salary_range, job_type
├── is_active BOOLEAN
├── created_by (FK → users.id)
└── created_at DATETIME

job_skills (Association)
├── job_id (FK → jobs.id)
└── skill_id (FK → skills.id)

job_matches
├── id (PK)
├── resume_id (FK → resumes.id)
├── job_id (FK → jobs.id)
├── overall_score, skill_score, semantic_score
├── experience_score, education_score FLOAT
├── matching_skills, missing_skills, suggestions (JSON)
└── created_at DATETIME

recommendations
├── id (PK)
├── user_id (FK → users.id)
├── job_id (FK → jobs.id)
├── score FLOAT
├── reason TEXT
└── created_at DATETIME

saved_jobs
├── id (PK)
├── user_id (FK → users.id)
├── job_id (FK → jobs.id)
└── saved_at DATETIME

applications
├── id (PK)
├── user_id (FK → users.id)
├── job_id (FK → jobs.id)
├── status VARCHAR(50) [applied|under_review|accepted|rejected]
├── cover_note TEXT
└── applied_at DATETIME
```

---

## 🧠 AI Matching Algorithm

The scoring engine uses a **4-component weighted formula**:

```
Final Score = (0.50 × Skill Score)
            + (0.20 × Semantic Score)
            + (0.20 × Experience Score)
            + (0.10 × Education Score)

Final Score is normalized to 0–100.
```

### Component Details

#### 1. Skill Score (50%)
Uses **Jaccard Similarity** between candidate and job skill sets:
```
Skill Score = |Candidate Skills ∩ Job Skills| / |Candidate Skills ∪ Job Skills|
```
Skills are normalized before comparison (e.g., "ML" → "Machine Learning").

#### 2. Semantic Score (20%)
Uses **TF-IDF Cosine Similarity** between resume text and job description:
```python
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])
score = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])
```
**Optional upgrade**: Uses `sentence-transformers` (`all-MiniLM-L6-v2`) for semantic embeddings if available, falling back to TF-IDF gracefully.

#### 3. Experience Score (20%)
```python
if candidate_years >= required_years:  score = 1.0
elif candidate_years == 0:             score = 0.2
else:                                  score = candidate_years / required_years
```

#### 4. Education Score (10%)
Maps degree levels: PhD=5, Master=4, Bachelor=3, Diploma=1
```python
if candidate_level >= required_level:  score = 1.0
elif one level below:                  score = 0.5
else:                                  score = 0.0
```

### AI Explainability
Every match result includes:
- ✓ Matching skills (green)
- ✗ Missing skills (red)
- 💡 Improvement suggestions (natural language)
- Score breakdown per component

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/auth/me` | Get current user info |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resumes/upload` | Upload PDF/DOCX resume |
| GET | `/api/resumes` | List user's resumes |
| GET | `/api/resumes/{id}` | Get resume details + skills |
| DELETE | `/api/resumes/{id}` | Delete a resume |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List jobs (search, filter, sort) |
| GET | `/api/jobs/{id}` | Get job details |
| POST | `/api/jobs` | Create job (admin only) |
| PUT | `/api/jobs/{id}` | Update job (admin only) |
| DELETE | `/api/jobs/{id}` | Deactivate job (admin only) |
| POST | `/api/jobs/{id}/save` | Bookmark job |
| DELETE | `/api/jobs/{id}/save` | Remove bookmark |
| GET | `/api/jobs/saved` | Get bookmarked jobs |

### Matching
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/matching/analyze` | Run AI match analysis |
| GET | `/api/matching/{resume_id}/{job_id}` | Get existing match |
| GET | `/api/matching/history` | Get all match history |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations` | Get AI job recommendations |
| GET | `/api/recommendations/history` | Get saved recommendations |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs/{id}/apply` | Apply to a job |
| GET | `/api/applications` | List applications |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/analytics` | Platform analytics |
| DELETE | `/api/admin/users/{id}` | Deactivate user |

> **Interactive API Docs**: http://localhost:8000/docs (Swagger UI auto-generated by FastAPI)

---

## 🚀 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

### Clone / Navigate to Project
```bash
# Navigate to project directory
cd resume-screening-system
```

---

## ⚙️ Environment Variables

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
# Database (SQLite for dev, change URL for PostgreSQL in production)
DATABASE_URL=sqlite:///./resume_screening.db

# JWT Security (CHANGE THIS in production — use a 256-bit random string)
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Upload
MAX_UPLOAD_SIZE_MB=10
UPLOAD_DIR=uploads

# Seed Credentials (used on first startup)
ADMIN_EMAIL=admin@resumeai.com
ADMIN_PASSWORD=admin123
DEMO_USER_EMAIL=demo@resumeai.com
DEMO_USER_PASSWORD=demo123
```

**For PostgreSQL production:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/resume_db
```

---

## 🐍 Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy English model (for NER-based name extraction)
python -m spacy download en_core_web_sm

# (Optional) Pre-download sentence-transformers model for semantic similarity
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

> **Note**: If spaCy or sentence-transformers are unavailable, the system automatically falls back to regex-based extraction and TF-IDF similarity. The application will not crash.

---

## ⚛️ Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

---

## ▶️ Running the Application

### Start Backend

```bash
# From backend/ directory (with venv activated)
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On first startup, the system automatically:
1. Creates all database tables
2. Seeds the database with 7 realistic job postings
3. Creates the admin user (`admin@resumeai.com`)
4. Creates the demo user (`demo@resumeai.com`)

Backend runs at: **http://localhost:8000**
API Docs (Swagger): **http://localhost:8000/docs**
Health Check: **http://localhost:8000/health**

### Start Frontend

```bash
# From frontend/ directory (separate terminal)
cd frontend
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🧪 Testing

```bash
# From backend/ directory (with venv activated)
cd backend

# Run all tests
pytest tests/ -v

# Run specific test files
pytest tests/test_auth.py -v
pytest tests/test_matching.py -v
pytest tests/test_resume.py -v
pytest tests/test_jobs.py -v

# Run with coverage report
pytest tests/ --cov=app --cov-report=html
```

**Test Coverage:**
| Test File | What It Tests |
|-----------|--------------|
| `test_auth.py` | Registration, login, invalid credentials, JWT |
| `test_resume.py` | File upload, skill extraction, normalization |
| `test_matching.py` | Scoring algorithm, TF-IDF, Jaccard, education/experience |
| `test_jobs.py` | Job CRUD, save/unsave, apply, admin protection |

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@resumeai.com` | `admin123` |
| **Demo User** | `demo@resumeai.com` | `demo123` |

---

## 📱 Application Pages

| # | Page | Route | Description |
|---|------|-------|-------------|
| 1 | Home | `/` | Landing page with features and CTA |
| 2 | Login | `/login` | JWT-based authentication |
| 3 | Register | `/register` | New user registration |
| 4 | Dashboard | `/dashboard` | Stats, charts, recent activity |
| 5 | Resume Upload | `/resume/upload` | Drag-and-drop PDF/DOCX upload |
| 6 | Resume Analysis | `/resume/analysis` | Extracted info + skill badges + score |
| 7 | Job Search | `/jobs` | Search, filter, sort jobs |
| 8 | Job Details | `/jobs/:id` | Full job info + apply |
| 9 | Job Match | `/jobs/:id/match` | AI resume vs job comparison |
| 10 | Recommendations | `/recommendations` | AI-ranked job recommendations |
| 11 | Saved Jobs | `/saved-jobs` | Bookmarked jobs |
| 12 | Applications | `/applications` | Application tracking |
| 13 | Profile | `/profile` | User profile + resume list |
| 14 | Admin Dashboard | `/admin` | Platform analytics (admin) |
| 15 | Job Management | `/admin/jobs` | Job CRUD with modals (admin) |

---

## 📊 Demo Flow

```
1. Register at /register (or use demo@resumeai.com / demo123)
2. Login → redirected to /dashboard
3. Go to /resume/upload → drag-drop your PDF/DOCX resume
4. AI extracts: name, email, skills, education, experience, score
5. Go to /resume/analysis → see full extracted profile
6. Go to /jobs → browse the 7 seeded job postings
7. Click any job → "Match My Resume" button
8. AI computes score: Skills 50% + Semantic 20% + Exp 20% + Edu 10%
9. See: matching skills ✓, missing skills ✗, suggestions 💡
10. Go to /recommendations → AI ranks all jobs by your compatibility
11. Save interesting jobs (bookmark) or Apply
12. Dashboard updates with your analysis history and stats
13. Login as admin@resumeai.com → access /admin and /admin/jobs
```

---

## 🚀 Future Enhancements

| Enhancement | Description |
|-------------|-------------|
| **Collaborative Filtering** | Recommend jobs based on what similar candidates applied to |
| **Resume Builder** | Generate an improved resume based on job requirements |
| **Email Notifications** | Alert candidates about new matching jobs |
| **LinkedIn Import** | Parse LinkedIn profiles in addition to PDF/DOCX |
| **Real-time Jobs** | Integrate with LinkedIn Jobs / Indeed API |
| **Resume Scoring History** | Track resume score improvements over time |
| **ATS Score** | Simulate ATS (Applicant Tracking System) scoring |
| **Cover Letter Generator** | AI-generated cover letters using LLMs |
| **Video Profiles** | Candidates can add intro videos |
| **Analytics for Candidates** | Skill trend analysis in their industry |
| **PostgreSQL + Redis** | Production-grade database + caching |
| **Docker Compose** | One-command deployment |
| **Kubernetes Deployment** | Scalable cloud deployment |

---

## 🛡️ Security Features

- ✅ bcrypt password hashing (passlib)
- ✅ JWT token-based authentication (python-jose)
- ✅ Role-based authorization (candidate / admin)
- ✅ File type validation (extension + MIME)
- ✅ File size limits (configurable via env)
- ✅ Input validation (Pydantic schemas)
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ CORS restricted to frontend origins
- ✅ No plain-text passwords stored
- ✅ Internal errors not exposed to users

---

## 📦 Dependencies

### Backend (`requirements.txt`)
```
fastapi, uvicorn, sqlalchemy, alembic, pydantic, pydantic-settings,
python-jose[cryptography], passlib[bcrypt], python-multipart,
PyMuPDF, python-docx, scikit-learn, numpy, pandas,
spacy, sentence-transformers, httpx, pytest, pytest-asyncio
```

### Frontend (`package.json`)
```
react, react-dom, react-router-dom, axios, recharts,
react-hot-toast, @heroicons/react, @headlessui/react,
tailwindcss, vite, @vitejs/plugin-react
```

---

*Built with ❤️ for AI & Data Science college project demonstration.*
