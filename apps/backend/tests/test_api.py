import pytest

CATEGORIES_URL = "/api/categories/"
NOTES_URL = "/api/notes/"


# ── Categories ────────────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_list_categories_authenticated(authenticated_client, user):
    from notes.factories import CategoryFactory

    CategoryFactory.create_batch(3, user=user)
    response = authenticated_client.get(CATEGORIES_URL)

    assert response.status_code == 200
    assert len(response.data) == 3


@pytest.mark.django_db
def test_list_categories_unauthenticated(api_client):
    response = api_client.get(CATEGORIES_URL)
    assert response.status_code == 401


@pytest.mark.django_db
def test_category_note_count_accurate(authenticated_client, user):
    from notes.factories import CategoryFactory, NoteFactory

    category = CategoryFactory(user=user)
    NoteFactory.create_batch(2, user=user, category=category)

    response = authenticated_client.get(CATEGORIES_URL)

    assert response.status_code == 200
    data = next(c for c in response.data if c["id"] == category.id)
    assert data["note_count"] == 2


@pytest.mark.django_db
def test_category_note_count_excludes_other_users_notes(authenticated_client, user):
    from notes.factories import CategoryFactory, NoteFactory
    from accounts.factories import UserFactory

    category = CategoryFactory(user=user)
    NoteFactory.create_batch(2, user=user, category=category)

    other_user = UserFactory()
    other_category = CategoryFactory(user=other_user)
    NoteFactory.create_batch(5, user=other_user, category=other_category)

    response = authenticated_client.get(CATEGORIES_URL)
    data = next(c for c in response.data if c["id"] == category.id)
    assert data["note_count"] == 2


# ── Notes ─────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_create_note_success(authenticated_client, user):
    from notes.factories import CategoryFactory

    category = CategoryFactory(user=user)
    response = authenticated_client.post(NOTES_URL, {"category_id": category.id})

    assert response.status_code == 201
    assert response.data["title"] == "Note Title"


@pytest.mark.django_db
def test_create_note_assigns_to_authenticated_user(authenticated_client, user):
    response = authenticated_client.post(NOTES_URL, {})

    assert response.status_code == 201
    assert response.data["id"] is not None

    from notes.models import Note

    note = Note.objects.get(pk=response.data["id"])
    assert note.user == user


@pytest.mark.django_db
def test_list_notes_only_own(authenticated_client, user):
    from notes.factories import NoteFactory
    from accounts.factories import UserFactory

    NoteFactory.create_batch(3, user=user)
    other_user = UserFactory()
    NoteFactory.create_batch(5, user=other_user)

    response = authenticated_client.get(NOTES_URL)

    assert response.status_code == 200
    assert len(response.data) == 3


@pytest.mark.django_db
def test_filter_notes_by_category(authenticated_client, user):
    from notes.factories import CategoryFactory, NoteFactory

    cat_a = CategoryFactory(user=user)
    cat_b = CategoryFactory(user=user)
    NoteFactory.create_batch(2, user=user, category=cat_a)
    NoteFactory.create_batch(3, user=user, category=cat_b)

    response = authenticated_client.get(NOTES_URL, {"category": cat_a.id})

    assert response.status_code == 200
    assert len(response.data) == 2
    assert all(n["category"]["id"] == cat_a.id for n in response.data)


@pytest.mark.django_db
def test_filter_by_other_users_category_returns_empty(authenticated_client, user):
    from notes.factories import CategoryFactory, NoteFactory
    from accounts.factories import UserFactory

    other_user = UserFactory()
    other_cat = CategoryFactory(user=other_user)
    NoteFactory.create_batch(3, user=other_user, category=other_cat)

    response = authenticated_client.get(NOTES_URL, {"category": other_cat.id})

    assert response.status_code == 200
    assert len(response.data) == 0


@pytest.mark.django_db
def test_partial_update_note(authenticated_client, user):
    from notes.factories import NoteFactory

    note = NoteFactory(user=user, title="Old Title")
    old_updated_at = note.updated_at

    response = authenticated_client.patch(
        f"{NOTES_URL}{note.id}/", {"title": "New Title"}
    )

    assert response.status_code == 200
    assert response.data["title"] == "New Title"
    note.refresh_from_db()
    assert note.updated_at >= old_updated_at


@pytest.mark.django_db
def test_partial_update_other_users_note(authenticated_client, user):
    from notes.factories import NoteFactory
    from accounts.factories import UserFactory

    other_user = UserFactory()
    note = NoteFactory(user=other_user)

    response = authenticated_client.patch(f"{NOTES_URL}{note.id}/", {"title": "Hacked"})

    assert response.status_code == 404


@pytest.mark.django_db
def test_delete_note(authenticated_client, user):
    from notes.factories import NoteFactory

    note = NoteFactory(user=user)
    response = authenticated_client.delete(f"{NOTES_URL}{note.id}/")

    assert response.status_code == 204


@pytest.mark.django_db
def test_delete_other_users_note(authenticated_client, user):
    from notes.factories import NoteFactory
    from accounts.factories import UserFactory

    other_user = UserFactory()
    note = NoteFactory(user=other_user)

    response = authenticated_client.delete(f"{NOTES_URL}{note.id}/")

    assert response.status_code == 404


@pytest.mark.django_db
def test_retrieve_note_with_nested_category(authenticated_client, user):
    from notes.factories import CategoryFactory, NoteFactory

    category = CategoryFactory(user=user)
    note = NoteFactory(user=user, category=category)

    response = authenticated_client.get(f"{NOTES_URL}{note.id}/")

    assert response.status_code == 200
    assert response.data["category"]["id"] == category.id
    assert response.data["category"]["name"] == category.name
    assert response.data["category"]["color"] == category.color


@pytest.mark.django_db
def test_retrieve_note_with_null_category(authenticated_client, user):
    from notes.factories import NoteFactory

    note = NoteFactory(user=user, category=None)

    response = authenticated_client.get(f"{NOTES_URL}{note.id}/")

    assert response.status_code == 200
    assert response.data["category"] is None
