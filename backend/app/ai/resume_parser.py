"""
Resume Parser Module
====================
Extracts structured information from PDF and DOCX resumes.
Handles text extraction, cleaning, and entity recognition with graceful fallbacks.
"""

import re
import json
import logging
from pathlib import Path
from collections import Counter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Text Extraction ──────────────────────────────────────────────────────────

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file using PyMuPDF (fitz)."""
    try:
        import fitz  # PyMuPDF
        text = ""
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text("text") + "\n"
        doc.close()
        return text
    except ImportError:
        logger.warning("PyMuPDF not installed. Trying pdfplumber fallback.")
        return _extract_pdf_fallback(file_path)
    except Exception as e:
        logger.error(f"Error extracting PDF text: {e}")
        return ""


def _extract_pdf_fallback(file_path: str) -> str:
    """Fallback PDF extraction using pdfplumber if PyMuPDF unavailable."""
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += (page.extract_text() or "") + "\n"
        return text
    except Exception as e:
        logger.error(f"PDF fallback extraction failed: {e}")
        return ""


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a DOCX file using python-docx."""
    try:
        import docx
        doc = docx.Document(file_path)
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        # Also extract table content
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        paragraphs.append(cell.text.strip())
        return "\n".join(paragraphs)
    except Exception as e:
        logger.error(f"Error extracting DOCX text: {e}")
        return ""


def clean_text(text: str) -> str:
    """Clean and normalize extracted text."""
    # Normalize line endings
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    # Remove excessive blank lines (keep max 2 consecutive newlines)
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Remove excessive spaces within lines
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
    return '\n'.join(lines).strip()


# ─── Entity Extraction ────────────────────────────────────────────────────────

def extract_email(text: str) -> str:
    """Extract email address using regex."""
    pattern = r'\b[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\b'
    match = re.search(pattern, text)
    return match.group(0) if match else ""


def extract_phone(text: str) -> str:
    """Extract phone number using regex (handles multiple formats)."""
    patterns = [
        r'\+?[\d\s\-\(\)]{10,15}',  # International
        r'\b\d{10}\b',               # 10-digit Indian/US
        r'\(\d{3}\)\s*\d{3}[-.]?\d{4}',  # US format
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0).strip()
    return ""


def extract_name(text: str) -> str:
    """
    Extract candidate name using spaCy NER (PERSON entity).
    Falls back to first non-empty line of resume if spaCy unavailable.
    """
    # Try spaCy NER first
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        # Only process first 500 chars for efficiency
        doc = nlp(text[:500])
        for ent in doc.ents:
            if ent.label_ == "PERSON" and len(ent.text.split()) >= 2:
                return ent.text.strip()
    except Exception:
        pass  # Fall through to regex-based approach

    # Fallback: first meaningful line (likely the name in most resume formats)
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    for line in lines[:5]:
        # Skip lines that look like emails, phones, or section headers
        if (not re.search(r'[@\d]', line) and
                len(line.split()) >= 2 and
                len(line) < 60 and
                not any(kw in line.upper() for kw in ['RESUME', 'CV', 'CURRICULUM', 'PROFILE', 'SUMMARY'])):
            return line
    return lines[0] if lines else "Unknown"


def extract_education(text: str) -> list:
    """Extract education information by searching for degree keywords and context."""
    degree_keywords = [
        'B.Tech', 'B.E', 'B.Sc', 'B.Com', 'B.A', 'BCA', 'BBA',
        'M.Tech', 'M.E', 'M.Sc', 'MBA', 'MCA', 'M.A', 'M.Com',
        'Ph.D', 'PhD', 'Bachelor', 'Master', 'Doctorate',
        'B.S.', 'M.S.', 'B.Eng', 'M.Eng',
        '10th', '12th', 'HSC', 'SSC', 'Diploma', 'Associate'
    ]
    found = []
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if any(kw.lower() in line.lower() for kw in degree_keywords):
            cleaned_line = line.strip()
            if cleaned_line and len(cleaned_line) > 3:
                found.append(cleaned_line)
    # Return unique entries, max 5
    seen = set()
    unique = []
    for item in found:
        key = item.lower()[:40]
        if key not in seen:
            seen.add(key)
            unique.append(item)
    return unique[:5]


def extract_experience_years(text: str) -> float:
    """
    Extract total years of experience from resume text.
    Handles patterns like '2 years', '3+ years', date ranges like 'Jan 2021 – Dec 2022'.
    """
    # Direct mention of experience years
    patterns = [
        r'(\d+(?:\.\d+)?)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)',
        r'experience\s*(?:of\s*)?(\d+(?:\.\d+)?)\+?\s*years?',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))

    # Try to compute from date ranges
    year_pattern = r'\b(20\d{2}|19\d{2})\b'
    years_found = [int(y) for y in re.findall(year_pattern, text)]
    if len(years_found) >= 2:
        min_year = min(years_found)
        max_year = max(years_found)
        if 1990 <= min_year <= 2030 and 1990 <= max_year <= 2030:
            computed = max_year - min_year
            if 0 < computed < 40:
                return float(computed)

    return 0.0


