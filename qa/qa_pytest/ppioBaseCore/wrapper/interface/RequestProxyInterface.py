from abc import ABCMeta, abstractmethod


class RequestProxyInterface(metaclass=ABCMeta):

    @property
    @abstractmethod
    def path(self): pass
