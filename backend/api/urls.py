from django.urls import path
from .views import DashboardView, MeView

urlpatterns = [
    path("auth/me/", MeView.as_view(), name="auth_me"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
]
