
from ppioBaseCore.data.MarkData import MarkData
from ppioBaseCore.model.HttpSessionModel import HttpSessionModel
from ppioBaseCore.model.Option.HttpOption import HttpOption
from ppioBaseCore.wrapper.BaseWrapper import EndPointApiProxy
from ppioBaseCore.wrapper.interface.RequestProxyInterface import RequestProxyInterface


class RequestApiProxy(EndPointApiProxy, RequestProxyInterface):

    @property
    def url(self):
        return self.endpoint.get('url')

    @property
    def path(self):
        # self: <ppioBaseCore.wrapper.RequestDescWrapper.RequestApiProxy object at 0x10cead510>
        return str(self.url).rstrip('/') + '/' + str(self._url_path).lstrip('/')


class RequestDescWrapper(object):

    def __init__(self, path: str = '', mark: MarkData = '', params: dict = None,
                 method: str = ''):
        self.path = path
        self.mark = mark
        self.params = params
        self.request_proxy = RequestApiProxy(mark=self.mark, path=self.path)
        self.method = method

    def build(self):
        # default use session request
        _o = HttpOption().setMark(mark=self.mark).setOriginParams(params=self.params)
        _model = HttpSessionModel(http_option=_o)
        # print("Tianjinfan url: {}--{}".format(self.request_proxy.path, self.path))
        return getattr(_model, self.method)(self.request_proxy.path, **self.params)
