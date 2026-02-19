from __future__ import annotations

from typing import TYPE_CHECKING

from notes.models import Category

if TYPE_CHECKING:
    from django.contrib.auth.models import AbstractBaseUser

DEFAULT_CATEGORIES = [
    {'name': 'Random Thoughts', 'color': '#EF9C66'},
    {'name': 'School', 'color': '#FCDC94'},
    {'name': 'Personal', 'color': '#78ABA8'},
]


def create_default_categories(user: AbstractBaseUser) -> None:
    Category.objects.bulk_create(
        [Category(user=user, **cat) for cat in DEFAULT_CATEGORIES]  # type: ignore[misc]
    )
