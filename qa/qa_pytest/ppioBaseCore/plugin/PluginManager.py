from ppioBaseCore.plugin.InnerPlugin import InnerPlugin
from ppioBaseCore.plugin.SpecificationsBuilder import SpecificationsManager
from ppioBaseCore.plugin.interface.EndPointsInterface import EndPointsInterface
from ppioBaseCore.plugin.interface.HttpRegisterInterface import HttpPluginInterface
from ppioBaseCore.plugin.interface.PluginInterface import PluginInterface


class PluginManager(object):

    @classmethod
    def getBuilder(cls):
        return SpecificationsManager.getBuilder(tag='default_plugin', interface=PluginInterface)

    @classmethod
    def register(cls, plugin: PluginInterface = None):
        cls.getBuilder().addRegister(plugin)

    @classmethod
    def init(cls):
        cls.register(InnerPlugin())

    @classmethod
    def http(cls, reg: HttpPluginInterface = None):
        cls.register(reg)

    @classmethod
    def endpoints(cls, reg: EndPointsInterface = None):
        cls.register(reg)

    @classmethod
    def run(cls, method=None, *args, **kwargs):
        return cls.getBuilder().run(method=method, *args, **kwargs)


