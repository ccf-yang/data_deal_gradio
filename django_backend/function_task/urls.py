from django.urls import path
from .views import (
    CreateFunctionTaskView,
    GetAllFunctionTasksView,
    GetSelectedFunctionTasksView,
    DeleteFunctionTasksView,
    UpdateFunctionTaskView
)

urlpatterns = [
    path('create', CreateFunctionTaskView.as_view(), name='create_function_task'),
    path('tasks', GetAllFunctionTasksView.as_view(), name='get_all_function_tasks'),
    path('getselected', GetSelectedFunctionTasksView.as_view(), name='get_selected_function_tasks'),
    path('delete', DeleteFunctionTasksView.as_view(), name='delete_function_tasks'),
    path('update', UpdateFunctionTaskView.as_view(), name='update_function_task'),
]
