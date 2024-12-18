import copy
import json
import os
import xlrd
import sys
sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from common.ReadApiParams import get_api_params_by_key
_mark=get_api_params_by_key("mark_name")

def generate_conf(importtou = True):
    txt = '''
import time
from ppioBaseCore.session.SessionManager import SessionManager
import pytest
from common.ReadApiParams import get_api_params_by_key

@pytest.fixture(scope='session', autouse=True)
def setup_function():
    SessionManager().setHeaders({"authorization": get_api_params_by_key("authorization")})
'''
    if importtou:
        print("1、生成conftest.py")
        with open(conftestpath, "a+", encoding='utf-8') as f:
            code = txt + "\n"
            f.write(code)
            conftest_code = code

def get_max_keys(name,dictionary):
    max_keys = []
    max_count = 0

    current_keys = list(dictionary.keys())
    if len(current_keys) > max_count:
        max_keys = current_keys
        max_count = len(current_keys)

    for key, value in dictionary.items():
        if len(value) > max_count:
            name = key
            max_keys = value.split(',')
            max_count = len(value)
    return name, max_keys


# 生成business代码，f.writestatus为true会输出business代码
def generate_business_code(apiuriname,printstatus=True,importtou=True):
    funcNameDic = {}
    instructionsDic = {}
    instructionsDic2 = {}
    resp_dic = {}
    # 读取文件
    file = xlrd.open_workbook(xlspath)
    # 根据sheet索引或者名称获取sheet内容
    sheet = file.sheet_by_index(0)
    # 获取行数和列数
    nrows = sheet.nrows
    ncols = sheet.ncols
    # 循环行列表数据
    for i in range(nrows):
        # 跳过首行数据
        if i == 0:
            continue
        uri = ''
        retype = ''
        funcname = ''
        instruction = ''
        func_name_simple = ''
        haveheaderparams = False
        havebodyparams = False
        haveurlparams = False

        row_data = sheet.row_values(i)  # 返回给定行中单元格的值的list
        # 获取第一列，判断请求类型
        if row_data[0]:
            retype = row_data[0]
        # 获取第二列，判断uri是否有值
        if row_data[1]:
            uri = row_data[1]
        else:
            continue
        # 获取第四列，判断是否是header传参
        if row_data[3]:
            haveheaderparams = True

        # 获取第三列，判断是否是url传参
        if row_data[2]:
            haveurlparams = True

        # 获取第5列，判断是否是body传参
        if row_data[4]:
            havebodyparams = True

        # 获取第6列，获取该接口名字
        if row_data[5]:
            funcname = row_data[5]
            if '-' in funcname:
                funcname = funcname.replace('-', '_')

        # 获取第7列，获取该接口说明
        if row_data[6]:
            instruction = row_data[6]

        # 获取第16列，获取该接口名字
        if row_data[16]:
            resp_tmp = json.loads(row_data[16])
            kresp, vresp = get_max_keys('one', resp_tmp)
            resp_dic[i] = {kresp: vresp}
        else:
            resp_dic[i] = ''

        mark = r"@api.mark(module='%s')" % (apiuriname)
        http_head = f'@api.http.{retype}(path="/api{uri}")'
        if haveheaderparams:
            if havebodyparams:
                if haveurlparams:  # head和body和url都有,很少
                    func_name = f'def api_iaas_{funcname}(self, params=None,data=None,other_params=None):'
                    func_name_simple = f'api_iaas_{funcname}'
                    returnstr = f'return dict(params=params,json=data,other_params=other_params)'
                else:  # head和body都有，很少
                    func_name = f'def api_iaas_{funcname}(self,params=None, data=None):'
                    func_name_simple = f'api_iaas_{funcname}'
                    returnstr = f'return dict(params=params,json=data)'
            else:
                if haveurlparams:  # head和url都有的时候
                    func_name = f'def api_iaas_{funcname}(self, data=None,other_params=None):'
                    func_name_simple = f'api_iaas_{funcname}'
                    returnstr = f'return dict(params=data,other_params=other_params)'
                else:  # 仅head有
                    func_name = f'def api_iaas_{funcname}(self, data=None):'
                    func_name_simple = f'api_iaas_{funcname}'
                    returnstr = f'return dict(params=data)'
        else:
            if havebodyparams:  # body和url都有
                if haveurlparams:
                    func_name = f'def api_iaas_{funcname}(self, data=None,other_params=None):'
                    func_name_simple = f'api_iaas_{funcname}'
                    returnstr = f'return dict(json=data,other_params=other_params)'
                else:  # 仅body有
                    func_name = f'def api_iaas_{funcname}(self, data=None):'
                    func_name_simple = f'api_iaas_{funcname}'
                    returnstr = f'return dict(json=data)'
            else:
                if haveurlparams:  # 仅url都有
                    func_name = f'def api_iaas_{funcname}(self, data=None,other_params=None):'
                    func_name_simple = f'api_iaas_{funcname}'
                    returnstr = f'return dict(params=data,other_params=other_params)'
                else:  # 没有参数
                    func_name = f'def api_iaas_{funcname}(self, data=None):'
                    func_name_simple = f'api_iaas_{funcname}'
                    returnstr = f'return dict(params=data)'

        if printstatus:
            with open(apipath, "a+", encoding="utf-8") as f:
                if importtou:
                    print('2、generate api code')
                    f.write('from ppioBaseCore import api\n')
                    f.write(f'class {apifilenameclass}(object):\n')
                    importtou = False
                f.write('\t#第' + str(i) + '个接口\n')
                f.write("\t" + mark + '\n')
                f.write("\t" + http_head + '\n')
                f.write("\t" + func_name + '\n')
                f.write("\t\t'''" + "\n" + "\t\t@功能说明: " + instruction + "\n" + "\t\t'''\n")
                f.write("\t\t" + returnstr + '\n')

        funcNameDic[i] = func_name_simple
        instructionsDic[i] = instruction
        instructionsDic2[i] = "\t'''" + "\n" + "\t\t@功能说明: " + instruction + "\n" + "\t\t'''"
    return funcNameDic, instructionsDic, instructionsDic2, resp_dic


