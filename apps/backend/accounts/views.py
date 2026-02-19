from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import (
    RegisterSerializer,
    TokenResponseSerializer,
    UserSerializer,
)


@extend_schema(
    request=RegisterSerializer,
    responses={201: TokenResponseSerializer},
)
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            serializer.to_representation(user), status=status.HTTP_201_CREATED
        )


@extend_schema(responses={200: UserSerializer})
class MeView(APIView):
    """Returns the authenticated user's email."""

    def get(self, request):
        return Response({"email": request.user.email})
