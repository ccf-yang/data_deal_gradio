import logging
import time
from abc import ABCMeta, abstractmethod
from copy import deepcopy
from typing import Optional, Union
from requests import Response
from ppioBaseCore.data.MarkData import MarkData
from ppioBaseCore.logger import Log
from ppioBaseCore.model.data.RequestObject import BaseObject, RequestObject
from ppioBaseCore.model.handler.ResponseHandler import ResponseHandler
from common.ReadConfigData import ReadConfigData

R = Union[Response, bytes]

lib_logger = logging.getLogger('ppioBaseCore')


class Request(metaclass=ABCMeta):
    def __init__(self, request_object: BaseObject = None):
        self._request_object = request_object
        self._response = None  # type:Optional[Response, bytes]
        self.total_time = 0
        self.handleResponse()

    @property
    def request_object(self):
        return self._request_object

    @property
    def response(self) -> Response:
        return self._response

    @response.setter
    def response(self, response):
        self._response = response

    @abstractmethod
    def build(self): pass

    def doLog(self):
        
        if ReadConfigData().get_cfg_has_log == "yes":
            if self.request_object.option.log:
                self.log()

    @abstractmethod
    def log(self):
        """
        print console log info
        :return:
        """
        pass

    def handleResponse(self):
        _request_handle = getattr(self.request_object.option.obj,
                                  self.request_object.method)
        _start_time = time.perf_counter()
        self.response = _request_handle(*self.request_object.args,
                                        **self.request_object.kwargs)
        self.total_time = time.perf_counter() - _start_time
        # self.setStep()

        # make sure need to print request log
        self.doLog()


class NiceRequest(Request):
    file_type = ('application/zip', 'application/gzip',
                 'application/octet-stream')


    def log(self):

        _m = 'red' if self.response.status_code < 200 or \
                      self.response.status_code > 400 else 'normal'
        _msg = "\n[{}]\t\t===>\t\t[{}][{}]\n".format(self.response.status_code,
                                                     self.response.request.method,
                                                     self.request_object.url)

        _log_params = {**self.request_object.kwargs,
                       **{'headers': deepcopy(self.response.request.headers)}}
        for k, v in _log_params.items():
            _msg += "{}\t\t===>\t\t{}\n".format(k, v)
        lib_logger.info(self.response.headers.get('content-type'))
        _c_t = str(self.response.headers.get('content-type')).lower()

        if any(each in _c_t for each in self.file_type) \
                or '\x00' in self.response.text:
            _text = ""
        else:
            _text = self.response.text
        _msg += "response\t===>\t\t{}\n".format(_text)
        getattr(Log, _m)(msg=_msg)

    def handle(self):

        logging.info("Request url is: {}".format(self.request_object.url))

        _response = ResponseObject(
            response=self.response,
            mark=self.request_object.mark,
            request=self.request_object,
            total_time=self.total_time)

        from ppioBaseCore.plugin.PluginManager import PluginManager
        PluginManager.run('response', response=_response)

        return _response.content

    def build(self):
        return ResponseHandler() \
            .inject(response=self.response, content=self.handle())


class ResponseObject(object):

    def __init__(self, response: R = None, mark: MarkData = None, content=None,
                 request: RequestObject = None, total_time=0):
        self._mark = mark
        self._response = response
        self._content = content or response.content
        self._request = request
        self._total_time = total_time

    @property
    def total_time(self):
        return self._total_time

    @property
    def mark(self):
        return self._mark

    @property
    def response(self) -> R:
        return self._response

    @property
    def content(self):
        return self._content or self.response.content

    @property
    def request(self):
        return self._request

    @content.setter
    def content(self, content):
        self._content = content


