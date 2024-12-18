from ppioBaseCore.model.data.RequestObject import RequestObject
from ppioBaseCore.plugin.interface.PluginInterface import PluginInterface


class InnerPlugin(PluginInterface):
    upload_api_info = None
    url_params = 'url_params'

    def request(self, request: RequestObject):
        _url_params = request.kwargs.pop(self.url_params, {})
        if _url_params and isinstance(_url_params, dict):
            request.url = request.url.format(**_url_params)

