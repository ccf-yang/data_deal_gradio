
from ppioBaseCore.data.MarkData import MarkData
from ppioBaseCore.plugin import PluginManager


class EndPointApiProxy(object):

    def __init__(self, mark: MarkData = '', path=''):
        self._mark = mark
        self._url_path = path

    def getPathFromEndPoint(self):
        _config = self.getEndPointConfig()
        return

    def getEndPointConfig(self) -> dict:
        """
        get end point file by env config
        :return:
        """

        # get endpoints
        from ppioBaseCore.util.VariableExecution import VariableExecution
        _endpoint = VariableExecution().get_endpoints()

        # get endpoints from plugins
        if not _endpoint:
            _ep = PluginManager.run('endpoints', mark=self.mark)
            if isinstance(_ep, list) and _ep:
                for _e_ep in _ep:
                    if _e_ep and isinstance(_e_ep, dict):
                        _endpoint = _e_ep
                        break

        if not _endpoint:
            raise ValueError('can not get endpoint config in variables file')
        return _endpoint

    @property
    def mark(self):
        return self._mark

    @property
    def endpoint(self) -> dict:
        _endpoint = self.getEndPointConfig().get(self.mark.module, None)
        if not _endpoint:
            raise ValueError('can not get url item in config info [{}] by mark [{}]'.format(
                    self.getEndPointConfig(), self.mark.module
                ))
        return _endpoint


