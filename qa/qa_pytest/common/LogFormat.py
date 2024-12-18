#!/usr/bin/env python
# -*- coding: UTF-8 -*-
"""
@Time: 2022/11/14 3:45 PM
@File:  LogFormat.py
@Author:  keli
@Contact:  keli@pplabs.org
@License: Mulan PSL
@Desc: 
"""
import datetime


class LogFormat(object):
    def __init__(self):
        pass

    def log_format(self, resp, method, url, headers={}, params={}, body={}, desc=""):
        """
        格式化http请求log
        """
        _msg = "\n[{}]".format(datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        if desc != "":
            _msg += "  [{}]\n".format(desc)
        _msg += "[{}]\t\t===>\t\t[{}][{}]\n".format(resp.status_code, method, url)
        _msg += "headers\t\t===>\t\t{}\n".format(headers)
        if params != {}:
            _msg += "params\t===>\t\t{}\n".format(params)
        if body != {}:
            _msg += "body\t===>\t\t{}\n".format(body)
        # if isinstance(resp.content, bytes):
        #     _msg += "response\t===>\t\t{}\n".format("返回二进制，不打印")
        # else:
        _msg += "response\t===>\t\t{}\n".format(resp.content) if len(
            resp.content) < 1024 else "response\t===>\t\t{}\n".format(resp.text[0:1024])

        print(_msg)