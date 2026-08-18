"""
Groq AI Engine
==============
Centralized Groq API client for all AI operations:
- Resume parsing (structured extraction from raw text)
- Dynamic skill extraction  
- Semantic job-resume matching
- Personalized suggestions generation
- Dynamic job description generation

Uses llama-3.1-8b-instant (free, ultra-fast ~0.5s response).
Falls back gracefully if API key is missing or quota exceeded.
"""

import json
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# Module-level Groq client (initialized once)
_groq_client = None


def get_groq_client():
    """Get or create the Groq client. Returns None if key not configured."""
    global _groq_client
    if _groq_client is not None:
        return _groq_client

    try:
        from app.config import settings
        if not settings.GROQ_API_KEY:
            logger.warning("GROQ_API_KEY not set — AI features will use regex fallback")
            return None

        from groq import Groq
        _groq_client = Groq(api_key=settings.GROQ_API_KEY)
        logger.info("Groq AI client initialized successfully")
        return _groq_client
    except ImportError:
        logger.warning("groq package not installed — run: pip install groq")
        return None
    except Exception as e:
        logger.error(f"Failed to initialize Groq client: {e}")
        return None


def _call_groq(prompt: str, system: str = "", model: str = "llama-3.1-8b-instant", temperature: float = 0.1) -> Optional[str]:
    """
    Make a single Groq API call. Returns response text or None on failure.
    """
    client = get_groq_client()
    if not client:
        return None

    try:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=2048,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Groq API call failed: {e}")
        return None


def _extract_json(text: str) -> Optional[dict]:
    """Extract JSON object from Groq response text."""
    try:
        # Try direct parse first
        return json.loads(text)
    except Exception:
        # Find JSON block in markdown
        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass
        # Find raw JSON object
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                pass
    return None


# ─── Resume Parsing ────────────────────────────────────────────────────────────

def parse_resume_with_groq(resume_text: str) -> Optional[dict]:
    """
    Use Groq LLM to extract structured information from resume text.
    Returns a dict with all resume fields, or None if Groq unavailable.
    """
    if not resume_text or len(resume_text.strip()) < 50:
        return None

    # Truncate to first 4000 chars to stay within token limits
    truncated = resume_text[:4000]

    system = """You are an expert resume parser. Extract structured information from resume text.
Always respond with valid JSON only. No explanations, no markdown, just JSON."""

    prompt = f"""Parse this resume and extract all information into this exact JSON structure:

{{
  "name": "Full name of the candidate",
  "email": "email@example.com or null",
  "phone": "phone number or null",
  "education": ["B.Tech Computer Science - XYZ University 2023", "..."],
  "experience_years": 2.5,
  "skills": ["Python", "React", "Machine Learning", "SQL", "..."],
  "projects": ["Project 1 - description", "Project 2 - description"],
  "certifications": ["AWS Certified Developer", "..."],
  "languages": ["English", "Hindi"],
  "keywords": ["top", "relevant", "keywords", "from", "resume"],
  "summary": "2-3 sentence professional summary of this candidate"
}}

Rules:
- skills: extract ALL technical and soft skills mentioned (minimum 5, maximum 30)
- experience_years: estimate from work history dates, default 0 if fresher/student
- education: include degree, field, institution, year
- keywords: top 10 most relevant career keywords from the resume
- summary: write a personalized summary based on their actual profile

RESUME TEXT:
{truncated}

JSON:"""

    response = _call_groq(prompt, system)
    if not response:
        return None

    parsed = _extract_json(response)
    if not parsed:
        logger.warning("Could not extract JSON from Groq resume parse response")
        return None

    logger.info(f"Groq parsed resume: {parsed.get('name')} | {len(parsed.get('skills', []))} skills")
    return parsed


# ─── Skill Extraction ──────────────────────────────────────────────────────────

def extract_skills_with_groq(resume_text: str, job_description: str = "") -> Optional[list]:
    """
    Use Groq to extract and normalize skills from text.
    Optionally takes a job description to extract job-relevant skills.
    """
    truncated = resume_text[:3000]

    prompt = f"""Extract all technical and professional skills from this resume text.

Return ONLY a JSON array of skill strings. No explanation.
Include: programming languages, frameworks, tools, databases, cloud platforms, ML/AI, soft skills.
Normalize: "ML" → "Machine Learning", "JS" → "JavaScript", "py" → "Python"

Resume:
{truncated}

Return format: ["Python", "React", "Machine Learning", "SQL", ...]

JSON array:"""

    response = _call_groq(prompt)
    if not response:
        return None

    try:
        # Try to parse as JSON array
        response = response.strip()
        if response.startswith('['):
            skills = json.loads(response)
            return [s.strip() for s in skills if isinstance(s, str) and s.strip()]
        # Extract array from text
        match = re.search(r'\[.*?\]', response, re.DOTALL)
        if match:
            skills = json.loads(match.group(0))
            return [s.strip() for s in skills if isinstance(s, str) and s.strip()]
    except Exception as e:
        logger.error(f"Failed to parse skills from Groq response: {e}")

    return None