def extract_section(text: str, section_names: list, next_sections: list = None) -> str:
    """
    Extract a named section from resume text.
    Returns text between the section header and the next section header.
    """
    if next_sections is None:
        next_sections = [
            'experience', 'education', 'skills', 'projects', 'certifications',
            'awards', 'publications', 'languages', 'interests', 'references',
            'work', 'employment', 'summary', 'objective', 'contact'
        ]

    # Build pattern for section headers
    section_pattern = '|'.join(re.escape(s) for s in section_names)
    next_section_pattern = '|'.join(re.escape(s) for s in next_sections)

    # Match section header (case-insensitive, at start of line or standalone)
    match = re.search(
        rf'(?i)^[\s\-_•]*({section_pattern})[\s\-_:•]*$',
        text, re.MULTILINE
    )
    if not match:
        return ""

    start = match.end()
    # Find next section
    next_match = re.search(
        rf'(?i)^[\s\-_•]*({next_section_pattern})[\s\-_:•]*$',
        text[start:], re.MULTILINE
    )
    end = start + next_match.start() if next_match else len(text)
    return text[start:end].strip()


def extract_projects(text: str) -> list:
    """Extract project titles/descriptions from the Projects section."""
    section_text = extract_section(text, ['projects', 'academic projects', 'personal projects', 'key projects'])
    if not section_text:
        return []

    projects = []
    lines = [line.strip() for line in section_text.split('\n') if line.strip()]
    for line in lines:
        # Skip bullet points and short lines that are likely descriptions
        clean_line = re.sub(r'^[\•\-\*\u2022\u25cf]\s*', '', line).strip()
        if len(clean_line) > 10:
            projects.append(clean_line)

    return projects[:10]  # Limit to 10 projects


def extract_certifications(text: str) -> list:
    """Extract certifications from the Certifications section or inline mentions."""
    # Try section-based extraction
    section_text = extract_section(
        text,
        ['certifications', 'certificates', 'certification', 'credentials', 'courses']
    )

    certifications = []
    if section_text:
        lines = [line.strip() for line in section_text.split('\n') if line.strip()]
        for line in lines:
            clean_line = re.sub(r'^[\•\-\*\u2022\u25cf]\s*', '', line).strip()
            if len(clean_line) > 5:
                certifications.append(clean_line)

    # Also look for common certification keywords inline
    cert_patterns = [
        r'AWS\s+Certified\s+[\w\s]+',
        r'Google\s+(?:Cloud\s+)?Certified\s+[\w\s]+',
        r'Microsoft\s+Certified\s+[\w\s]+',
        r'Cisco\s+Certified\s+[\w\s]+',
        r'(?:TensorFlow|PyTorch|Coursera|edX|Udemy)\s+Certificate\s+(?:in\s+)?[\w\s]+',
    ]
    for pattern in cert_patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            cert = match.group(0).strip()
            if cert not in certifications:
                certifications.append(cert)

    return certifications[:10]


def extract_keywords(text: str, top_n: int = 20) -> list:
    """
    Extract top keywords using word frequency analysis with stopword removal.
    Returns most meaningful/frequent technical terms from the resume.
    """
    STOPWORDS = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
        'shall', 'can', 'not', 'no', 'nor', 'so', 'yet', 'both', 'either',
        'i', 'me', 'my', 'myself', 'we', 'our', 'you', 'your', 'he', 'she',
        'they', 'them', 'this', 'that', 'these', 'those', 'it', 'its',
        'as', 'if', 'then', 'than', 'while', 'when', 'where', 'how', 'who',
        'which', 'what', 'also', 'such', 'more', 'most', 'other', 'some', 'any',
        'all', 'each', 'every', 'both', 'few', 'more', 'most',
        'work', 'worked', 'working', 'developed', 'development', 'using', 'used',
        'experience', 'experienced', 'knowledge', 'well', 'good', 'strong',
        'ability', 'skills', 'skill', 'team', 'responsible', 'responsibilities',
        'year', 'years', 'month', 'months', 'new', 'current', 'previous',
    }

    # Extract words (2+ chars, alphabetic)
    words = re.findall(r'\b[a-zA-Z][a-zA-Z+#.]{1,}\b', text)
    # Filter stopwords and short words
    meaningful = [w.lower() for w in words if w.lower() not in STOPWORDS and len(w) >= 3]
    # Count frequencies
    counter = Counter(meaningful)
    # Return top N by frequency
    top_keywords = [word for word, count in counter.most_common(top_n) if count >= 2]
    return top_keywords


