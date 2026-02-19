import pytest
from django.test import override_settings


@pytest.mark.django_db
def test_cors_allows_localhost(client):
    response = client.options(
        "/api/schema/",
        HTTP_ORIGIN="http://localhost:3000",
        HTTP_ACCESS_CONTROL_REQUEST_METHOD="GET",
    )
    assert response.get("Access-Control-Allow-Origin") == "http://localhost:3000"


@pytest.mark.django_db
def test_schema_endpoint_returns_200(client):
    response = client.get("/api/schema/")
    assert response.status_code == 200


@pytest.mark.django_db
def test_unauthenticated_request_returns_401(api_client):
    response = api_client.get("/api/auth/me/")
    assert response.status_code == 401
