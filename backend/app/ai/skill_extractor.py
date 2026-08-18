"""
Skill Extractor Module
======================
Extracts, normalizes, and compares skills from resume text and job descriptions.
Uses a comprehensive skill dictionary with normalization mappings.
"""

from typing import Dict, List, Set

# ─── Skill Database ───────────────────────────────────────────────────────────
# Organized by category. Used for extraction and categorization.

SKILLS_DB: Dict[str, List[str]] = {
    'programming': [
        'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'C',
        'R', 'Go', 'Golang', 'Kotlin', 'Swift', 'PHP', 'Ruby', 'Scala',
        'MATLAB', 'Perl', 'Rust', 'Dart', 'Lua', 'Haskell', 'Julia',
        'Assembly', 'COBOL', 'Fortran', 'VBA', 'Groovy'
    ],
    'database': [
        'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite',
        'Oracle', 'Cassandra', 'DynamoDB', 'Elasticsearch', 'HBase',
        'Neo4j', 'CouchDB', 'MariaDB', 'MS SQL Server', 'Snowflake',
        'BigQuery', 'Redshift', 'InfluxDB', 'Firebase'
    ],
    'ml_ai': [
        'Machine Learning', 'Deep Learning', 'NLP', 'Natural Language Processing',
        'Computer Vision', 'Neural Networks', 'TensorFlow', 'PyTorch', 'Keras',
        'scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost', 'BERT', 'Transformers',
        'Reinforcement Learning', 'GANs', 'Generative AI', 'LLM',
        'Hugging Face', 'OpenCV', 'YOLO', 'FastAI', 'MLflow', 'Weights & Biases',
        'Feature Engineering', 'Model Deployment', 'A/B Testing', 'Statistics',
        'Statistical Analysis', 'Regression', 'Classification', 'Clustering',
        'Recommendation Systems', 'Time Series Analysis', 'Anomaly Detection'
    ],
    'data_science': [
        'Data Analysis', 'Data Visualization', 'Data Wrangling', 'Data Mining',
        'EDA', 'Exploratory Data Analysis', 'Pandas', 'NumPy', 'Matplotlib',
        'Seaborn', 'Plotly', 'Bokeh', 'Power BI', 'Tableau', 'Excel',
        'SPSS', 'SAS', 'STATA', 'Looker', 'Metabase', 'Superset',
        'ETL', 'Data Warehousing', 'Business Intelligence', 'BI',
        'Data Engineering', 'Apache Spark', 'Hadoop', 'Kafka', 'Airflow',
        'dbt', 'Data Pipeline', 'Data Modeling'
    ],
    'cloud': [
        'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes',
        'CI/CD', 'Jenkins', 'Terraform', 'Ansible', 'Chef', 'Puppet',
        'CloudFormation', 'Heroku', 'DigitalOcean', 'Vercel', 'Netlify',
        'Lambda', 'EC2', 'S3', 'RDS', 'ECS', 'EKS', 'AKS', 'GKE',
        'Serverless', 'Microservices', 'Service Mesh', 'Istio'
    ],
    'web': [
        'React', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js', 'Svelte',
        'Node.js', 'Express.js', 'FastAPI', 'Flask', 'Django', 'Spring Boot',
        'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind CSS', 'Bootstrap',
        'REST API', 'GraphQL', 'WebSockets', 'gRPC', 'OAuth', 'JWT',
        'Redux', 'MobX', 'Webpack', 'Vite', 'Babel'
    ],
    'tools': [
        'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Linux', 'Bash', 'Shell Scripting',
        'Jupyter', 'VS Code', 'PyCharm', 'IntelliJ', 'Eclipse',
        'Jira', 'Confluence', 'Agile', 'Scrum', 'Kanban', 'DevOps',
        'Postman', 'Swagger', 'Figma', 'Selenium', 'Pytest', 'JUnit',
        'SonarQube', 'Prometheus', 'Grafana', 'ELK Stack', 'Splunk'
    ],
    'soft': [
        'Communication', 'Leadership', 'Teamwork', 'Team Player',
        'Problem Solving', 'Critical Thinking', 'Time Management',
        'Adaptability', 'Creativity', 'Attention to Detail',
        'Project Management', 'Stakeholder Management', 'Presentation Skills',
        'Mentoring', 'Collaboration', 'Decision Making'
    ]
}