# 生成common部分代码，f.writestatus为true会输出common后的代码
def generate_common_function_code(firstdic, instructdic, printstatus=True,importtou = True):
    func_second_name = {}
    total_params_dict = {}

    # 读取文件
    file = xlrd.open_workbook(xlspath)
    # 根据sheet索引或者名称获取sheet内容
    sheet = file.sheet_by_index(0)
    # 获取行数和列数
    nrows = sheet.nrows
    ncols = sheet.ncols
    print('3、generate func code')
    # 循环行列表数据
    for i in range(nrows):
        url_params = []
        header_params = []
        body_params = []
        _resp_str = ''
        return_str = 'return resp'
        url_str = ''
        header_str = ''
        body_str = ''
        total_params = ''

        # 跳过首行数据
        if i == 0:
            continue
        row_data = sheet.row_values(i)
        # 获取第3列，判断是否有url参数
        if row_data[2]:
            if row_data[7]:
                url_params = [x for x in row_data[7].split(',') if x != '']

        # 获取第4列，判断是否有header参数
        if row_data[3]:
            if row_data[9]:
                header_params = [x for x in row_data[9].split(',') if x != '']

        # 获取第5列，判断是否有body传参
        if row_data[4]:
            if row_data[11]:
                body_params = [x for x in row_data[11].split(',') if x != '']

        if header_params:
            rs_tmp1 = ''
            for p1 in header_params:
                rs_tmp1 += '"' + str(p1) + '": ' + str(p1) + ', '
                total_params += p1 + ', '
            header_str = 'req_data_header={**kwargs}'

        if url_params:
            rs_tmp1 = ''
            for p1 in url_params:
                rs_tmp1 += '"' + str(p1) + '": ' + str(p1) + ', '
                total_params += p1 + ', '
            url_str = 'req_data_url={%s}' % rs_tmp1

        if body_params:
            rs_tmp1 = ''
            for p1 in body_params:
                rs_tmp1 += '"' + str(p1) + '": ' + str(p1) + ', '
                total_params += p1 + ', '
            body_str = 'req_data_body={**kwargs}'
        if url_params:
            if header_params or body_params:
                func_str = f'def func_{firstdic[i]}(self,%s,http_code=HTTP_STATUS_CODE_200,**kwargs):' % ", ".join(url_params)
            else:
                func_str = f'def func_{firstdic[i]}(self,%s,http_code=HTTP_STATUS_CODE_200):'  % ", ".join(url_params)  #path params认为是必填参数，其他参数都可以视为可选参数
        else:
            if header_params or body_params:
                func_str = f'def func_{firstdic[i]}(self,http_code=HTTP_STATUS_CODE_200,**kwargs):'
            else:
                func_str = f'def func_{firstdic[i]}(self,http_code=HTTP_STATUS_CODE_200):'
        resp_str = r'resp = self.resp_check.com_check_resp_http_code(response=_resp, http_code=http_code)'
        if printstatus:
            with open(funcpath, "a+", encoding='utf-8') as f:
                if importtou:
                    f.write(f'from business.auto.{apifilename} import {apifilenameclass}' + "\n")
                    f.write('''from common.ResponseAction import ResponseAction
from variables.http_status_code import *
from common.StringHandle import StringHandle
from ppioBaseCore.session.SessionManager import SessionManager
from common.TimeAction import TimeAction
from common.ReadConfigData import ReadConfigData
run_env = ReadConfigData().get_cfg_run_env
''' + "\n")
                    f.write(f'class {funcfilenameclass}(object):' + "\n")
                    f.write('''\tdef __init__(self):
\t\tself.resp_check = ResponseAction()
\t\tself.str = StringHandle()
\t\tself.time = TimeAction()
\t\tself.session = SessionManager()''' + "\n")
                    f.write(f'\t\tself.{common_apiname} = {apifilenameclass}()' + "\n")
                    importtou = False

                f.write('\t#----------第%s个接口的方法----------\n' % i)
                if header_str:
                    if url_str:
                        f.write("\t" + func_str + "\n")
                        f.write("\t" + instructdic[i] + '\n\t\t#可以填入的参数有:%s' % (total_params) + "\n")
                        f.write("\t" + "\t" + url_str + "\n")
                        f.write("\t" + "\t" + header_str + "\n")
                        f.write("\t" + "\t" + f'_resp=self.{common_apiname}.{firstdic[i]}(%s,%s)' % (
                            "data=req_data_header", "other_params=req_data_url") + "\n")
                        f.write("\t" + "\t" + resp_str + "\n")
                        f.write("\t" + "\t" + return_str + "\n")
                    else:
                        f.write("\t" + func_str + "\n")
                        f.write("\t" + instructdic[i] + '\n\t\t#可以填入的参数有:%s' % (total_params) + "\n")
                        f.write("\t" + "\t" + header_str + "\n")
                        f.write("\t" + "\t" + f'_resp=self.{common_apiname}.{firstdic[i]}(%s)' % (
                            "data=req_data_header") + "\n")
                        f.write("\t" + "\t" + resp_str + "\n")
                        f.write("\t" + "\t" + return_str + "\n")
                else:
                    if body_str:
                        if url_str:
                            f.write("\t" + func_str + "\n")
                            f.write("\t" + instructdic[i] + '\n\t\t#可以填入的参数有:%s' % (total_params) + "\n")
                            f.write("\t" + "\t" + url_str + "\n")
                            f.write("\t" + "\t" + body_str + "\n")
                            f.write("\t" + "\t" + f'_resp=self.{common_apiname}.{firstdic[i]}(%s,%s)' % (
                                "data=req_data_body", "other_params=req_data_url") + "\n")
                            f.write("\t" + "\t" + resp_str + "\n")
                            f.write("\t" + "\t" + return_str + "\n")
                        else:
                            f.write("\t" + func_str + "\n")
                            f.write("\t" + instructdic[i] + '\n\t\t#可以填入的参数有:%s' % (total_params) + "\n")
                            f.write("\t" + "\t" + body_str + "\n")
                            f.write("\t" + "\t" + f'_resp=self.{common_apiname}.{firstdic[i]}(%s)' % (
                                "data=req_data_body") + "\n")
                            f.write("\t" + "\t" + resp_str + "\n")
                            f.write("\t" + "\t" + return_str + "\n")
                    else:
                        if url_str:
                            f.write("\t" + func_str + "\n")
                            f.write("\t" + instructdic[i] + '\n\t\t#可以填入的参数有:%s' % (total_params) + "\n")
                            f.write("\t" + "\t" + url_str + "\n")
                            f.write(
                                "\t" + "\t" + f'_resp=self.{common_apiname}.{firstdic[i]}(%s)' % (
                                    "other_params=req_data_url") + "\n")
                            f.write("\t" + "\t" + resp_str + "\n")
                            f.write("\t" + "\t" + return_str + "\n")
                        else:
                            f.write("\t" + func_str + "\n")
                            f.write("\t" + instructdic[i] + '\n\t\t#可以填入的参数有:%s' % (total_params) + "\n")
                            f.write("\t" + "\t" + f'_resp=self.{common_apiname}.{firstdic[i]}(%s)' % (
                                "data={}") + "\n")
                            f.write("\t" + "\t" + resp_str + "\n")
                            f.write("\t" + "\t" + return_str + "\n")
        total_params_dict[i] = total_params
    return total_params_dict


