from __future__ import annotations

from django.conf import settings
from django.db import models

from accounts.models import User
from datetime import datetime


class Category(models.Model):
    name: models.CharField[str, str] = models.CharField(max_length=100)
    color: models.CharField[str, str] = models.CharField(max_length=7)
    user: models.ForeignKey[User, User] = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories",
    )

    class Meta:
        unique_together = ("user", "name")
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Note(models.Model):
    title: models.CharField[str, str] = models.CharField(
        max_length=255, default="Note  Title"
    )
    content: models.TextField[str, str] = models.TextField(blank=True, default="")
    category: models.ForeignKey[Category | None, Category | None] = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notes",
    )
    user: models.ForeignKey[User, User] = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notes",
    )
    created_at: models.DateTimeField[datetime, datetime] = models.DateTimeField(
        auto_now_add=True
    )
    updated_at: models.DateTimeField[datetime, datetime] = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return self.title