def compute_resume_score(parsed_data: dict) -> float:
    """
    Compute a resume completeness/quality score (0-100) based on:
    - Has name, email, phone
    - Has education info
    - Has extracted skills
    - Has experience years
    - Has projects
    - Has certifications
    - Text length (content density)
    """
    score = 0.0

    # Contact info completeness (20 points)
    if parsed_data.get("name") and parsed_data["name"] != "Unknown":
        score += 8
    if parsed_data.get("email"):
        score += 7
    if parsed_data.get("phone"):
        score += 5

    # Education (15 points)
    education = parsed_data.get("education", [])
    if isinstance(education, str):
        education = json.loads(education) if education else []
    if education:
        score += 15

    # Skills (25 points)
    skills = parsed_data.get("skills", [])
    skill_count = len(skills)
    if skill_count >= 10:
        score += 25
    elif skill_count >= 5:
        score += 15
    elif skill_count >= 2:
        score += 8

    # Experience (20 points)
    exp_years = parsed_data.get("experience_years", 0)
    if exp_years >= 3:
        score += 20
    elif exp_years >= 1:
        score += 12
    elif exp_years > 0:
        score += 5

    # Projects (10 points)
    projects = parsed_data.get("projects", [])
    if isinstance(projects, str):
        projects = json.loads(projects) if projects else []
    if len(projects) >= 3:
        score += 10
    elif len(projects) >= 1:
        score += 5

    # Certifications (5 points)
    certs = parsed_data.get("certifications", [])
    if isinstance(certs, str):
        certs = json.loads(certs) if certs else []
    if certs:
        score += 5

    # Text richness (5 points)
    text = parsed_data.get("text", "")
    if len(text) > 2000:
        score += 5
    elif len(text) > 500:
        score += 2

    return min(100.0, round(score, 1))


# ─── Main Parser ──────────────────────────────────────────────────────────────

def parse_resume(file_path: str) -> dict:
    """
    Main resume parser function.
    Uses Groq AI for intelligent extraction when available,
    falls back to regex-based extraction if Groq is not configured.

    Returns:
        dict with keys: text, name, email, phone, education, experience_years,
                         projects, certifications, keywords, summary
    """
    file_path_obj = Path(file_path)
    ext = file_path_obj.suffix.lower()

    # Extract raw text based on file type
    raw_text = ""
    if ext == '.pdf':
        raw_text = extract_text_from_pdf(file_path)
    elif ext in ('.docx', '.doc'):
        raw_text = extract_text_from_docx(file_path)
    else:
        logger.error(f"Unsupported file type: {ext}")

    if not raw_text:
        logger.warning(f"No text extracted from {file_path}")

    cleaned_text = clean_text(raw_text)

    # ── Try Groq AI parsing first ──────────────────────────────────────────
    try:
        from app.ai.groq_engine import parse_resume_with_groq, is_groq_available
        if is_groq_available():
            logger.info("Using Groq AI for resume parsing...")
            groq_result = parse_resume_with_groq(cleaned_text)
            if groq_result:
                logger.info(f"Groq parsed: {groq_result.get('name')} | {len(groq_result.get('skills', []))} skills")
                return {
                    "text": cleaned_text,
                    "name": groq_result.get("name") or extract_name(raw_text),
                    "email": groq_result.get("email") or extract_email(cleaned_text),
                    "phone": groq_result.get("phone") or extract_phone(cleaned_text),
                    "education": json.dumps(groq_result.get("education") or extract_education(raw_text)),
                    "experience_years": float(groq_result.get("experience_years") or 0),
                    "projects": json.dumps(groq_result.get("projects") or extract_projects(raw_text)),
                    "certifications": json.dumps(groq_result.get("certifications") or extract_certifications(raw_text)),
                    "keywords": json.dumps(groq_result.get("keywords") or extract_keywords(cleaned_text)),
                    "summary": groq_result.get("summary", ""),
                    # Also return skills so router can use them
                    "_groq_skills": groq_result.get("skills", []),
                    "_parsed_by": "groq",
                }
    except Exception as e:
        logger.warning(f"Groq parsing failed, falling back to regex: {e}")

    # ── Regex fallback ─────────────────────────────────────────────────────
    logger.info("Using regex-based resume parsing...")
    education_list  = extract_education(raw_text)
    projects_list   = extract_projects(raw_text)
    certs_list      = extract_certifications(raw_text)
    keywords_list   = extract_keywords(cleaned_text)

    return {
        "text": cleaned_text,
        "name": extract_name(raw_text),
        "email": extract_email(cleaned_text),
        "phone": extract_phone(cleaned_text),
        "education": json.dumps(education_list),
        "experience_years": extract_experience_years(cleaned_text),
        "projects": json.dumps(projects_list),
        "certifications": json.dumps(certs_list),
        "keywords": json.dumps(keywords_list),
        "summary": "",
        "_parsed_by": "regex",
    }
