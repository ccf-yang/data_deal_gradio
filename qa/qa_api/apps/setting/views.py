import django
from django.views.generic import View
from utils import json_response
from .models import Setting
import platform


class SettingView(View):
    def get(self, request):
        response = {}
        for item in Setting.objects.all():
            response[item.key] = item.real_val
        return json_response(response)


def get_about(request):
    return json_response({
        'python_version': platform.python_version(),
        'system_version': platform.platform(),
        'django_version': django.get_version()
    })
