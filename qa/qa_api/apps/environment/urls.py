from django.urls import path
from . import views

urlpatterns = [
    path('create', views.CreateEnvironmentView.as_view(), name='create_environment'),
    path('environments', views.GetEnvironmentsView.as_view(), name='get_environments'),
    path('delete', views.DeleteEnvironmentView.as_view(), name='delete_environment'),
    path('update', views.UpdateEnvironmentView.as_view(), name='update_environment'),
]
