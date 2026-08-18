from sqlalchemy.orm import Session
from app.models.user import User
from app.models.job import Job
from app.models.skill import Skill
from app.config import settings
from app.utils.auth import hash_password
from app.ai.skill_extractor import normalize_skill

def seed_if_empty(db: Session):
    if db.query(User).count() > 0:
        return
        
    admin = User(name='Admin', email=settings.ADMIN_EMAIL, role='admin', password_hash=hash_password(settings.ADMIN_PASSWORD))
    demo = User(name='Demo User', email=settings.DEMO_USER_EMAIL, role='candidate', password_hash=hash_password(settings.DEMO_USER_PASSWORD))
    
    db.add(admin)
    db.add(demo)
    db.commit()
    db.refresh(admin)
    
    jobs_data = [
        {
            "title": "AI/ML Engineer", "company": "TechCorp AI", "location": "Bangalore, India",
            "experience_required": 2, "education_required": "B.Tech/B.E Computer Science",
            "skills": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "scikit-learn", "NLP", "Computer Vision", "SQL", "Git"],
            "description": "We are looking for an AI/ML Engineer to join our team. You will be responsible for building and deploying ML models. Must have experience with deep learning frameworks. Natural language processing and computer vision experience is a plus. Join us to build the future of AI."
        },
        {
            "title": "Data Analyst", "company": "DataVision Analytics", "location": "Hyderabad, India",
            "experience_required": 1, "education_required": "Bachelor's",
            "skills": ["Python", "SQL", "Excel", "Power BI", "Tableau", "Data Visualization", "Statistical Analysis", "Pandas"],
            "description": "Seeking a Data Analyst to extract insights from complex datasets. You will build dashboards and reports for business stakeholders. Strong SQL and visualization skills required. Experience with Pandas is highly preferred."
        },
        {
            "title": "Data Scientist", "company": "InsightAI Solutions", "location": "Mumbai, India",
            "experience_required": 3, "education_required": "M.Tech/M.Sc Data Science",
            "skills": ["Python", "Machine Learning", "Deep Learning", "SQL", "Statistics", "Feature Engineering", "Pandas", "NumPy", "scikit-learn", "Data Visualization"],
            "description": "Data Scientist needed to lead advanced analytics projects. You will build predictive models and work closely with engineering teams. Solid understanding of statistics and machine learning algorithms is required. M.Tech or M.Sc preferred."
        },
        {
            "title": "Python Developer", "company": "CodeCraft Technologies", "location": "Pune, India",
            "experience_required": 1, "education_required": "B.Tech Computer Science",
            "skills": ["Python", "FastAPI", "Django", "Flask", "REST API", "SQL", "PostgreSQL", "Git", "Docker"],
            "description": "Looking for a Python Developer to build robust backend services. Experience with FastAPI and Django is required. You will work on REST APIs and integrate with relational databases. Docker knowledge is a plus."
        },
        {
            "title": "Full Stack Developer", "company": "WebSphere Solutions", "location": "Chennai, India",
            "experience_required": 2, "education_required": "B.Tech Computer Science",
            "skills": ["React", "JavaScript", "TypeScript", "Node.js", "HTML", "CSS", "SQL", "MongoDB", "Git", "REST API", "Docker"],
            "description": "Full Stack Developer needed to work on modern web applications. You must be proficient in React and Node.js. Experience with both SQL and NoSQL databases is required. Strong problem-solving skills are essential."
        },
        {
            "title": "Business Intelligence Analyst", "company": "StrategyBI Corp", "location": "Delhi, India",
            "experience_required": 2, "education_required": "MBA/Bachelor's",
            "skills": ["Power BI", "Tableau", "SQL", "Excel", "Data Visualization", "Statistical Analysis", "Python", "ETL", "Data Warehousing"],
            "description": "Join us as a BI Analyst. You will design and maintain data warehouses and BI dashboards. Strong ETL experience and SQL skills are required. Help drive strategic decisions through data."
        },
        {
            "title": "Software Engineer", "company": "GlobalTech Systems", "location": "Hyderabad, India",
            "experience_required": 1, "education_required": "B.Tech Computer Science",
            "skills": ["Python", "Java", "SQL", "Git", "Data Structures", "Algorithms", "REST API", "Linux", "Agile"],
            "description": "Entry-level Software Engineer to join our agile development team. You will work on various backend systems. Strong fundamentals in data structures and algorithms are required. Experience with Java or Python is acceptable."
        }
    ]
    
    for jd in jobs_data:
        skills = jd.pop("skills")
        job = Job(**jd, created_by=admin.id)
        db.add(job)
        db.flush()  # get job.id before adding skills
        
        for sk in skills:
            norm = normalize_skill(sk).lower()  # Always store as lowercase
            skill_obj = db.query(Skill).filter(Skill.normalized_name == norm).first()
            if not skill_obj:
                skill_obj = Skill(name=sk, normalized_name=norm, category="seed")
                db.add(skill_obj)
                db.flush()  # ensure skill gets ID
            if skill_obj not in job.skills:
                job.skills.append(skill_obj)
            
    db.commit()