# ─── Normalization Map ────────────────────────────────────────────────────────
# Maps common variations/abbreviations to canonical skill names.

NORMALIZATION_MAP: Dict[str, str] = {
    # Programming languages
    'ml': 'Machine Learning',
    'py': 'Python',
    'python programming': 'Python',
    'python3': 'Python',
    'js': 'JavaScript',
    'javascript es6': 'JavaScript',
    'es6': 'JavaScript',
    'ts': 'TypeScript',
    'golang': 'Go',
    'c++': 'C++',
    'cplusplus': 'C++',
    'c#': 'C#',
    'csharp': 'C#',
    'dotnet': 'C#',
    '.net': 'C#',

    # Frameworks
    'react.js': 'React',
    'reactjs': 'React',
    'react native': 'React',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'express': 'Express.js',
    'expressjs': 'Express.js',
    'vue': 'Vue.js',
    'vuejs': 'Vue.js',
    'nextjs': 'Next.js',
    'django rest framework': 'Django',
    'drf': 'Django',
    'fast api': 'FastAPI',
    'spring': 'Spring Boot',

    # Databases
    'postgres': 'PostgreSQL',
    'pgsql': 'PostgreSQL',
    'mssql': 'MS SQL Server',
    'ms sql': 'MS SQL Server',
    'mysql server': 'MySQL',
    'nosql': 'MongoDB',
    'elasticsearch': 'Elasticsearch',
    'elastic search': 'Elasticsearch',
    'redis cache': 'Redis',
    'structured query language': 'SQL',

    # ML/AI
    'dl': 'Deep Learning',
    'cv': 'Computer Vision',
    'nlp': 'NLP',
    'natural language processing': 'NLP',
    'tf': 'TensorFlow',
    'tensorflow 2': 'TensorFlow',
    'sklearn': 'scikit-learn',
    'scikit learn': 'scikit-learn',
    'xgboost': 'XGBoost',
    'lightgbm': 'LightGBM',
    'llm': 'LLM',
    'large language model': 'LLM',
    'gen ai': 'Generative AI',
    'generative ai': 'Generative AI',
    'feature engineering': 'Feature Engineering',
    'time series': 'Time Series Analysis',

    # Data Science
    'power bi': 'Power BI',
    'powerbi': 'Power BI',
    'tableau desktop': 'Tableau',
    'ms excel': 'Excel',
    'microsoft excel': 'Excel',
    'pandas library': 'Pandas',
    'numpy': 'NumPy',
    'data viz': 'Data Visualization',
    'data visualisation': 'Data Visualization',
    'eda': 'Exploratory Data Analysis',
    'exploratory data analysis': 'EDA',
    'data warehouse': 'Data Warehousing',
    'apache spark': 'Apache Spark',
    'pyspark': 'Apache Spark',
    'etl pipeline': 'ETL',
    'business intelligence': 'BI',
    'bi tools': 'Business Intelligence',

    # Cloud & DevOps
    'amazon web services': 'AWS',
    'microsoft azure': 'Azure',
    'google cloud platform': 'GCP',
    'gcp': 'GCP',
    'k8s': 'Kubernetes',
    'docker container': 'Docker',
    'docker containers': 'Docker',
    'ci/cd pipeline': 'CI/CD',
    'continuous integration': 'CI/CD',
    'continuous deployment': 'CI/CD',
    'infrastructure as code': 'Terraform',
    'iac': 'Terraform',

    # Web
    'html5': 'HTML',
    'html 5': 'HTML',
    'css3': 'CSS',
    'css 3': 'CSS',
    'sass': 'CSS',
    'less': 'CSS',
    'tailwind': 'Tailwind CSS',
    'bootstrap css': 'Bootstrap',
    'rest': 'REST API',
    'restful api': 'REST API',
    'restful apis': 'REST API',
    'restful': 'REST API',
    'graphql api': 'GraphQL',

    # Tools
    'github': 'Git/GitHub',
    'git/github': 'Git/GitHub',
    'git version control': 'Git',
    'version control': 'Git',
    'jupyter notebook': 'Jupyter',
    'jupyter lab': 'Jupyter',
    'bash scripting': 'Bash',
    'shell script': 'Bash',
    'shell scripting': 'Bash',
    'agile methodology': 'Agile',
    'scrum methodology': 'Scrum',
    'pytest': 'Pytest',
    'unit testing': 'Pytest',

    # Soft skills
    'communication skills': 'Communication',
    'leadership skills': 'Leadership',
    'team player': 'Teamwork',
    'problem-solving': 'Problem Solving',
    'analytical thinking': 'Critical Thinking',
}


