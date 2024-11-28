import json
from django.http import HttpResponse
from django.db.models.query import QuerySet
from datetime import datetime, date as datetime_date
from decimal import Decimal
# 日期json序列化
class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(o, datetime_date):
            return o.strftime('%Y-%m-%d')
        elif isinstance(o, Decimal):
            return float(o)

        return json.JSONEncoder.default(self, o)

def json_response(data='', error=''):
    '''
    @attention: 如果data是QuerySet，model中一定需要用to_dict方法
    '''
    content = AttrDict(data=data, error=error)
    if error:
        content.data = ''
    elif hasattr(data, 'to_dict'):
        content.data = data.to_dict()
    elif isinstance(data, (list, QuerySet)) and all([hasattr(item, 'to_dict') for item in data]):
        content.data = [item.to_dict() for item in data]
    return HttpResponse(json.dumps(content, cls=DateTimeEncoder), content_type='application/json')


# 继承自dict，实现可以通过.来操作元素
class AttrDict(dict):
    def __setattr__(self, key, value):
        self.__setitem__(key, value)

    def __getattr__(self, item):
        try:
            return self.__getitem__(item)
        except KeyError:
            raise AttributeError(item)

    def __delattr__(self, item):
        self.__delitem__(item)


