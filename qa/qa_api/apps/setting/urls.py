from django.urls import path
from .views import SettingView
from .views import get_about

urlpatterns = [
    path('', SettingView.as_view(), name='settings'),
    path('about/', get_about, name='about'),  # 直接用函数的方式
]
