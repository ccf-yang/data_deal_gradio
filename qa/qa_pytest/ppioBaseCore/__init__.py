import logging
import os
import sys

from ppioBaseCore.model.interface.HttpResponseInterface import HttpResponseInterface

null_handler = logging.NullHandler()
logging.root.setLevel(logging.INFO)
logging.root.addHandler(null_handler)

# 获取logger对象
logger = logging.getLogger(__name__)
logger.propagate = False

# 全局formatter
formatter = logging.Formatter('[%(asctime)s][%(process)s][%(levelname)s][%(name)s] : %(message)s')

console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

# 注册handler, 将运行日志输出到控制台
logger.addHandler(console_handler)

logger = logging.getLogger(__name__)

from ppioBaseCore.provider import Http, Mark
from ppioBaseCore.plugin import PluginManager

PluginManager.init()


class Api(object):
    http = Http()
    mark = Mark
    # data object
    response = None  # type:HttpResponseInterface


api = Api()


def init():
    sys.path.append(
        os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir)))


__all__ = ['api', 'init', 'logger']
