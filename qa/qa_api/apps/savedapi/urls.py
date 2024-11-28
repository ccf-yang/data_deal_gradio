from django.urls import path
from django.contrib import admin
from .views import SaveAPIView, RemoveAPIView, GetAllAPIsView, GetDirectoriesView, ConvertSwaggerView

app_name = 'savedapi'

urlpatterns = [
    path('save/', SaveAPIView.as_view(), name='save-api'),
    path('remove/', RemoveAPIView.as_view(), name='remove-api'),
    path('saved-apis/', GetAllAPIsView.as_view(), name='get-all-apis'),
    path('directories/', GetDirectoriesView.as_view(), name='get-directories'),
    path('convert/', ConvertSwaggerView.as_view(), name='convert-swagger'),
]
