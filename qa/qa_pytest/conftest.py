#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from ppioBaseCore.plugin.PluginManager import PluginManager
from ppioBaseCore.plugin.interface.HttpRegisterInterface import HttpPluginInterface
from ppioBaseCore.model.data.RequestObject import RequestObject
from ppioBaseCore.model.data.ResponseObject import ResponseObject
import time
from common.FileAction import FileAction
from ppioBaseCore.data.MarkData import MarkData
from ppioBaseCore.plugin.interface.EndPointsInterface import EndPointsInterface
from common.ReadConfigData import ReadConfigData
from common.ReadApiParams import get_api_params_by_key

conf_env = ReadConfigData().get_cfg_run_env
count_result_path = FileAction().com_get_file_all_path(r'run_case.txt')


class HttpPlugin(HttpPluginInterface):
    def request(self, request: RequestObject):
        if 'other_params' in request.kwargs:
            _other_params = request.kwargs.pop('other_params')
            request.url = request.url.format(**_other_params)

    def response(self, response: ResponseObject):
        pass
PluginManager.http(reg=HttpPlugin())

env = os.getenv("environment", conf_env)
class EndPointPlugin(EndPointsInterface):
    def endpoints(self, mark: MarkData) -> dict:
        return {"domain_in_env": {"url": get_api_params_by_key("host")}}
PluginManager.endpoints(reg=EndPointPlugin())




def pytest_terminal_summary(terminalreporter, exitstatus, config):
    """
    收集测试结果
    :param terminalreporter:
    :param exitstatus:
    :param config:
    :return:
    """
    total = terminalreporter._numcollected
    passed = len([i for i in terminalreporter.stats.get('passed', []) if i.when != 'teardown'])
    failed = len([i for i in terminalreporter.stats.get('failed', []) if i.when != 'teardown'])
    error = len([i for i in terminalreporter.stats.get('error', []) if i.when != 'teardown'])
    skipped = len([i for i in terminalreporter.stats.get('skipped', []) if i.when != 'teardown'])
    if passed+failed+skipped > 0:
        successful = passed/(passed+failed+skipped)*100
    else:
        successful = 0.00 * 100
    duration = time.time() - terminalreporter._sessionstarttime
    print('total times: %.2f' % duration, 'seconds')

    with open(count_result_path, "w",encoding='utf-8') as fp:
        # fp.write("用例总数: %s" % total+"\n")
        fp.write("运行用例总数: %s" % (passed+failed+skipped)+"\n")
        fp.write("通过: %s" % passed+"\n")
        fp.write("失败: %s" % failed+"\n")
        fp.write("错误: %s" % error+"\n")
        fp.write("跳过: %s" % skipped+"\n")
        fp.write("通过率: %.2f%%" % successful+"\n")
        fp.write("运行时间: %.2fs" % duration)


def pytest_collection_modifyitems(items):
    for item in items:
        item.name = item.name.encode("utf-8").decode("unicode_escape")
        print(item.nodeid)
        item._nodeid = item.nodeid.encode("utf-8").decode("unicode_escape")