##生成testcases通用部分代码
def generate_testcase_code(firstdic, instructdic, totalparams_dic, responsedic,importtou = True):
    fixed_common_object_name = testcases_apiname
    at1 = f'@pytest.mark.parametrize("doc,%s httpcode", ['
    at1over = '])'
    at2 = '@pytest.mark.%s'
    funcname = 'def test_check_%s(self,doc,%s httpcode):'
    resp_data_str = 'resp_data=self.%s.%s(%s http_code=httpcode)'

    with open(casespath, 'a+', encoding='utf') as f:
        for i in firstdic:
            respkey = ''
            respvalue = ''
            if responsedic.get(i):
                for k, v in responsedic[i].items():
                    respkey = k
                    respvalue = v
            if importtou:
                print('4、generate cases code')
                f.write('''import random
import time
import pytest
import allure
from common.StringHandle import StringHandle
from common.TimeAction import TimeAction
from variables.http_status_code import *
from common.ReadConfigData import ReadConfigData
run_env = ReadConfigData().get_cfg_run_env''' + "\n")
                f.write(
                    f'from common.auto.{funcfilename} import {funcfilenameclass}  ##导入common中接口函数' + "\n")
                f.write('@allure.parent_suite("{}")'.format(get_api_params_by_key("suite_name")) + "\n")
                f.write(f'class {testcasefilenameclass}(object):' + "\n")
                f.write('''\tdef setup_class(self):
\t\tself.str = StringHandle()
\t\tself.time = TimeAction()''' + "\n")
                f.write(f'\t\tself.{testcases_apiname} = {funcfilenameclass}()' + "\n")
                f.write('''\tdef teardown_class(self):
\t\tpass''' + "\n")
                checkcode = '''\tdef check_resp_params(self, expert_keys, actual_resp):
\t\t\'\'\'
\t\t@param respkeys: 传入字典中需要有的key列表
\t\t@param resp: 传入待检查字典
\t\t@return: 返回处理完的respkeys
\t\t\'\'\'
\t\ta = len(expert_keys)
\t\tb = len(actual_resp.keys())
\t\tif a > b:
\t\t\treturn 'sad,期望返回的参数比实际返回的参数多了{}个参数,分别是{}'.format(a - b,expert_keys - actual_resp.keys())
\t\tif b > a:
\t\t\treturn 'sad,期望返回的参数比实际返回的参数少了了{}个参数,分别是{}'.format(b - a,actual_resp.keys() - expert_keys)
\t\tif isinstance(actual_resp, dict):
\t\t\tfor k in actual_resp.keys():
\t\t\t\tif k in expert_keys:
\t\t\t\t\texpert_keys.remove(k)
\t\t\treturn expert_keys
\t\telse:
\t\t\treturn 'sad,期望返回的参数类型不是dict,实际返回的参数类型是{}'.format(type(actual_resp))
'''
                f.write(checkcode + "\n")
                importtou = False
            if i == 0:
                continue
            common_func_name = f'func_{firstdic[i]}'

            newparams = ''
            if totalparams_dic[i]:
                params_list = [x for x in totalparams_dic[i].split(',') if x != ' ']
                if params_list:
                    len_params = len(params_list)
                    for index, parm in enumerate(params_list):
                        newparams += f'{parm}={parm.lower()}'
                        if index != len_params - 1:
                            newparams += ','
            param_tmp_s = ','.join([x.lower() for x in totalparams_dic[i].split(',') if x != ' '])
            f.write('\t#------------------%s-------------\n' % i)
            f.write('\t' + at1 % (param_tmp_s + ',' if param_tmp_s else '') + "\n")
            generate_usecases(f, [x.lower() for x in totalparams_dic[i].split(',') if x != ' ' and x], instructdic[i])
            f.write('\t' + at1over + "\n")
            f.write('\t' + at2 % _mark + "\n")
            f.write('\t' + funcname % (firstdic[i], param_tmp_s + ',' if param_tmp_s else '') + "\n")
            f.write('\t\t' + resp_data_str % (
                fixed_common_object_name, common_func_name, newparams + ',' if newparams else '') + "\n")
            if respkey:
                f.write('\t\t' + "if httpcode == HTTP_STATUS_CODE_200:" + "\n")
                if respkey == 'one':
                    f.write('\t\t\t' + "if resp_data:" + "\n")
                    f.write('\t\t\t\t' + "respkeys=%s" % str(respvalue) + "\n")
                    f.write('\t\t\t\t' + "rb = self.check_resp_params(respkeys, resp_data)" + "\n")
                else:
                    f.write('\t\t\t' + "if resp_data.get('%s'):" % respkey + "\n")
                    f.write('\t\t\t\t' + "respkeys=%s" % str(respvalue) + "\n")
                    f.write(
                        '\t\t\t\t' + "rb = self.check_resp_params(respkeys, resp_data.get('%s')[0])" % respkey + "\n")
                f.write('\t\t\t\t' + "if isinstance(rb, str) and rb.startswith('sad'):" + "\n")
                f.write('\t\t\t\t\t' + 'assert rb == [], "错误信息为：{}".format(rb)' + "\n")
                f.write('\t\t\t\t' + "else:" + "\n")
                f.write('\t\t\t\t\t' + 'assert rb == [], "实际响应参数少了{}".format(rb)' + "\n")

            f.write("\n")
        checkcode = '''\tdef check_resp_params(self, expert_keys, actual_resp):
\t\t\'\'\'
\t\t@param respkeys: 传入字典中需要有的key列表
\t\t@param resp: 传入待检查字典
\t\t@return: 返回处理完的respkeys
\t\t\'\'\'
\t\ta = len(expert_keys)
\t\tb = len(actual_resp.keys())
\t\tif a > b:
\t\t\treturn 'sad,期望返回的参数比实际返回的参数多了{}个参数,分别是{}'.format(a - b,expert_keys - actual_resp.keys())
\t\tif b > a:
\t\t\treturn 'sad,期望返回的参数比实际返回的参数少了了{}个参数,分别是{}'.format(b - a,actual_resp.keys() - expert_keys)
\t\tif isinstance(actual_resp, dict):
\t\t\tfor k in actual_resp.keys():
\t\t\t\tif k in expert_keys:
\t\t\t\t\texpert_keys.remove(k)
\t\t\treturn expert_keys
\t\telse:
\t\t\treturn 'sad,期望返回的参数类型不是dict,实际返回的参数类型是{}'.format(type(actual_resp))
'''



