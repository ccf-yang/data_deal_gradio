import inspect
from types import MethodType
from typing import Dict, Union

import pluggy

from ppioBaseCore.plugin.interface.PluginInterface import PluginInterface


class SpecificationsBuilder(object):

    def __init__(self, name='', interface: type(PluginInterface) = None):
        self.name = name
        self.interface = interface

        self.hook_list = []
        self.spec_list = {}

        self.spec = pluggy.HookspecMarker(self.name)  # 定义插件规范
        self.impl = pluggy.HookimplMarker(self.name)  # 插件实现
        self.pm = pluggy.PluginManager(self.name)  # 管理插件规范与插件本身

    def build(self, ):

        # parse spec method
        for _item in dir(self.interface):
            if not str(_item).startswith('_') and callable(getattr(self.interface, _item)):
                self.spec_list.setdefault(_item, self.spec(getattr(self.interface, _item)))

        # set spec name list
        self.hook_list = list(self.spec_list.keys())

        if not self.spec_list:
            raise ValueError('plugin {} must declare method to callback'.format(self.interface))

        _cls = type(self.name, (self.interface,), self.spec_list)
        self.pm.add_hookspecs(_cls)
        return self

    def addRegister(self, register: Union[PluginInterface, type]):

        if register and inspect.isclass(register):
            register = register()

        if not register or not isinstance(register, PluginInterface):
            raise ValueError('plugin must not null and implement PluginInterface')

        for method in dir(register):
            if str(method).startswith('_'):
                continue
            _attr = getattr(register, method)
            if not callable(_attr):
                continue

            if isinstance(_attr, MethodType):
                self.impl(_attr.__func__)
            else:
                setattr(register, method, self.impl(_attr))

        self.pm.register(plugin=register, name=None)

    def removeRegister(self, register: PluginInterface):
        self.pm.unregister(plugin=register, name=None)

    def run(self, method=None, *args, **kwargs):
        if method not in self.hook_list:
            raise ValueError('hook method [{}] invalid, it must in {}'.format(method, self.hook_list))

        return getattr(self.pm.hook, method)(*args, **kwargs)


class SpecificationsManager(object):
    build_list = {}  # type:Dict[str:SpecificationsBuilder]

    @classmethod
    def getBuilder(cls, tag: str = '', interface: type(PluginInterface) = None) -> SpecificationsBuilder:

        if tag in cls.build_list:
            _builder = cls.build_list.get(tag)
        else:
            _builder = SpecificationsBuilder(name=tag, interface=interface).build()
            cls.build_list.update({tag: _builder})
        return cls.build_list.get(tag, None)
