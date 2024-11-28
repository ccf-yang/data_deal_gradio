from django.urls import path
from apps.home.navigation import NavView

urlpatterns = [
    path('navigation/', NavView.as_view()),
]
