
from ppioBaseCore.data.MarkData import MarkData
from ppioBaseCore.provider.BaseProvider import BaseProvider
from ppioBaseCore.wrapper.RequestDescWrapper import RequestDescWrapper


class HttpDesc(BaseProvider):

    def handle(self, path: str = '', mark: MarkData = '', method: str = '',
               params: dict = None, ori_params: dict = None):
        return RequestDescWrapper(path=path, mark=mark, method=method,
                                  params=params or ori_params).build()


class Http(object):
    get = ''  # type:HttpDesc
    post = ''  # type:HttpDesc
    put = ''  # type:HttpDesc
    delete = ''  # type:HttpDesc
    options = ''  # type:HttpDesc
    patch = ''  # type:HttpDesc
    head = ''  # type:HttpDesc

    def __getattribute__(self, item):
        return HttpDesc(method=item)

