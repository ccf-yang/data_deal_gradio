from abc import ABCMeta, abstractmethod
from ppioBaseCore.model.Option.HttpOption import HttpOption


class HttpRequestInterface(metaclass=ABCMeta):

    # self: <ppioBaseCore.model.HttpSessionModel.HttpSessionModel object at 0x10b9dc710>
    def __init__(self, http_option: HttpOption = HttpOption()):
        self._option = http_option

    @property
    def option(self):
        return self._option

    @option.setter
    def option(self, option=None):
        self._option = option

    @abstractmethod
    def get(self, url, params=None, **kwargs): pass

    @abstractmethod
    def post(self, url, data=None, json=None, **kwargs): pass

    @abstractmethod
    def options(self, url, **kwargs): pass

    @abstractmethod
    def put(self, url, data=None, **kwargs): pass

    @abstractmethod
    def patch(self, url, data=None, **kwargs): pass

    @abstractmethod
    def head(self, url, **kwargs): pass

    @abstractmethod
    def delete(self, url, **kwargs): pass
