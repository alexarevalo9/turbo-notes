import pytest
from accounts.factories import UserFactory


@pytest.fixture
def superuser(db):
    return UserFactory(is_staff=True, is_superuser=True)


@pytest.fixture
def admin_client(client, superuser):
    client.force_login(superuser)
    return client


@pytest.mark.django_db
def test_admin_can_list_users(admin_client):
    response = admin_client.get('/admin/accounts/user/')
    assert response.status_code == 200


@pytest.mark.django_db
def test_admin_can_list_categories(admin_client):
    response = admin_client.get('/admin/notes/category/')
    assert response.status_code == 200


@pytest.mark.django_db
def test_admin_can_list_notes(admin_client):
    response = admin_client.get('/admin/notes/note/')
    assert response.status_code == 200