# ─── Skill Functions ──────────────────────────────────────────────────────────

def normalize_skill(skill: str) -> str:
    """
    Normalize a skill string to its canonical form.
    Checks the normalization map first, then returns title-cased version.
    """
    s = skill.lower().strip()
    return NORMALIZATION_MAP.get(s, skill.strip())


def extract_skills_from_text(text: str) -> List[str]:
    """
    Extract skills from resume text.
    Uses strict word-boundary matching to avoid false positives
    (e.g., 'R' should not match in 'CAREER', 'C' should not match in 'COLLEGE').

    Returns:
        List of unique normalized skill names actually found in the text.
    """
    import re
    text_lower = text.lower()
    found_skills: Set[str] = set()

    # Search through skills database with strict word boundary matching
    for category, skills in SKILLS_DB.items():
        for skill in skills:
            skill_lower = skill.lower()
            # Always use word boundary matching to avoid false positives
            pattern = r'(?<![a-z0-9])' + re.escape(skill_lower) + r'(?![a-z0-9])'
            if re.search(pattern, text_lower):
                found_skills.add(normalize_skill(skill))

    # Also check normalization map variants with word boundaries
    for variant, canonical in NORMALIZATION_MAP.items():
        if len(variant) <= 2:
            # Very short variants: strict whole-word match only
            pattern = r'\b' + re.escape(variant) + r'\b'
        else:
            pattern = r'(?<![a-z0-9])' + re.escape(variant) + r'(?![a-z0-9])'
        if re.search(pattern, text_lower):
            found_skills.add(canonical)

    return sorted(list(found_skills))



def get_skill_categories(skills: List[str]) -> Dict[str, List[str]]:
    """
    Group skills by category.

    Returns:
        Dict mapping category name to list of skills in that category.
    """
    skill_set = {normalize_skill(s).lower() for s in skills}
    categories: Dict[str, List[str]] = {}

    for cat, cat_skills in SKILLS_DB.items():
        matched = [s for s in cat_skills if normalize_skill(s).lower() in skill_set]
        if matched:
            categories[cat] = matched

    return categories


def compute_skill_similarity(skills_a: List[str], skills_b: List[str]) -> float:
    """
    Compute Jaccard similarity between two skill sets.
    Both sets are normalized before comparison.

    Returns:
        Float between 0.0 and 1.0.
    """
    set_a = {normalize_skill(s).lower() for s in skills_a}
    set_b = {normalize_skill(s).lower() for s in skills_b}

    if not set_a or not set_b:
        return 0.0

    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union


def get_missing_skills(candidate_skills: List[str], required_skills: List[str]) -> List[str]:
    """
    Find skills that are required but not present in the candidate's resume.

    Returns:
        List of missing skill names (in their original required form).
    """
    candidate_normalized = {normalize_skill(s).lower() for s in candidate_skills}
    missing = []
    for skill in required_skills:
        if normalize_skill(skill).lower() not in candidate_normalized:
            missing.append(skill)
    return missing


def get_matching_skills(candidate_skills: List[str], required_skills: List[str]) -> List[str]:
    """
    Find skills present in both candidate and job requirements.

    Returns:
        List of matching skill names (in their required form).
    """
    candidate_normalized = {normalize_skill(s).lower() for s in candidate_skills}
    matching = []
    for skill in required_skills:
        if normalize_skill(skill).lower() in candidate_normalized:
            matching.append(skill)
    return matching
