import io
from app.ai.skill_extractor import extract_skills_from_text, normalize_skill

def test_upload_invalid_file_type(test_client, user_token):
    file_content = b"fake image content"
    files = {"file": ("test.jpg", io.BytesIO(file_content), "image/jpeg")}
    response = test_client.post("/api/resumes/upload", headers={"Authorization": f"Bearer {user_token}"}, files=files)
    assert response.status_code == 400

def test_upload_unauthenticated(test_client):
    file_content = b"fake pdf content"
    files = {"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")}
    response = test_client.post("/api/resumes/upload", files=files)
    assert response.status_code == 401

def test_get_resumes(test_client, user_token):
    response = test_client.get("/api/resumes", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_skill_extraction():
    text = "I am a software engineer with experience in Python, JavaScript, and Machine Learning. I also know React and Node.js."
    skills = extract_skills_from_text(text)
    assert "Python" in skills
    assert "JavaScript" in skills
    assert "Machine Learning" in skills
    assert "React" in skills
    assert "Node.js" in skills

def test_skill_normalization():
    assert normalize_skill("ml") == "Machine Learning"
    assert normalize_skill("Py") == "Python"
    assert normalize_skill("REACT.js") == "React"
