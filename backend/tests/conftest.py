import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.job import Job
from app.utils.auth import hash_password

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def test_client(test_db):
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture(scope="module")
def admin_token(test_client, test_db):
    user = User(email="testadmin@example.com", name="Admin", password_hash=hash_password("adminpass"), role="admin")
    test_db.add(user)
    test_db.commit()
    response = test_client.post("/api/auth/login", json={"email": "testadmin@example.com", "password": "adminpass"})
    return response.json()["access_token"]

@pytest.fixture(scope="module")
def user_token(test_client, test_db):
    user = User(email="testuser@example.com", name="User", password_hash=hash_password("userpass"), role="candidate")
    test_db.add(user)
    test_db.commit()
    response = test_client.post("/api/auth/login", json={"email": "testuser@example.com", "password": "userpass"})
    return response.json()["access_token"]

@pytest.fixture(scope="module")
def sample_job(test_db):
    user = test_db.query(User).filter_by(role="admin").first()
    job = Job(title="Test Job", company="Test Co", description="Description", created_by=user.id)
    test_db.add(job)
    test_db.commit()
    test_db.refresh(job)
    return job
