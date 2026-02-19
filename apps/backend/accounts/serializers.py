from __future__ import annotations

from typing import Any

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User


class TokenResponseSerializer(serializers.Serializer[Any]):
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)


class UserSerializer(serializers.Serializer[Any]):
    email = serializers.EmailField(read_only=True)


class RegisterSerializer(serializers.Serializer[Any]):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data: dict[str, Any]) -> Any:
        from notes.services import create_default_categories

        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
        )
        create_default_categories(user)
        return user

    def to_representation(self, instance: Any) -> dict[str, str]:
        refresh = RefreshToken.for_user(instance)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