def generate_usecases(f, params, instruct):
    all_param = params
    len_param = len(all_param)
    index=1
    # (case info , case value , case status code)
    if len_param == 0:
        f.write("\t\t('%s',%s)" % (instruct , 'HTTP_STATUS_CODE_200') + ',\n')
        return
    case = '值正常case1'
    f.write("\t\t('%s',%s,%s)" % (
        instruct + case + '-' + str(index), ','.join([f'\'{item.strip()}\'' for item in all_param]), 'HTTP_STATUS_CODE_200') + ',\n')

    case1 = '值不存在case2'
    for i, param in enumerate(all_param):
        a = copy.deepcopy(all_param)
        a[i] = 'nexist_value'
        index += 1
        f.write("\t\t('%s',%s,%s)" % (
            instruct + case1+ '-' + str(index), ','.join([f'\'{item.strip()}\'' for item in a]), 'HTTP_STATUS_CODE_400') + ',\n')

    case2 = '值为空case3'
    for i, param in enumerate(all_param):
        a = copy.deepcopy(all_param)
        a[i] = ' '
        index += 1
        f.write("\t\t('%s',%s,%s)" % (
            instruct + case2+ '-' + str(index), ','.join([f'\'{item.strip()}\'' for item in a]), 'HTTP_STATUS_CODE_400') + ',\n')

    case3 = '值不传case4'
    for i, param in enumerate(all_param):
        a = copy.deepcopy(all_param)
        index += 1
        if i == 0:
            f.write("\t\t('%s',%s,%s)" % (instruct + case3+ '-' + str(index), 'None' if len_param == 1 else 'None,' + ','.join(
                [f'\'{item.strip()}\'' for item in a[i + 1:]]), 'HTTP_STATUS_CODE_400') + ',\n')
        if i > 0 and i < len_param - 1:
            f.write("\t\t('%s',%s,%s)" % (instruct + case3+ '-' + str(index),
                                          ','.join([f'\'{item.strip()}\'' for item in a[:i]]) + ',None,' + ','.join(
                                              [f'\'{item.strip()}\'' for item in a[i + 1:]]),
                                          'HTTP_STATUS_CODE_400') + ',\n')
        if i != 0 and i == len_param - 1:
            f.write("\t\t('%s',%s,%s)" % (
                instruct + case3+ '-' + str(index), ','.join([f'\'{item.strip()}\'' for item in a[:i]]) + ',None ',
                'HTTP_STATUS_CODE_400') + ',\n')

    case4 = '值类型错误case5'
    for i, param in enumerate(all_param):
        a = copy.deepcopy(all_param)
        a[i] = 'errortype'
        index += 1
        f.write("\t\t('%s',%s,%s)" % (
            instruct + case4+ '-' + str(index), ','.join([f'\'{item.strip()}\'' for item in a]), 'HTTP_STATUS_CODE_400') + ',\n')

    case5 = '值范围异常case6'
    for i, param in enumerate(all_param):
        a = copy.deepcopy(all_param)
        a[i] = 'wrongrange'
        index += 1
        f.write("\t\t('%s',%s,%s)" % (
            instruct + case5+ '-' + str(index), ','.join([f'\'{item.strip()}\'' for item in a]), 'HTTP_STATUS_CODE_400') + ',\n')


