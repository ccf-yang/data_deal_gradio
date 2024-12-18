#!/usr/bin/env python
# -*- coding: UTF-8 -*-
"""
@Time: 2021/8/26 10:08 上午
@File:  StringHandle.py
@Author:  zhangzhen_zhuqing
@Contact:  zhuqing@pplabs.org
@License: Mulan PSL
"""
import six
import json
from functools import reduce
import random
import copy
import string
import hashlib
from itertools import groupby
from operator import itemgetter
null_list = ["", None, "null", "Null", " ", []]


class StringHandle(object):

    def com_convert_str_to_json(self, value):
        """
        功能：将字符串转换为json格式

        Arguments:
            |  =Name= | =Description= |
            |  value | 待转的字符串 |

        Examples:

            | to_do_string = "{"name": "d1", "age": 10}" |
            | result_json = com_convert_str_to_json(to_do_string) |

        :param value: 待转的字符串

        :return: 转为json格式后的内容
        """
        if value is '':
            raise ValueError("String is Empty, Can't convert to json")
        if isinstance(value, bytes):
            value = value.decode('utf-8')
        if not isinstance(value, six.string_types):
            raise ValueError("The format of input argument {} is not string.".format(value))
        try:
            return json.loads(value)
        except ValueError:
            raise ValueError(
                "The string {} can't convert to json, please check its format".format(value))

    @staticmethod
    def com_get_value_from_dictinlist_by_keyvalue(list_item, key_exp, key='', value=''):
        """
        功能: 从一个list包含多个dict的数据中，通过指定的key-value，取得指定key对应的value值, 返回一个list

        Arguments:
        |  =Name= | =Description= |
        |  list_item | a list contain dict |
        |  key_exp | the expect value of the key |
        |  key | the key in dict |
        |  value | the pair of key in dict |

        Examples:
        | list_item = [{"a":"a1","age":18},{"a":"a2","age":20},{"a":"a3","age":16}] |
        | result = com_get_value_from_dictinlist_by_keyvalue(list_item, "a", "age", 18) |
        | 例子结果: 把 age=18 时的那组数据中 a 键对应的key 返回

        :return: 从指定list中，通过一组指定的key-value值取期望的key对应的value值。
        """
        exp_value = []
        if not isinstance(list_item, list):
            raise ValueError("The format of input is not list.")
        for item in list_item:
            if not isinstance(item, dict):
                raise ValueError("The format of input is not dict.")
            if key not in item:
                print("not in: {}".format(key))
                raise ValueError("The key not in dict.")
            elif item[key] == value:
                exp_value.append(item[key_exp])
        return exp_value

    @staticmethod
    def get_dict_from_list_by_key_value(src_list, _key, _value):
        """
        在一组list-dict中，通过指定的key-value, 返回当前整个dict
        :param src_list:
        :param _key:
        :param _value:
        :return:
        """
        if not isinstance(src_list, list):
            raise TypeError("not list")

        for _dict in src_list:
            if _dict[_key] == _value:
                return _dict

    @staticmethod
    def get_dict_from_list_by_specific_word(src_list, _key, _word):
        """
        在一组list-dict中，通过指定的key-value, 返回当前整个dict
        :param src_list:
        :param _key:
        :param _value:
        :return:
        """
        _dict_all = []
        if not isinstance(src_list, list):
            raise TypeError("not list")

        for _dict in src_list:
            if _word in _dict[_key]:
                _dict_all.append(_dict)
        return _dict_all

    def get_cmdb_values_by_string(self, src_list, _str):
        """
        cmdb-通过指定的字符串获取cmdb资产列表对应的值
        :param src_list:
        :param _str:
        :return:
        """
        _values = self.com_get_value_from_exp_key_value(src_list, "values", "queTitle", _str)
        if _values:
            return _values[0]['dataValue']
        else:
            return ""

    def get_ql_values_by_string(self, src_list, _str):
        """
        cmdb-通过指定的字符串获取cmdb资产列表对应的值
        :param src_list:
        :param _str:
        :return:
        """
        _values = self.com_get_value_from_exp_key_value(src_list, "values", "queTitle", _str)
        if _values:
            return _values[0]['dataValue']
        else:
            return ""

    @staticmethod
    def com_get_value_from_exp_key_value(list_item, key_exp, key='', value=''):
        """
        功能: 从指定list中，通过一组指定的key-value值取期望的key对应的value值。
        :return:
        """
        if not isinstance(list_item, list):
            raise ValueError("The format of input is not list.")
        for item in list_item:
            if not isinstance(item, dict):
                raise ValueError("The format of input is not dict.")
            if key not in item:
                print("not in: {}".format(key))
                raise ValueError("The key not in dict.")
            elif item[key] == value:
                return item[key_exp]

    @staticmethod
    def com_get_sum_from_list(_list):
        """
        计算一个list中的总和
        :param _list:
        :return:
        """
        _sum = reduce(lambda x, y: x + y, _list)
        return _sum

    @staticmethod
    def com_get_keys_from_list(src_list, exp_key):
        """
        从
        :param src_list:
        :param exp_key:
        :return:
        """
        _key_v_list = []
        for _src in src_list:
            _key_v_list.append(_src[exp_key])
        print(list(set(_key_v_list)))
        return list(set(_key_v_list))

    @staticmethod
    def com_check_special_value(_list, _key, _value, exp_key, exp_value):
        """
        一个list包含多个dict，单个dict中，如果某个key1=value1,那么key2对应的值必需是value2
        :param _list:
        :param _key:
        :param _value:
        :param exp_key:
        :param exp_value:
        :return:
        """
        for _dict in _list:
            if _dict[_key] == _value:
                assert _dict[exp_key] == exp_value, "当{}={}时，期望{}={},实际{}是:{}".\
                    format(_key, _value, exp_key, exp_value, exp_key, _dict[exp_key])

    @staticmethod
    def get_value_from_listdict(list_item, key_exp, if_random=None):
        """
        Get value list from a list contain dict by dict's key

        从一个包含多个dict的list中，取出所有dict中指定key对应的value，放入到一个新list中。
        """
        key_value_list = []
        for item in list_item:
            if isinstance(item[key_exp], int):
                key_value_list.append(item[key_exp])
            else:
                if len(str(item[key_exp])) != 0:
                    key_value_list.append(item[key_exp])
        if if_random == "random":
            return random.choice(key_value_list)
        else:
            return key_value_list

    @staticmethod
    def get_multi_from_listdict(list_item, key_exp, key_exp_2):
        """
        获取两个指定字段的乘积，然后存入一个新的list中。

        从一个包含多个dict的list中，取出所有dict中指定key对应的value，放入到一个新list中。
        """
        key_value_list = []
        for item in list_item:
            if isinstance(item[key_exp], int):
                key_value_list.append(item[key_exp]* item[key_exp_2])
            else:
                if len(str(item[key_exp])) != 0:
                    key_value_list.append(item[key_exp] * item[key_exp_2])
        return key_value_list

    @staticmethod
    def com_cut_two(num, c):
        if num == 1:
            return 1
        else:
            c = 10 ** (-c)
            return (num // c) * c

    def get_result_by_minus(self, _list1, _list2):
        """
        上报带宽 减去 压测带宽
        :param _list1:
        :param _list2:
        :return:
        """
        a = 1024 * 1024
        if len(_list1) == 0:
            return sorted(StringHandle.get_multi_from_listdict(_list2, "up_bandwidth", "depreciation"), reverse=True)
        else:
            _list_2_copy = copy.deepcopy(_list2)
            for _item in _list1:
                print("_time: {}={}".format(_item["time"], _item['bwUpload'] / a))
                bw_upload_band = _item['bwUpload'] / a

                for _band in _list_2_copy:
                    if _band['time'] == _item['time']:
                        _minus_band = _band["up_bandwidth"] - bw_upload_band
                        if _minus_band >= 0:
                            _band.update({
                                "up_bandwidth": _minus_band
                            })
                        else:
                            _band.update({
                                "up_bandwidth": 0
                            })
            print("减去压测数据，处理后，带宽数据为: \n{}".format(_list_2_copy))
            band_width_list = StringHandle.get_multi_from_listdict(_list_2_copy, "up_bandwidth", "depreciation")
            sorted_band_width = sorted(band_width_list, reverse=True)
            return sorted_band_width

    def com_check_exp_key_not_null(self, src_data, exp_key_list):
        """
        检查非空字段
        :param src_data:
        :param exp_key_list:
        :return:
        """
        if isinstance(src_data, dict):
            for _key in exp_key_list:
                assert src_data[_key] not in null_list, "期望src_data[{}]对应的value值不为空，" \
                                                        "实际是: {}".format(_key, src_data[_key])
        if isinstance(src_data, list):  # 多个dict组成一个list
            for _data in src_data:
                for _key in _data:
                    assert _data[_key] not in null_list, "_data[{}]对应的value值不为空，" \
                                                            "实际是: {}".format(_key, _data[_key])

    def check_has_exp_value(self, _list_dict, exp_key, exp_value):
        """
        判断一组list_dict中，是否包含指定的key value值
        :param _list_dict:
        :param exp_key:
        :param exp_value:
        :return:
        """
        has_exp_key_value_list = []
        for _d in _list_dict:
            if _d[exp_key] == exp_value:
                has_exp_key_value_list.append(_d)
        if len(has_exp_key_value_list) != 0:
            return True

    def get_result_contain_exp_key(self, _list_dict: dict):
        """
        list中包含不同的key，把所有key对应的value的值取出来存在一个新 list中。
        :param _list_dict:
                {"a1": [{},{},{}], "a2": [{},{},{}]}
                取出a1 a2 对应的value
        :return:
        """
        result_list = []
        if _list_dict:
            _keys = _list_dict.keys()
            for _k in _keys:
                result_list.append(_list_dict[_k])
        return result_list

    def list_dict_distinct(self, _list: list, _key):
        """
        有一个list，里面的每一个元素都是dict，根据某一个key进行去重
        :param _list:
        :param _key:
        :return:
        """
        k = itemgetter(_key)
        _it = sorted(_list, key=k)
        return [next(v) for _, v in groupby(_it, key=k)]

    def list_dict_distinct_key_value(self, _list: list, _key):
        """
        有一个list，里面的每一个元素都是dict，根据某一组key、value 去重

        :param _list:
        :param _key:
        :param _value:
        :return:
        """
        new_list = []
        if _list:
            new_list.append(_list[0])
            for _d in _list:
                k = 0
                for _it in new_list:
                    if _d[_key] != _it[_key]:
                        k += 1
                    else:
                        break
                    if k == len(new_list):
                        new_list.append(_d)
        return new_list

    def get_dict_by_key_value_from_list(self, _list, exp_key, exp_value):
        """

        :param _list:
        :param exp_key:
        :param exp_value:
        :return:
        """
        for _l in _list:
            if _l[exp_key] == exp_value:
                return _l

    def cmp_two_list(self, list_a, list_b):
        """
        比较两个list
        :param list_a: 接口返回
        :param list_b: 数据库查询
        :return:
        """
        in_web_not_sql = []
        in_sql_not_web = []

        for x in list_a:
            if x not in list_b:
                in_web_not_sql.append(x)

        for y in list_b:
            if y not in list_a:
                in_sql_not_web.append(y)
        return in_web_not_sql, in_sql_not_web

    def check_list_content(self, list_a, list_b):
        """
        比较list a,b
        如果list a 中有任意元素在list b 中返回True
        :return:
        """
        if list_b == None:
            return False
        for i in list_a:
            if i in list_b:
                return True
        return False

    @staticmethod
    def com_get_disticnt_value_from_list_by_key(list_item, key=''):
        """
        功能: 从一个list包含多个dict的数据中，通过指定的key-value，取得指定key对应的所有value组成一个set，返回set
        Examples:
        | list_item = [{"a":"a1","age":18},{"a":"a2","age":20},{"a":"a3","age":16}] |
        | result = com_get_disticnt_value_from_list_by_key(list_item, "age") |
        | 例子结果: 把 age=18 时的那组数据中 a 键对应的key 返回(18,20,16)
        """
        exp_value = []
        if not isinstance(list_item, list):
            raise ValueError("The format of input is not list.")
        for item in list_item:
            if not isinstance(item, dict):
                raise ValueError("The format of input is not dict.")
            if key not in item:
                print("not in: {}".format(key))
                raise ValueError("The key not in dict.")
            else:
                exp_value.append(item[key])
        exp_value = list(set(exp_value))
        return exp_value

    def convert_list_to_string(self, _list):
        """
        将list中的所有元素组成一个字符串，用逗号隔开
        :param _list:
        :return:
        """
        # print(str(_list).lstrip('[').rstrip(']'))
        return str(_list).lstrip('[').rstrip(']')

    def get_random_str(self, length: object = 15) -> object:
        """
        获取一定长度的随机字符串
        :param length:
        :return:
        """
        _re = ''.join(random.sample(string.ascii_letters + string.digits, length))
        return _re.upper()

    def return_is_sub_set(self, data_1, data_2):
        """
        判断一个一个字典是否是另一个的子集, 如果是两个list，长度要一致
        :param data_1:
        :param data_2:
        :return:
        """
        if isinstance(data_1, dict) and isinstance(data_2, dict):
            set_data_1 = set(data_1.items())
            set_data_2 = set(data_2.items())
            if set_data_1.issubset(set_data_2):
                return True
            else:
                return False
        elif isinstance(data_1, list) and isinstance(data_2, list):
            is_sub_set = []
            is_not_sub_set = []
            for i in range(len(data_1)):
                set_data_1 = set(data_1[i].items())
                set_data_2 = set(data_2[i].items())
                if set_data_1.issubset(set_data_2):
                    is_sub_set.append(True)
                else:
                    is_not_sub_set.append(False)
            if len(is_sub_set) == len(data_1):
                return True
            else:
                return False

    def get_md5(self, _string):
        """
        获取 md5
        :param string_md5:
        :return:
        """
        string_md5 = hashlib.md5(_string.encode()).hexdigest()

        return string_md5

    def check_attribute_exist(self, item, key):

        for k in key:
            if k not in item:
                raise ValueError("The key [{}] is not exist in {}".format(k, item))

    def check_attribute_exist(self, item, key):

        for k in key:
            if k not in item:
                raise ValueError("The key [{}] is not exist in {}".format(k, item))
            
    @staticmethod
    def com_get_first_safetensors(dict_item, target='files' ,key='name', value='.safetensors'):
        """
        功能: 从指定dict中，通过一组指定的key-value值取期望的dict
        :return:
        """
        if not isinstance(dict_item, dict):
            raise ValueError("The format of input is not dict.")
        file_info = dict_item[target]
        if not isinstance(file_info, list):
            raise ValueError("The format of input is not list.")
        for file in file_info:
            if file[key].endswith(value):
                return file
        return None
    
    @staticmethod
    def get_value_from_listdict_with_condition(list_item, key_exp, function="all"):
        """
        Get value list from a list contain dict by dict's key

        从一个包含多个dict的list中，取出所有dict中指定key对应的value，放入到一个新list中。
        """
        key_value_list = []
        for item in list_item:
            if isinstance(item[key_exp], str):
                if function == "all":
                    key_value_list.append(item[key_exp])
                elif function in item["tags"]["functions"]:
                    key_value_list.append(item[key_exp])
        return key_value_list


if __name__ == "__main__":
    for i in range(1):
        # print("租赁")
        print("SF112003h667")

    print(StringHandle().get_md5("ppio123"))


