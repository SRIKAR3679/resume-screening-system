from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = 'sqlite:///./resume_screening.db'
    SECRET_KEY: str = 'your-secret-key-change-in-production-use-256-bit-random'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = 'uploads'
    ADMIN_EMAIL: str = 'admin@resumeai.com'
    ADMIN_PASSWORD: str = 'admin123'
    DEMO_USER_EMAIL: str = 'demo@resumeai.com'
    DEMO_USER_PASSWORD: str = 'demo123'

    class Config:
        env_file = ".env"

settings = Settings()