def judge_and_create_dir_and_file():
    if os.path.exists(apidir):
        print("api directory already exists！")
    else:
        os.mkdir(apidir)
    if os.path.exists(funcdir):
        print("func directory already exists！")
    else:
        os.mkdir(funcdir)
    if os.path.exists(casesdir):
        print("cases directory already exists！")
    else:
        os.mkdir(casesdir)

    apipath = os.path.join(apidir, apifilename + '.py')
    funcpath = os.path.join(funcdir, funcfilename + '.py')
    casespath = os.path.join(casesdir, testcasefilename + '.py')
    conftestpath = os.path.join(casesdir, 'conftest.py')
    rm_exist_file([apipath, funcpath, casespath, conftestpath])
    return apipath, funcpath, casespath, conftestpath

def rm_exist_file(paths):
    for path in paths:
        if os.path.exists(path):
            os.remove(path)

if __name__ == '__main__':
    conftest_code=''
    business_code = ''
    func_code = ''
    testcase_code = ''
    # 参数需要修改部分：文件名*3，文件所在目录名*3，文件中类名*3，文件中类实例化后名*2，接口excel路径*1=12
    xlspath = f'D:\\tmp\\all.xls'  # 用例的excel文件

    # gpucloud openapi
    common_apiname = 'CuseBusiness'  # common引用business中类，实例化的名称。或者描述为：common中定义的调用bussiness中类的对象名(实例化名)，例如：self.gpu_cloud_business = GpuCloudConsoleApiClass()
    testcases_apiname = 'Tusecommon'  # testcases中引用common中类，实例化的名称
    api_url_name = "domain_in_env"  # testenv中需要添加的域名
    apifilename = 'BusinessFileName'  # business中的文件名
    funcfilename = 'CommonFileName'  # conmmon中的文件名
    testcasefilename = 'test_cases_file_name'  # testcases里的文件名,注意这里可能会生成一个文件夹
    apifilenameclass = 'BussinessClassName'  # business文件中的类名
    funcfilenameclass = 'CommonClassName'  # common文件中的类名
    testcasefilenameclass = 'Test_Testcases_ClassName'  # testcases文件中的类名

    cur_project_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
 
    apidir = os.path.join(cur_project_path, r'business\auto')  # 生成的api 相应business存放目录
    funcdir = os.path.join(cur_project_path, r'common\auto')  # 生成的func common文件存放目录
    casesdir =os.path.join(cur_project_path,  r'testcases\test_auto_cases')  # 生成的testcases存放目录

    if not os.path.exists(xlspath):
        raise ValueError("xlspath is not exist!")
    # 不用修改部分
    apipath, funcpath, casespath, conftestpath = judge_and_create_dir_and_file()
    addmark = True  # True为新增文件，False为追加文件
    generate_conf(importtou = addmark)
    businessfunc_name_dic, instructdic, instructionsDic2, response_dic = generate_business_code(apiuriname=api_url_name,printstatus=True,importtou = addmark)
    totalparams_dic = generate_common_function_code(firstdic=businessfunc_name_dic, instructdic=instructionsDic2,printstatus=True,importtou = addmark)
    generate_testcase_code(firstdic=businessfunc_name_dic, instructdic=instructdic, totalparams_dic=totalparams_dic,responsedic=response_dic,importtou = addmark)

    print("conftest_code")
    print(conftest_code)
    print("1. Bussiness code")
    print(business_code)
    print("2. Common code")
    print(func_code)
    print("3. Testcase code")
    print(testcase_code)    