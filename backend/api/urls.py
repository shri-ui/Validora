from django.urls import path

from api import views

urlpatterns = [
    path("health", views.health),
    path("auth/signup", views.signup),
    path("auth/login", views.login),
    path("auth/me", views.me),
    path("validate", views.validate_startup),
    path("history", views.validation_history),
    path("history/<int:validation_id>", views.delete_validation_history),
    path("report", views.report),
    path("users/me/", views.me),
    path("users/me/password/", views.change_password),
]