# ─── Dynamic Job Matching ──────────────────────────────────────────────────────

def match_resume_to_job_with_groq(
    resume_text: str,
    resume_skills: list,
    job_title: str,
    job_description: str,
    job_skills: list,
    experience_required: float = 0,
    education_required: str = ""
) -> Optional[dict]:
    """
    Use Groq to perform semantic resume-job matching and generate dynamic analysis.
    Returns scores, matching skills, missing skills, and personalized suggestions.
    """
    resume_snippet = resume_text[:2000]
    job_snippet = job_description[:1000]

    system = "You are an expert HR analyst. Analyze resume-job compatibility. Respond with valid JSON only."

    prompt = f"""Analyze this candidate's resume against the job requirements and provide a detailed compatibility assessment.

JOB: {job_title}
Job Description: {job_snippet}
Required Skills: {', '.join(job_skills[:15])}
Experience Required: {experience_required} years
Education Required: {education_required or 'Not specified'}

CANDIDATE:
Skills: {', '.join(resume_skills[:20])}
Resume Excerpt: {resume_snippet}

Provide this exact JSON:
{{
  "overall_score": 72,
  "skill_score": 75,
  "semantic_score": 68,
  "experience_score": 80,
  "education_score": 90,
  "matching_skills": ["Python", "SQL", "Machine Learning"],
  "missing_skills": ["Docker", "Kubernetes", "AWS"],
  "strengths": ["Strong Python background", "Good data analysis skills"],
  "suggestions": [
    "Learn Docker and containerization to match DevOps requirements",
    "Build a project using AWS to demonstrate cloud experience",
    "Add more leadership experience to strengthen your profile"
  ],
  "verdict": "Good Match - You meet 70% of requirements. Focus on cloud skills to improve.",
  "fit_level": "Good"
}}

Rules:
- All scores: 0-100 integers
- fit_level: "Excellent" (85+), "Good" (65-84), "Fair" (45-64), "Weak" (<45)
- suggestions: 3-5 specific, actionable, personalized to THIS candidate for THIS job
- verdict: 1-2 sentence personalized assessment

JSON:"""

    response = _call_groq(prompt, system)
    if not response:
        return None

    result = _extract_json(response)
    if not result:
        logger.warning("Could not extract JSON from Groq match response")
        return None

    logger.info(f"Groq match score for {job_title}: {result.get('overall_score')}%")
    return result


# ─── Dynamic Job Description Enhancement ──────────────────────────────────────

def generate_dynamic_job_content(
    job_title: str,
    job_description: str,
    candidate_skills: list,
    candidate_summary: str = ""
) -> Optional[dict]:
    """
    Generate personalized job description highlights based on the candidate's profile.
    Makes job listings dynamic and relevant to each specific candidate.
    """
    prompt = f"""A candidate is viewing this job posting. Generate personalized content to make it relevant to them.

JOB TITLE: {job_title}
JOB DESCRIPTION: {job_description[:800]}

CANDIDATE SKILLS: {', '.join(candidate_skills[:15])}
CANDIDATE PROFILE: {candidate_summary[:300] if candidate_summary else 'Not provided'}

Generate this JSON:
{{
  "why_good_fit": "2 sentences explaining why this candidate is a good fit based on their skills",
  "highlighted_requirements": ["requirement they match 1", "requirement they match 2", "requirement they match 3"],
  "growth_opportunities": ["how this role helps them grow based on their profile"],
  "action_points": ["Specific thing to highlight in cover letter", "Skill to mention in interview"],
  "personalized_tip": "One specific interview tip for this candidate for this role"
}}

JSON:"""

    response = _call_groq(prompt)
    if not response:
        return None

    return _extract_json(response)


# ─── Recommendations ───────────────────────────────────────────────────────────

def generate_recommendation_reason(
    candidate_skills: list,
    job_title: str,
    job_company: str,
    match_score: float,
    matching_skills: list
) -> str:
    """Generate a personalized recommendation reason for a job."""
    if not matching_skills:
        return f"This {job_title} role at {job_company} matches your profile with a {match_score:.0f}% compatibility score."

    top_skills = matching_skills[:3]
    skills_str = ", ".join(top_skills)

    prompt = f"""Write ONE sentence (max 20 words) explaining why this job is recommended for this candidate.

Job: {job_title} at {job_company}
Match Score: {match_score:.0f}%
Matching Skills: {skills_str}

Be specific and encouraging. Start with "Matches your" or "Your {top_skills[0]} skills" or similar.
Just the sentence, no quotes."""

    response = _call_groq(prompt, temperature=0.3)
    if response and len(response) < 150:
        return response.strip().strip('"').strip("'")

    return f"Matches your skills in {skills_str} with a {match_score:.0f}% compatibility score."


def is_groq_available() -> bool:
    """Check if Groq is available and configured."""
    return get_groq_client() is not None
