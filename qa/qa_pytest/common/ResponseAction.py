#!/usr/bin/env python
# -*- coding: UTF-8 -*-
"""
@Time: 2021/8/30 2:25 下午
@File:  ResponseAction.py
@Author:  zhangzhen_zhuqing
@Contact:  zhuqing@pplabs.org
@License: Mulan PSL
"""
from common.StringHandle import StringHandle


class ResponseAction(object):

    def com_check_resp_code_re_json(self, response: object, code=0, http_code: int = 200, check_switch=1):
        """
        # 20220429,新增check_switch参数，默认为1
        :param response: 接口请求后，返回的response对象
        :param code: 接口请求后，返回的code，默认是0
        :param http_code: 默认http状态码 = 200
        :param check_switch: 结果码校验开关，默认1-校验，0-不校验
        :return:
        """
        # print("结果:", response.response.content)
        if response.response.content is not "":
            if check_switch:
                assert response.response.status_code == http_code, """期望的http状态码是: {},
                实际是: {}, 返回内容是: {}""".format(http_code, response.response.status_code,
                                             StringHandle().com_convert_str_to_json(response.response.content))

        resp_content = response.response.content
        resp_json = StringHandle().com_convert_str_to_json(resp_content)
        if "code" in resp_json:
            if check_switch:
                assert resp_json['code'] == code, "expected code={}, but actual is: {} for request url: {}".\
                    format(code, resp_json['code'], response.response.url)

        if "data" in resp_json:
            return resp_json['data']
        else:
            return resp_json
        
    def com_check_resp_code_re_json_with_response_header(self, response: object, code=0, http_code: int = 200, check_switch=1):
        """
        :return:
        """
        # print("结果:", response.response.content)
        if response.response.content is not "":
            if check_switch:
                assert response.response.status_code == http_code, """期望的http状态码是: {},
                实际是: {}, 返回内容是: {}""".format(http_code, response.response.status_code,
                                             StringHandle().com_convert_str_to_json(response.response.content))

        resp_content = response.response.content
        resp_json = StringHandle().com_convert_str_to_json(resp_content)
        if "code" in resp_json:
            if check_switch:
                assert resp_json['code'] == code, "expected code={}, but actual is: {} for request url: {}".\
                    format(code, resp_json['code'], response.response.url)

        resp = {}
        if "data" in resp_json:
            resp["body"] = resp_json['data']
        else:
            resp["body"] = resp_json

        # X-Novita-Task-Id
        if "X-Novita-Task-Id" in response.response.headers:
            task_id = response.response.headers.get("X-Novita-Task-Id")
            resp["task_id"] = task_id

        return resp


    def com_check_qing_flow_result(self, response: object, err_code=0, http_code: int = 200):
        """

        :param response:
        :param err_code:
        :param http_code:
        :return:
        """
        assert response.response.status_code == http_code
        resp_content = response.response.content
        resp_json = StringHandle().com_convert_str_to_json(resp_content)
        if "errCode" in resp_json:
            assert resp_json['errCode'] == err_code, "expected errCode={}, but actual is: {} for request url: {}".\
                format(err_code, resp_json['errCode'], response.response.url)

        if "result" in resp_json:
            return resp_json['result']
        else:
            return resp_json

    def com_check_resp_code_re_json_with_data(self, response: object, code=0, http_code: int = 200):
        """

        :param response: 接口请求后，返回的response对象
        :param code: 接口请求后，返回的code，默认是0
        :param http_code: 默认http状态码 = 200
        :return:
        """
        assert response.response.status_code == http_code, """期望请求的http状态码为: {},
        实际是: {}, 返回内容是: {}""".format(http_code, response.response.status_code, response.response.content)
        resp_content = response.response.content
        resp_json = StringHandle().com_convert_str_to_json(resp_content)
        if "code" in resp_json:
            assert resp_json['code'] == code, "expected code={}, but actual is: {} for request url: {}".\
                format(code, resp_json['code'], response.response.url)
        return resp_json

    def com_check_resp_http_code(self, response: object, http_code: int = 200):
        """
        校验接口返回的http_status_code
        :param response:
        :param http_code:
        :return:
        """
        print(" X-requestid: {} ".format(response.response.headers.get("X-Requestid")).center(100, "*"))
        assert response.response.status_code == http_code, """期望请求的http状态码为: {},
        实际是: {}, 返回内容是: {}""".format(http_code, response.response.status_code, response.response.content)
        if response.response.status_code != 404:
            if response.response.content:
                return StringHandle().com_convert_str_to_json(response.response.content)

    def com_check_resp_only_http_code(self, response: object, http_code: int = 200):
        """
        校验接口返回的http_status_code
        :param response:
        :param http_code:
        :return:
        """
        assert response.response.status_code == http_code, """期望请求的http状态码为: {},
        实际是: {}""".format(http_code, response.response.status_code)
        return response
    
    def com_check_resp_code_re_json_without_codecheck(self, response: object):
        """
        #
        :param response: 接口请求后，返回的response对象
        :return:
        """

        resp_content = response.response.content
        resp_json = StringHandle().com_convert_str_to_json(resp_content)
        if "data" in resp_json:
            return resp_json['data']
        else:
            return resp_json
        
    def com_check_resp_code_re_json_msg(self, response: object, code=0, http_code: int = 200):
        """
        # 20220429,新增check_switch参数，默认为1
        :param response: 接口请求后，返回的response对象
        :param code: 接口请求后，返回的code，默认是0
        :param http_code: 默认http状态码 = 200
        :param check_switch: 结果码校验开关，默认1-校验，0-不校验
        :return:
        """
        # print("结果:", response.response.content)
        if response.response.content is not "":
            assert response.response.status_code == http_code, """期望的http状态码是: {},
            实际是: {}, 返回内容是: {}""".format(http_code, response.response.status_code,
                                            StringHandle().com_convert_str_to_json(response.response.content))

        resp_content = response.response.content
        resp_json = StringHandle().com_convert_str_to_json(resp_content)
        if "code" in resp_json:
            assert resp_json['code'] == code, "expected code={}, but actual is: {} for request url: {}".\
                format(code, resp_json['code'], response.response.url)

        if "msg" in resp_json:
            return resp_json['msg']
        else:
            return resp_json


if __name__ == "__main__":
    import requests
    _resp = requests.get("http://api.test.painet.work/openapi/v1/region_blacklist/bz")
    print(StringHandle().com_convert_str_to_json(_resp.content))
