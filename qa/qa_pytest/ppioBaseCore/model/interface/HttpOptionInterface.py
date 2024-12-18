from abc import ABCMeta
from copy import copy
from ppioBaseCore.model.Option.ApiOption import ApiOption


class HttpOptionInterface(ApiOption, metaclass=ABCMeta):

    def __init__(self, host=None, headers: dict = None, handler=None):
        # request header
        self._header = headers or {}

        # request host
        self._host = host

        # request params
        self._params = None

        # response handler
        self._handler = handler

        self._auth = None
        # 先找到 HttpOptionInterface 的父类 ApiOption，然后把类 HttpOptionInterface 的对象转换为 ApiOption 的对象
        super(HttpOptionInterface, self).__init__()

    @property
    def header(self) -> dict:
        return self._header

    @property
    def host(self) -> str:
        return self._host

    @host.setter
    def host(self, host):
        self._host = host

    @property
    def response_handler(self):
        return self._handler

    @property
    def auth(self):
        return self._auth

    @property
    def params(self):
        return self._params

    def setHeader(self, header: dict) -> 'HttpOptionInterface':
        self._header.update(header)
        return self

    def setHost(self, host: str) -> 'HttpOptionInterface':
        self._host = host
        return self

    def setResponseHandler(self, handler=None) -> 'HttpOptionInterface':
        self._handler = handler
        return self

    def setAuth(self, auth=None):
        self._auth = auth
        return self

    def setOriginParams(self, params=None):
        _p = copy(params)
        try:
            if isinstance(params, dict):
                self._params = [{_item: _p.get(_item)} for _item in
                                ['params', 'data', 'json', 'files'] if
                                _item in _p]
            else:
                self._params = _p
        except Exception as e:
            self._params = str(e)
        return self
