from __future__ import annotations

from typing import Any

from django.db.models import Count, QuerySet
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import mixins, viewsets

from notes.models import Category, Note
from notes.serializers import CategorySerializer, NoteSerializer


class CategoryViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet[Category],
):
    serializer_class = CategorySerializer

    def get_queryset(self) -> QuerySet[Category]:
        assert self.request.user.is_authenticated
        return Category.objects.filter(user=self.request.user).annotate(
            note_count=Count("notes")
        )


@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                name='category',
                type=int,
                location=OpenApiParameter.QUERY,
                description='Filter notes by category ID',
                required=False,
            )
        ]
    )
)
class NoteViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet[Note],
):
    serializer_class = NoteSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self) -> QuerySet[Note]:
        assert self.request.user.is_authenticated
        qs = Note.objects.filter(user=self.request.user).select_related("category")
        category_id = self.request.query_params.get("category")
        if category_id is not None:
            qs = qs.filter(category_id=category_id)
        return qs

    def perform_create(self, serializer: Any) -> None:
        instance = serializer.save(user=self.request.user)
        if instance.category_id is None:
            default = Category.objects.filter(
                user=self.request.user, name='Random Thoughts'
            ).first()
            if default:
                instance.category = default
                instance.save(update_fields=['category'])
