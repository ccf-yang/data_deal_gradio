from django.urls import path
from .views import login, logout, UserView
from .historyview import HistoryView

urlpatterns = [
    path('login/', login),
    path('logout/', logout),
    path('user/', UserView.as_view()),
    path('login/history/', HistoryView.as_view())
]
