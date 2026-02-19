from __future__ import annotations

from typing import Any

from rest_framework import serializers

from notes.models import Category, Note


class CategoryMinimalSerializer(serializers.ModelSerializer[Category]):
    class Meta:
        model = Category
        fields = ("id", "name", "color")


class CategorySerializer(serializers.ModelSerializer[Category]):
    note_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "color", "note_count")


class NoteSerializer(serializers.ModelSerializer[Note]):
    category = CategoryMinimalSerializer(read_only=True, allow_null=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.none(),
        write_only=True,
        required=False,
        allow_null=True,
        source="category",
    )

    class Meta:
        model = Note
        fields = (
            "id",
            "title",
            "content",
            "category",
            "category_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            category_id_field = self.fields["category_id"]
            cast_field: Any = category_id_field
            cast_field.queryset = Category.objects.filter(user=request.user)
