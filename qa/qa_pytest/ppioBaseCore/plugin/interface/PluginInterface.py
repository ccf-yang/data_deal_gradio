from abc import ABCMeta
from ppioBaseCore.data.MarkData import MarkData
from ppioBaseCore.model.data.RequestObject import RequestObject
from ppioBaseCore.model.data.ResponseObject import ResponseObject


class PluginInterface(metaclass=ABCMeta):

    def endpoints(self, mark: MarkData) -> dict:
        """

        :param mark:
        :return:
        """
        pass

    def request(self, request: RequestObject):
        """

        :param request:
        :return:
        """
        pass

    def response(self, response: ResponseObject):
        """

        :param response:
        :return:
        """
        pass

