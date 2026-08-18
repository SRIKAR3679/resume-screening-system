from app.ai.matcher import compute_experience_score, compute_education_score, compute_skill_similarity, match_resume_to_job
from app.ai.skill_extractor import get_matching_skills

def test_experience_score():
    assert compute_experience_score(3, 2) == 1.0
    assert compute_experience_score(1, 2) == 0.5
    assert compute_experience_score(0, 2) == 0.2
    assert compute_experience_score(5, 0) == 1.0

def test_education_score():
    assert compute_education_score(["B.Tech Computer Science"], "Bachelor's") == 1.0
    assert compute_education_score(["B.Tech Computer Science"], "Master's") == 0.5
    assert compute_education_score(["Diploma"], "Master's") == 0.0

def test_jaccard_similarity():
    skills_a = ["Python", "SQL", "Git"]
    skills_b = ["Python", "SQL", "Docker"]
    similarity = compute_skill_similarity(skills_a, skills_b)
    assert similarity == 0.5 # 2 intersection / 4 union

def test_full_match_pipeline():
    res = match_resume_to_job(
        resume_text="I am a Python developer with SQL skills.",
        resume_skills=["Python", "SQL"],
        resume_education=["B.Tech"],
        resume_experience_years=2.0,
        job_description="Looking for Python dev with SQL.",
        job_skills=["Python", "SQL", "Git"],
        job_experience_required=2.0,
        job_education_required="Bachelor"
    )
    assert res["experience_score"] == 1.0
    assert res["education_score"] == 1.0
    assert "Python" in res["matching_skills"]
    assert "Git" in res["missing_skills"]
