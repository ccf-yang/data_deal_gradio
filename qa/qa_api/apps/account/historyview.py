from django.views.generic import View
from .models import History
from utils import json_response


class HistoryView(View):
    def get(self, request):
        histories = History.objects.all()
        # 如果想要把所有的queryset数据返回, 在model里面一定要实现to_dict，才能用json_response将结构化数据返回
        return json_response(histories)
