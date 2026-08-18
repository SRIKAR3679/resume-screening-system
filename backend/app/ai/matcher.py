import math
import logging
from app.ai.skill_extractor import compute_skill_similarity, get_matching_skills, get_missing_skills
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

SKILL_WEIGHT = 0.50
SEMANTIC_WEIGHT = 0.20
EXPERIENCE_WEIGHT = 0.20
EDUCATION_WEIGHT = 0.10

sentence_model = None

def compute_tfidf_similarity(text_a: str, text_b: str) -> float:
    try:
        if not text_a or not text_b or len(text_a) < 10 or len(text_b) < 10:
            return 0.3
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf = vectorizer.fit_transform([text_a, text_b])
        return cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
    except Exception as e:
        logger.error(f"Error computing TF-IDF: {e}")
        return 0.3

def compute_semantic_similarity(text_a: str, text_b: str) -> float:
    global sentence_model
    try:
        from sentence_transformers import SentenceTransformer
        if sentence_model is None:
            sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        emb1 = sentence_model.encode([text_a])
        emb2 = sentence_model.encode([text_b])
        return cosine_similarity(emb1, emb2)[0][0]
    except ImportError:
        logger.warning("sentence_transformers not available, falling back to TF-IDF")
        return compute_tfidf_similarity(text_a, text_b)
    except Exception as e:
        logger.error(f"Error in semantic similarity: {e}")
        return compute_tfidf_similarity(text_a, text_b)

def compute_experience_score(candidate_years: float, required_years: float) -> float:
    if required_years <= 0:
        return 1.0
    if candidate_years >= required_years:
        return 1.0
    if candidate_years == 0:
        return 0.2
    return min(1.0, candidate_years / required_years)

def compute_education_score(candidate_education: list[str], required_education: str) -> float:
    if not required_education:
        return 1.0
    
    levels = {'phd': 5, 'master': 4, 'm.tech': 4, 'mba': 4, 'bachelor': 3, 'b.tech': 3, 'b.e': 3, 'b.sc': 3, 'associate': 2, 'diploma': 1, 'none': 0}
    
    req_level = 0
    req_lower = required_education.lower()
    for kw, level in levels.items():
        if kw in req_lower:
            req_level = max(req_level, level)
            
    cand_level = 0
    for edu in candidate_education:
        edu_lower = edu.lower()
        for kw, level in levels.items():
            if kw in edu_lower:
                cand_level = max(cand_level, level)
                
    if cand_level >= req_level: return 1.0
    if cand_level == req_level - 1: return 0.5
    return 0.0

def generate_suggestions(missing_skills: list[str], experience_score: float, education_score: float) -> list[str]:
    suggestions = []
    if missing_skills:
        top_missing = missing_skills[:3]
        suggestions.append(f"Consider learning or improving these skills: {', '.join(top_missing)}.")
    if experience_score < 0.7:
        suggestions.append("Try building more projects or gaining more experience to match the requirement.")
    if education_score < 0.5:
        suggestions.append("Your education level might be below the required qualifications.")
    return suggestions

def match_resume_to_job(
    resume_text: str,
    resume_skills: list[str],
    resume_education: list[str],
    resume_experience_years: float,
    job_description: str,
    job_skills: list[str],
    job_experience_required: float,
    job_education_required: str
) -> dict:
    
    skill_score = compute_skill_similarity(resume_skills, job_skills)
    semantic_score = compute_semantic_similarity(resume_text, job_description)
    experience_score = compute_experience_score(resume_experience_years, job_experience_required)
    education_score = compute_education_score(resume_education, job_education_required)
    
    overall_score = (
        (skill_score * SKILL_WEIGHT) + 
        (semantic_score * SEMANTIC_WEIGHT) + 
        (experience_score * EXPERIENCE_WEIGHT) + 
        (education_score * EDUCATION_WEIGHT)
    ) * 100
    
    matching_skills_list = get_matching_skills(resume_skills, job_skills)
    missing_skills_list = get_missing_skills(resume_skills, job_skills)
    
    suggestions = generate_suggestions(missing_skills_list, experience_score, education_score)
    
    return {
        "overall_score": round(overall_score, 2),
        "skill_score": round(skill_score, 2),
        "semantic_score": round(semantic_score, 2),
        "experience_score": round(experience_score, 2),
        "education_score": round(education_score, 2),
        "matching_skills": matching_skills_list,
        "missing_skills": missing_skills_list,
        "suggestions": suggestions
    }
