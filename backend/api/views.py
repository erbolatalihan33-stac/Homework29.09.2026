from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class MeView(APIView):
    """Example protected endpoint; JWTAuthentication is configured globally."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.pk,
            "username": request.user.get_username(),
            "email": request.user.email,
            "message": "Токен проверен. Доступ к защищённым данным разрешён.",
        })


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "title": "Защищённая панель",
            "items": [
                {"label": "Статус авторизации", "value": "Подтверждена"},
                {"label": "Способ проверки", "value": "JWT Bearer"},
                {"label": "Пользователь", "value": request.user.get_username()},
            ],
        })
