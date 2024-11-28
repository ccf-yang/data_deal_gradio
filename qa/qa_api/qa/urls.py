# 导入django的路径和包含函数
from django.urls import path, include

# 定义url模式
urlpatterns = [
    # 账户相关的url
    path('account/', include('apps.account.urls')),
    # 设置相关的url
    path('setting/', include('apps.setting.urls')),
    # 主页相关的url
    path('home/', include('apps.home.urls')),
    
    path('savedapi/', include('apps.savedapi.urls')),
    path('autoapi/', include('apps.autoapi.urls')),
    path('environment/', include('apps.environment.urls')),
    path('function_cases/', include('apps.function_cases.urls')),
    path('function_task/', include('apps.function_task.urls')),
]
