from django.urls import path
from .views import (
    CreateFunctionCaseView,
    GetAllFunctionCasesView,
    GetSelectedFunctionCasesView,
    DeleteFunctionCasesView,
    UpdateFunctionCaseView
)

urlpatterns = [
    path('create', CreateFunctionCaseView.as_view(), name='create_function_case'),
    path('cases', GetAllFunctionCasesView.as_view(), name='get_all_function_cases'),
    path('getone', GetSelectedFunctionCasesView.as_view(), name='get_selected_function_cases'),
    path('delete', DeleteFunctionCasesView.as_view(), name='delete_function_cases'),
    path('update', UpdateFunctionCaseView.as_view(), name='update_function_case'),
]
