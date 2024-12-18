from abc import ABCMeta, abstractmethod
from collections import namedtuple

from requests import Response


class HttpResponseInterface(metaclass=ABCMeta):

    @property
    @abstractmethod
    def code(self): pass

    @property
    @abstractmethod
    def data(self): pass

    @abstractmethod
    def inject(self, response: Response, content: str = ''):
        pass

    @property
    @abstractmethod
    def origin(self): pass

    @property
    @abstractmethod
    def response(self) -> Response: pass

    @property
    @abstractmethod
    def target(self): pass

    @property
    @abstractmethod
    def origin_fetched(self): pass

    @property
    @abstractmethod
    def error_code(self): pass

    @abstractmethod
    def filter(self, **kwargs): pass

    @abstractmethod
    def fetchAll(self): pass

    @abstractmethod
    def fetchOne(self) -> namedtuple or list: pass

    @abstractmethod
    def fetchLast(self): pass

    @abstractmethod
    def fetch(self, index=0): pass
