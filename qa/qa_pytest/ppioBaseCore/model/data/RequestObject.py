from ppioBaseCore.session import SessionManager
from abc import ABCMeta, abstractmethod

from requests.structures import CaseInsensitiveDict

from ppioBaseCore.model.interface.HttpOptionInterface import HttpOptionInterface


class BaseObject(metaclass=ABCMeta):
    def __init__(self, option, method, *args, **kwargs):
        self._args = args
        self._kwargs = kwargs
        self._method = method
        self._headers = {}
        self._option = option  # type:HttpOptionInterface
        self._init()

    @abstractmethod
    def _init(self): pass

    @property
    def mark(self):
        return self.option.mark

    @property
    def option(self):
        return self._option

    @property
    def args(self):
        return self._args

    @args.setter
    def args(self, args):
        self._args = args

    @property
    def kwargs(self):
        """
        e.g. requests info include data and headers
        {data:{"user_name":"","password":""},
        headers:{"content-type":"application/json"}}
        :return:
        """
        return self._kwargs

    @kwargs.setter
    def kwargs(self, kwargs):
        self._kwargs = kwargs

    @property
    def method(self):
        return self._method


class RequestObject(BaseObject):

    def _init(self):
        self.handleAuth()
        self.handleHeaders()
        self.handleUrl()
        self.handleTimeout()

    @property
    def url(self):
        return self.args[0] if self.args else self.option.host

    @url.setter
    def url(self, url):
        _l = list(self.args)
        _l[0] = url
        self._args = tuple(_l)

    @property
    def headers(self):
        return self._headers or self.kwargs.get('headers', {})

    @headers.setter
    def headers(self, headers: dict = None):
        self._headers.update(headers)
        self._kwargs.update(
            {'headers': {**headers, **self._kwargs.get('headers', {})}})

    def handleAuth(self):

        # merge option auth
        if self._option.auth and 'auth' not in self.kwargs:
            self.kwargs.update({'auth': self._option.auth})

    def handleHeaders(self):
        _h_n = CaseInsensitiveDict()
        _r_h = self.kwargs.get('headers', {})

        _h_n.update(self.option.header)
        if isinstance(_r_h, dict):
            _h_n.update(_r_h)

        # file request don't need content-type
        if 'files' in self.kwargs and self.kwargs.get('files'):
            pass
        elif 'Content-Type' not in _h_n:
            _h_n.update({"Content-type": "application/json"})
            _h_n.update(SessionManager.getHeaders())

        self._headers = _h_n
        self.kwargs.update({"headers": _h_n})

    def handleUrl(self):
        if not self._option.host:
            return
        _r_u = str(self.args[0]).strip('/') if self.args else ''
        if '.' not in _r_u and '.' in self._option.host:
            self.url = '/'.join((self._option.host, _r_u))

    def handleTimeout(self):
        if self._option.timeout and 'timeout' not in self.kwargs:
            self.kwargs.update({'timeout': self._option.timeout})
