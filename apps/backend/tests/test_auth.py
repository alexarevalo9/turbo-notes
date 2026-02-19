import pytest

REGISTER_URL = "/api/auth/register/"
LOGIN_URL = "/api/auth/token/"
REFRESH_URL = "/api/auth/token/refresh/"


@pytest.mark.django_db
def test_register_success(api_client):
    payload = {"email": "newuser@example.com", "password": "securepassword123"}
    response = api_client.post(REGISTER_URL, payload)
    assert response.status_code == 201
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_register_duplicate_email(api_client):
    payload = {"email": "dup@example.com", "password": "securepassword123"}
    api_client.post(REGISTER_URL, payload)
    response = api_client.post(REGISTER_URL, payload)
    assert response.status_code == 400


@pytest.mark.django_db
def test_register_short_password(api_client):
    payload = {"email": "short@example.com", "password": "abc"}
    response = api_client.post(REGISTER_URL, payload)
    assert response.status_code == 400


@pytest.mark.django_db
def test_login_success(api_client, user):
    payload = {"email": user.email, "password": "testpass123"}
    response = api_client.post(LOGIN_URL, payload)
    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_login_wrong_password(api_client, user):
    payload = {"email": user.email, "password": "wrongpassword"}
    response = api_client.post(LOGIN_URL, payload)
    assert response.status_code == 401


@pytest.mark.django_db
def test_login_nonexistent_user(api_client):
    payload = {"email": "nobody@example.com", "password": "somepassword"}
    response = api_client.post(LOGIN_URL, payload)
    assert response.status_code == 401


@pytest.mark.django_db
def test_token_refresh_success(api_client, user):
    login_response = api_client.post(
        LOGIN_URL, {"email": user.email, "password": "testpass123"}
    )
    refresh_token = login_response.data["refresh"]
    response = api_client.post(REFRESH_URL, {"refresh": refresh_token})
    assert response.status_code == 200
    assert "access" in response.data


@pytest.mark.django_db
def test_token_refresh_invalid(api_client):
    response = api_client.post(REFRESH_URL, {"refresh": "not-a-valid-token"})
    assert response.status_code == 401
