import copy
import os
from common.StringHandle import StringHandle
import json
from configparser import ConfigParser
import time
import socket
import logging
import urllib3.util.connection as urllib3_cn
import requests
from common.LogFormat import LogFormat


log = logging.getLogger(__name__)


class FileAction(object):
    log_format = LogFormat()

    def com_get_file_all_path(self, abs_file, join_data_path="testdata"):
        """
        获取文件的全路径
        :param abs_file: 文件相对于 testdata 目录的相对路径
        :param join_data_path:
        :return: 文件的全路径
        """
        curr_project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_path = os.path.join(curr_project_dir, join_data_path)
        file_all_path = os.path.join(data_path, abs_file)
        return file_all_path

    def read_config(self, file_path: str = "config.ini"):
        """
        读取配置文件
        :param file_path:
        :param return_all:
        :return:
        """
        _path = self.com_get_file_all_path(file_path, join_data_path="variables")
        con = ConfigParser()
        if not os.path.exists(_path):
            raise FileNotFoundError("文件: {} 未找到".format(_path))

        con.read(_path, encoding='utf-8')
        return con

    def read_json(self, file_path):
        """
        read json file
        :param file_path: 默认是在项目的testdata目录下
        :return:
        """
        all_path = self.com_get_file_all_path(file_path)
        with open(all_path, "rb") as _json:
            file_json = json.load(_json)

            return file_json

    def print_execute_case_time(self, func):
        """
        打印用例执行时间
        :param func:
        :return:
        """
        from time import time

        def wrapper(*args, **kwargs):
            _start = time()
            _re = func(*args, **kwargs)
            _end = time()
            print("【运行用例方法名】: {}".format(func.__name__).center(100, "*"))
            print("{} 耗时: {}".format(func.__doc__, str(round((_end - _start)))+" s"))
            print("*" * 100)
            return _re
        return wrapper

    def add_data_to_json_file(self, add_data, _path, test_data_path='testdata'):
        """
        向json文件中写入数据
        :param add_data:
        :param _path:
        :param test_data_path:
        :return:
        """
        _all_path = self.com_get_file_all_path(_path, test_data_path)
        json_str = json.dumps(add_data, indent=4, ensure_ascii=False)
        with open(_all_path, 'w') as json_file:
            json_file.write(json_str)

    def add_data_to_file(self, add_data, _path, test_data_path='testdata'):
        """

        :param add_data:
        :param _path:
        :param test_data_path:
        :return:
        """
        _all_path = self.com_get_file_all_path(_path, test_data_path)
        with open(_all_path, 'w') as json_file:
            json_file.write(add_data)

    def save_response_to_file(self, resp, save_path, http_code=200, test_data='testdata'):
        """
        保存下载的文件到指定路径
        :param resp: 接口请求的response
        :param test_data: test_data
        :param http_code: test_data
        :param save_path: http_code 目录的相对路径
        :return:
        """
        file_all_path = self.com_get_file_all_path(save_path, test_data)
        if resp.response.status_code == http_code:
            with open(file_all_path, mode='wb') as f:
                for data in resp.response.iter_content(128):
                    f.write(data)
                f.close()
            return file_all_path
        else:
            raise ValueError("http请求的返回的status code是: {}, 不是200".format(resp.response.status_code))

    def com_read_json_file(self, file_path, test_data='testdata'):
        """

        :param file_path:
        :param test_data:
        :return:
        """
        all_file_path = self.com_get_file_all_path(file_path, join_data_path=test_data)
        with open(all_file_path, 'rb') as f:
            json_con = json.load(f)
            return json_con

    def com_add_data_to_json(self, file_path, add_data: dict, test_data='testdata', **kwargs):
        """

        :param file_path:
        :param add_data:
        :param test_data:
        :return:
        """
        all_file_path = self.com_get_file_all_path(file_path, join_data_path=test_data)
        with open(all_file_path, "w") as w:
            _copy = copy.deepcopy(add_data)
            _copy.update({
                **kwargs
            })
            json.dump(_copy, w)


    def com_add_data_to_html(self, abs_file_path, add_data):
        """
        :param file_path:
        :param test_data:
        :param add_data:
        :return:
        """
        with open(abs_file_path, 'w') as w:
            w.write(add_data)

    # PaaS下载方法。根据传入的url，下载文件，并保存到本地
    def com_download(self, url, name, start, end, ret, filesize, save=True, save_segment=False, headers=None, proxy=False):
        """
        save=True表示保存文件到本地，用于校验文件
        """
        proxies = {'http': "http://43.135.78.162:30004"}  # 代理

        if headers is None:
            headers = {}
        log.info("download start")
        starttime = time.time()
        if end > filesize - 1:
            end = filesize - 1
        rangestr = 'bytes=%d-%d' % (start, end)
        headers['Range'] = rangestr
        headers['Connection'] = "close"
        # headers["X-Accel-Buffering"] = "no"
        headers['accept-encoding'] = "gzip, deflate"  # 解决请求大文件被截断的问题
        headers['decode_content'] = "false"  # 解决请求大文件被截断的问题

        # 指定使用ipv4进行下载
        def allowed_gai_family():
            family = socket.AF_INET
            return family

        urllib3_cn.allowed_gai_family = allowed_gai_family
        try:
            requests.adapters.DEFAULT_RETRIES = 5
            s = requests.session()
            s.keep_alive = False
            if proxy:
                resp = s.get(url=url, proxies=proxies, headers=headers, stream=True, verify=False, timeout=(5, 10))  # timeout第一个参数是请求时长，第二个是响应时长
            else:
                resp = s.get(url=url, headers=headers, stream=True, verify=False, timeout=(5, 10))
            s.close()
            print("___接口请求响应时间是: {}".format(resp.elapsed.total_seconds()))
            if resp.status_code != 206 and resp.status_code != 200:  # 206表示下载成功，416表示range超过文件大小范围
                print(f'download \033[1;31;40m\tfaild\033[0m, 文件名：{name}, headers:{headers}, 请求返回码：{resp.status_code}，文件url：{url}')
            else:
                print('download success, 文件名：{}, {}，耗时{}秒, url:{}'.format(name, rangestr, time.time() - starttime, url))
            assert resp.status_code < 400, url
        except Exception as err:
            print("download 异常！！！")
            print(err)

        # ret.ok = True
        # # ret.data = resp.content
        # # 保存文件
        # if save:
        #     cnt = 30
        #     with open(name, 'wb') as f:
        #         for chunk in resp.iter_content(chunk_size=1024 * 1024):
        #             if chunk:
        #                 print(len(chunk))
        #                 f.write(chunk)
        #             else:
        #                 break
        #             cnt -= 1
        #             if cnt == 0:
        #                 break
        #     time.sleep(3)
        #     file_size = os.path.getsize(name)
        #     print("当前文件大小: {} bytes".format(file_size))
        #     with open(name, 'rb') as f:
        #         ret.data = f.read()
        #
        # # 保存单个分片
        # if save_segment:
        #     cnt = 20
        #     segment_file_name = f"{name.split('.')[0]}_{str(start)}.{name.split('.')[1]}"
        #     with open(segment_file_name, 'wb') as f:
        #         for chunk in resp.iter_content(chunk_size=1024 * 1024):
        #             if chunk:
        #                 f.write(chunk)
        #             else:
        #                 break
        #             cnt -= 1
        #             if cnt == 0:
        #                 break
        #     with open(segment_file_name, 'rb') as f:
        #         ret.data = f.read()
        # 保存文件
        if save:
            with open(name, 'wb') as f:
                for chunk in resp.iter_content(chunk_size=1024 * 1024):
                    if chunk:
                        f.write(chunk)
                    else:
                        break
            time.sleep(3)
            file_size = os.path.getsize(name)
            print("当前文件大小: {} bytes".format(file_size))
            with open(name, 'rb') as f:
                ret.data = f.read()

        # 保存单个分片
        if save_segment:
            segment_file_name = f"{name.split('.')[0]}_{str(start)}.{name.split('.')[1]}"
            with open(segment_file_name, 'wb') as f:
                for chunk in resp.iter_content(chunk_size=1024 * 1024):
                    if chunk:
                        f.write(chunk)
                    else:
                        break
            with open(segment_file_name, 'rb') as f:
                ret.data = f.read()

    def com_download_file(self, url, headers, file_path):
        """
        302下载文件并保存到本地
        """
        headers = headers
        headers['Connection'] = "close"
        headers['accept-encoding'] = "gzip, deflate"  # 解决请求大文件被截断的问题
        headers['decode_content'] = "false"  # 解决请求大文件被截断的问题

        try:
            with requests.get(url=url, headers=headers, stream=True) as response:
                response.raise_for_status()
                with open(file_path, 'wb') as file:
                    for chunk in response.iter_content(chunk_size=8192):
                        file.write(chunk)
                file_size = os.path.getsize(file_path)
                print("当前文件大小: {} bytes".format(file_size))
        except requests.exceptions.RequestException as e:
            print(e)

    def com_get_stream_by_url(self, url, params, headers):
        """
        公共方法，通过URL来拉流
        :return:
        """
        # resp = requests.get(url=url, params=params, stream=True, timeout=10)
        # self.log_format.log_format(resp, method="GET", url=url, desc="通过URL拉流")
        # return resp
        try:
            resp = requests.get(url=url, params=params, headers=headers, stream=True,
                                    verify=False, timeout=10)
            resp.raise_for_status()  # 检查响应状态，如果不是2xx状态会抛出异常
            if resp.content:
                # 处理响应内容
                content = resp.content
            else:
                # 处理空响应内容
                print("Empty response")
            return resp
        except requests.exceptions.RequestException as e:
            # 处理请求异常
            print("Request failed:", e)
            return e

if __name__ == "__main__":
    print(FileAction().com_get_file_all_path("bigdata/v5"))







