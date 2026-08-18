def test_list_jobs(test_client):
    response = test_client.get("/api/jobs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_job_by_id(test_client, sample_job):
    response = test_client.get(f"/api/jobs/{sample_job.id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Test Job"

def test_create_job_as_admin(test_client, admin_token):
    job_data = {
        "title": "Backend Dev",
        "company": "Tech Co",
        "description": "Desc",
        "experience_required": 2,
        "skills": ["Python", "FastAPI"]
    }
    response = test_client.post("/api/jobs", json=job_data, headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert response.json()["title"] == "Backend Dev"
    assert "Python" in response.json()["skills"]

def test_create_job_as_candidate_forbidden(test_client, user_token):
    job_data = {
        "title": "Backend Dev",
        "company": "Tech Co",
        "description": "Desc",
        "experience_required": 2,
        "skills": ["Python", "FastAPI"]
    }
    response = test_client.post("/api/jobs", json=job_data, headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 403

def test_save_job(test_client, user_token, sample_job):
    response = test_client.post(f"/api/jobs/{sample_job.id}/save", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 200

def test_unsave_job(test_client, user_token, sample_job):
    response = test_client.delete(f"/api/jobs/{sample_job.id}/save", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 200

def test_apply_to_job(test_client, user_token, sample_job):
    response = test_client.post(f"/api/applications/jobs/{sample_job.id}/apply", json={"job_id": sample_job.id}, headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 200
    assert response.json()["status"] == "applied"

def test_get_applications(test_client, user_token):
    response = test_client.get("/api/applications", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
