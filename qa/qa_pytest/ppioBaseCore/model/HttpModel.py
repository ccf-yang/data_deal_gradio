import logging
from functools import update_wrapper

import requests

from ppioBaseCore.model.Option.HttpOption import HttpOption
from ppioBaseCore.model.data.RequestObject import RequestObject
from ppioBaseCore.model.data.ResponseObject import NiceRequest
from ppioBaseCore.model.handler.ResponseHandler import ResponseHandler
from ppioBaseCore.model.interface.HttpRequestInterface import HttpRequestInterface

logger = logging.getLogger(__name__)


def request_hook(f):
    def do_request(*args, **kwargs):
        _instance = args[0]   # <ppioBaseCore.model.HttpSessionModel.HttpSessionModel object>

        if not isinstance(_instance, HttpRequestInterface):
            _option = HttpOption()
        else:
            _option = getattr(_instance, 'option')
            args = args[1:]

        _request_object = RequestObject(_option, f.__name__, *args, **kwargs)

        from ppioBaseCore.plugin.PluginManager import PluginManager
        PluginManager.run('request', request=_request_object)

        return NiceRequest(request_object=_request_object).build()

    return update_wrapper(do_request, f)


class HttpModel(HttpRequestInterface):
    @property
    def option(self):
        return self._option.setRequestObject(obj=requests)

    @request_hook
    def get(self, url, params=None, **kwargs) -> ResponseHandler:
        pass

    @request_hook
    def post(self, url, data=None, json=None, **kwargs) -> ResponseHandler:
        pass

    @request_hook
    def options(self, url, **kwargs) -> ResponseHandler:
        pass

    @request_hook
    def put(self, url, data=None, **kwargs) -> ResponseHandler:
        pass

    @request_hook
    def patch(self, url, data=None, **kwargs) -> ResponseHandler:
        pass

    @request_hook
    def head(self, url, **kwargs) -> ResponseHandler:
        pass

    @request_hook
    def delete(self, url, **kwargs) -> ResponseHandler:
        pass

