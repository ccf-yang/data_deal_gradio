#!/usr/bin/env python
# -*- coding: UTF-8 -*-
"""
@Time: 2021/9/13 10:24 上午
@File:  EnvManager.py
@Author:  zhangzhen_zhuqing
@Contact:  zhuqing@pplabs.org
@License: Mulan PSL
"""
from variables.test_env_conf import CONFIG


class EnvManage(object):

    def get_value_from_env_dict(self, data_dict, env_map_dict=None, use_default_mapping=False):
        """

        :param data_dict:
        :param env_map_dict:
        :param use_default_mapping:
        :return:
        """
        cur_env = CONFIG.env

        if env_map_dict and cur_env in env_map_dict:
            cur_env = env_map_dict[cur_env]
        elif use_default_mapping:
            cur_env = {
                CONFIG.env: CONFIG.env
            }[cur_env]

        return self.get_value(data_dict, cur_env)

    def get_value(self, source, name, msg=None):
        """

        :param source:
        :param name:
        :param msg:
        :return:
        """
        try:
            value_msg = "Not found (%s) in source %s" % (name, source)
            value = source.get(name, value_msg)
            if value == value_msg:
                assert False, value_msg
        except ValueError:
            if msg is None:
                msg = "cannot found name %s in source %s" % (name, source)
            assert False, msg
        return value

    def env(self, func=None, use_default_mapping=False):
        """

        :param func:
        :param use_default_mapping:
        :return:
        """
        def env_desc(func):
            def wrapper(self):
                _debug = EnvManage().get_value_from_env_dict(
                    func(self), use_default_mapping=use_default_mapping
                )
                return _debug
            return wrapper
        if func is None:
            return env_desc
        else:
            return env_desc(func)




