from django.urls import path
from . import views

urlpatterns = [
    # Api Code Views
    path('addapicodewithoutgroup', views.AddApiCodeWithoutGroupView.as_view(), name='add_apicode_without_group'),
    path('addapicodewithgroup', views.AddApiCodeWithGroupView.as_view(), name='add_api_code_with_group'),
    path('getapicode', views.GetApiCodeView.as_view(), name='get_apicode'),
    path('updateapicode', views.UpdateApiCodeView.as_view(), name='update_apicode'),
    path('deleteapicode', views.DeleteApiCodeView.as_view(), name='delete_apicode'),
    
    # Group Api Code Views
    path('groupall', views.GetAllGroupsApiCodeView.as_view(), name='get_all_groups_apicode'),
    path('group', views.GetGroupApiCodeView.as_view(), name='get_group_apicode'),
    path('deletegroupapi', views.DeleteGroupApiCodeView.as_view(), name='delete_group_apicode'),
    
    # Group Views
    path('groups', views.GetGroupsView.as_view(), name='get_groups'),
    path('deletegroup', views.DeleteGroupView.as_view(), name='delete_group'),
    path('addgroup', views.AddGroupView.as_view(), name='add_group'),
    path('updategroup', views.UpdateGroupView.as_view(), name='update_group'),  # use for url update
    
    # Auto Test Status Views
    path('autoteststatus', views.GetAllAutoTestStatusView.as_view(), name='get_all_auto_test_status'),
]
