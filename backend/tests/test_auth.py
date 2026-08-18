def test_register_success(test_client):
    response = test_client.post("/api/auth/register", json={
        "name": "New User",
        "email": "newuser@example.com",
        "password": "newpassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data

def test_register_duplicate_email(test_client):
    response = test_client.post("/api/auth/register", json={
        "name": "New User 2",
        "email": "newuser@example.com",
        "password": "password123"
    })
    assert response.status_code == 400

def test_login_success(test_client):
    response = test_client.post("/api/auth/login", json={
        "email": "newuser@example.com",
        "password": "newpassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_login_invalid_password(test_client):
    response = test_client.post("/api/auth/login", json={
        "email": "newuser@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_login_nonexistent_user(test_client):
    response = test_client.post("/api/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "password123"
    })
    assert response.status_code == 401

def test_get_me_authenticated(test_client, user_token):
    response = test_client.get("/api/auth/me", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "testuser@example.com"

def test_get_me_unauthenticated(test_client):
    response = test_client.get("/api/auth/me")
    assert response.status_code == 401
