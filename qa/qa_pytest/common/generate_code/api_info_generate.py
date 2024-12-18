import json
import os
import sys

sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from common.ReadApiParams import get_api_params_by_key
from common.generate_code.common_config import *

_mark=get_api_params_by_key("mark_name")


# 生成business代码，f.writestatus为true会输出business代码
def generate_business_code(rawapiinfo, printstatus=True):
    funcname, apiinfo = '', ''
    for k, v in rawapiinfo.items():
        funcname, apiinfo = k, v
    row_data = apiinfo.split("++")
    uri = ''
    retype = ''
    instruction = ''
    haveheaderparams = False
    havebodyparams = False
    haveurlparams = False
    # 获取第一列，判断请求类型post
    if row_data[0]:
        retype = row_data[0]
    # 获取第二列，判断uri path是否有值
    if row_data[1]:
        uri = row_data[1]
    # 获取第三列，判断是否是path传参
    if row_data[2]:
        haveurlparams = True

    # 获取第四列，判断是否是query传参
    if row_data[3]:
        haveheaderparams = True

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
    mark = r"@api.mark(module='%s')" % (api_url_name)
    http_head = f'@api.http.{retype}(path="/api{uri}")'
    if haveheaderparams:
        if havebodyparams:
            if haveurlparams:  # path和body和query都有,很少
                func_name = f'def api_iaas_{funcname}(self, params=None,data=None,other_params=None):'
                func_name_simple = f'api_iaas_{funcname}'
                returnstr = f'return dict(params=params,json=data,other_params=other_params)'
            else:  # query和body都有，很少
                func_name = f'def api_iaas_{funcname}(self,params=None, data=None):'
                func_name_simple = f'api_iaas_{funcname}'
                returnstr = f'return dict(params=params,json=data)'
        else:
            if haveurlparams:  # query和path都有的时候
                func_name = f'def api_iaas_{funcname}(self, data=None,other_params=None):'
                func_name_simple = f'api_iaas_{funcname}'
                returnstr = f'return dict(params=data,other_params=other_params)'
            else:  # 仅query有
                func_name = f'def api_iaas_{funcname}(self, data=None):'
                func_name_simple = f'api_iaas_{funcname}'
                returnstr = f'return dict(params=data)'
    else:
        if havebodyparams:  # body和path都有
            if haveurlparams:
                func_name = f'def api_iaas_{funcname}(self, data=None,other_params=None):'
                func_name_simple = f'api_iaas_{funcname}'
                returnstr = f'return dict(json=data,other_params=other_params)'
            else:  # 仅body有
                func_name = f'def api_iaas_{funcname}(self, data=None):'
                func_name_simple = f'api_iaas_{funcname}'
                returnstr = f'return dict(json=data)'
        else:
            if haveurlparams:  # 仅path都有
                func_name = f'def api_iaas_{funcname}(self, data=None,other_params=None):'
                func_name_simple = f'api_iaas_{funcname}'
                returnstr = f'return dict(params=data,other_params=other_params)'
            else:  # 没有参数
                func_name = f'def api_iaas_{funcname}(self, data=None):'
                func_name_simple = f'api_iaas_{funcname}'
                returnstr = f'return dict(params=data)'
    
    business_code = ''
    business_code += "\t" + mark + '\n'
    business_code += "\t" + http_head + '\n'
    business_code += "\t" + func_name + '\n'
    business_code += "\t\t'''" + "\n" + "\t\t@功能说明: " + instruction + "\n" + "\t\t'''\n"
    business_code += "\t\t" + returnstr + '\n'
    if printstatus:
        print(business_code)

    return business_code


# 生成common部分代码，f.writestatus为true会输出common后的代码
def generate_common_function_code(rawapiinfo, printstatus=True):
    funcname, apiinfo = '', ''
    for k, v in rawapiinfo.items():
        funcname, apiinfo = k, v
    businessfunc_name = "api_iaas_" + funcname
    row_data = apiinfo.split("++")
    path_params, query_params, body_params = [], [], []
    # 获取第3列，判断是否有path参数
    if row_data[2]:
        if row_data[7]:
            path_params = [x.split('/')[0] for x in row_data[7].split(',') if x != '']

    # 获取第4列，判断是否有query参数
    if row_data[3]:
        if row_data[8]:
            query_params = [x.split('/')[0] for x in row_data[8].split(',') if x != '']

    # 获取第5列，判断是否有body传参
    if row_data[4]:
        if row_data[9]:
            body_params = [x for x in row_data[9].split(',') if x != '']

    query_str, path_str, total_params, body_str, func_str, resp_str = '','','','','',''

    if query_params:
        query_str = 'req_data_query={**kwargs}'

    if path_params:
        rs_tmp1 = ''
        for p1 in path_params:
            rs_tmp1 += '"' + str(p1) + '": ' + str(p1) + ', '
            total_params += p1 + ', '
        path_str = 'req_data_path={%s}' % rs_tmp1

    if body_params:
        body_str = 'req_data_body={**kwargs}'

    if path_params:
        if query_params or body_params:
            func_str = f'def func_{businessfunc_name}(self,%s,http_code=HTTP_STATUS_CODE_200,**kwargs):' % ", ".join(path_params)
        else:
            func_str = f'def func_{businessfunc_name}(self,%s,http_code=HTTP_STATUS_CODE_200):'  % ", ".join(total_params) 
    else:
        if query_params or body_params:
            func_str = f'def func_{businessfunc_name}(self,http_code=HTTP_STATUS_CODE_200,**kwargs):'
        else:
            func_str = f'def func_{businessfunc_name}(self,http_code=HTTP_STATUS_CODE_200):'

    common_code = ''
    resp_str = r'resp = self.resp_check.com_check_resp_http_code(response=_resp, http_code=http_code)'
    return_str = r'return resp'

    if query_str:
        if path_str:
            common_code += "\t" + func_str + "\n"
            common_code += "\t" + "\t" + path_str + "\n"
            common_code += "\t" + "\t" + query_str + "\n"
            common_code += "\t" + "\t" + f'_resp=self.{common_apiname}.{businessfunc_name}(%s,%s)' % (
                "data=req_data_query", "other_params=req_data_path") + "\n"
            common_code += "\t" + "\t" + resp_str + "\n"
            common_code += "\t" + "\t" + return_str + "\n"
        else:
            common_code += "\t" + func_str + "\n"
            common_code += "\t" + "\t" + query_str + "\n"
            common_code += "\t" + "\t" + f'_resp=self.{common_apiname}.{businessfunc_name}(%s)' % (
                "data=req_data_query") + "\n"
            common_code += "\t" + "\t" + resp_str + "\n"
            common_code += "\t" + "\t" + return_str + "\n"
    else:
        if body_str:
            if path_str:
                common_code += "\t" + func_str + "\n"
                common_code += "\t" + "\t" + path_str + "\n"
                common_code += "\t" + "\t" + body_str + "\n"
                common_code += "\t" + "\t" + f'_resp=self.{common_apiname}.{businessfunc_name}(%s,%s)' % (
                    "data=req_data_body", "other_params=req_data_path") + "\n"
                common_code += "\t" + "\t" + resp_str + "\n"
                common_code += "\t" + "\t" + return_str + "\n"
            else:
                common_code += "\t" + func_str + "\n"
                common_code += "\t" + "\t" + body_str + "\n"
                common_code += "\t" + "\t" + f'_resp=self.{common_apiname}.{businessfunc_name}(%s)' % (
                    "data=req_data_body") + "\n"
                common_code += "\t" + "\t" + resp_str + "\n"
                common_code += "\t" + "\t" + return_str + "\n"
        else:
            if path_str:
                common_code += "\t" + func_str + "\n"
                common_code += "\t" + "\t" + path_str + "\n"
                common_code += "\t" + "\t" + f'_resp=self.{common_apiname}.{businessfunc_name}(%s)' % (
                        "other_params=req_data_path") + "\n"
                common_code += "\t" + "\t" + resp_str + "\n"
                common_code += "\t" + "\t" + return_str + "\n"
            else:
                common_code += "\t" + func_str + "\n"
                common_code += "\t" + "\t" + f'_resp=self.{common_apiname}.{businessfunc_name}(%s)' % (
                    "data={}") + "\n"
                common_code += "\t" + "\t" + resp_str + "\n"
                common_code += "\t" + "\t" + return_str + "\n"
    if printstatus:
        print(common_code)
    return common_code


##生成testcases通用部分代码
def generate_testcase_code(rawapiinfo, printstatus=True):
    funcname = get_funcname(rawapiinfo)
    businessfunc_name = "api_iaas_" + funcname

    instruct = get_instruct(rawapiinfo)
    params_list = get_params(rawapiinfo)
    def_params = gen_params_in_def(params_list)
    resp_data_body = gen_params_in_to_common(params_list)
    respkey = gen_respkey(rawapiinfo)
    method_path = api_method_path(rawapiinfo)


    at1 = f'@pytest.mark.parametrize("doc,%s httpcode", ['
    at1over = '])'
    at2 = '@pytest.mark.atest'
    funcname = f'def test_check_{businessfunc_name}(self,doc,%s httpcode):'
    resp_data_str = f'resp_data=self.{testcases_apiname}.func_{businessfunc_name}(%s http_code=httpcode)'

    testcase_code = ''

    testcase_code += '\t' + at1 % (def_params) + "\n"
    testcase_code,body_params_json = generate_usecases(testcase_code, params_list, instruct, method_path)
    testcase_code =str(testcase_code) + '\t' + at1over + "\n"
    testcase_code += '\t' + at2  + "\n"
    testcase_code += '\t' + funcname % (def_params) + "\n"
    testcase_code += '\t\t' + resp_data_str % (resp_data_body) + "\n"
    if respkey:
        testcase_code += '\t\t' + "if httpcode == HTTP_STATUS_CODE_200:" + "\n"
        testcase_code += '\t\t\t' + "if resp_data:" + "\n"
        testcase_code += '\t\t\t\t' + "respkeys=[%s]" % str(respkey) + "\n"
        testcase_code += '\t\t\t\t' + "rb = self.check_resp_params(respkeys, list(resp_data.keys()))" + "\n"
        testcase_code += '\t\t\t\t' + "if isinstance(rb, str) and rb.startswith('sad'):" + "\n"
        testcase_code += '\t\t\t\t\t' + 'assert rb == [], "错误信息为：{}".format(rb)' + "\n"
        testcase_code += '\t\t\t\t' + "else:" + "\n"
        testcase_code += '\t\t\t\t\t' + 'assert rb == [], "实际响应参数少了{}".format(rb)' + "\n"
    testcase_code += "\n"
    if printstatus: 
        print(testcase_code)
    return testcase_code, body_params_json

def supply_params_value(param_type,type="normal"):
    if type == "normal":
        if param_type.lower() == 'string' or param_type.lower() == 'str':
            return 'xx'
        if param_type.lower() == 'int' or param_type.lower() == 'float' or param_type.lower() == 'double' or param_type.lower() == 'integer':
            return 1
        if param_type.lower() == 'boolean' or param_type.lower() == 'bool':
            return True
        else:
            return 'skip'
    if type == "unnormal":
        if param_type.lower() == 'string' or param_type.lower() == 'str':
            return 111
        if param_type.lower() == 'int' or param_type.lower() == 'float' or param_type.lower() == 'double' or param_type.lower() == 'integer':
            return 'xx'
        if param_type.lower() == 'boolean' or param_type.lower() == 'bool':
            return 'xx'
        else:
            return 'skip'
    if type == "wrongrange":
        if param_type.lower() == 'string' or param_type.lower() == 'str':
            return 'skip'
        if param_type.lower() == 'int' or param_type.lower() == 'float' or param_type.lower() == 'double' or param_type.lower() == 'integer':
            return -11
        if param_type.lower() == 'boolean' or param_type.lower() == 'bool':
            return True
        else:
            return 'skip'

def generate_usecases(testcase_code, params_list, instruct, method_path):
    body_params_json = {f"{method_path}":{}}
    instruct= f"接口用途: {instruct},"
    all_param = [para.replace('.', '_') if isinstance(para, str) and '.' in para else para for para in params_list]
    all_param_without_type = [para.split("/")[0] for para in all_param]
    len_param = len(all_param)
    index=1
    if len_param == 0:
        testcase_code += "\t\t('%s',%s)" % (f"{instruct}, 无参数" , 'HTTP_STATUS_CODE_200') + ',\n'
        return testcase_code, body_params_json
    case = '所有参数值都正常的场景'
    case_key = {"all_value_correct":[]}
    for param in all_param:
        geshi = {"apiname":param.split('/')[0],"type":param.split('/')[1],"value":supply_params_value(param.split('/')[1])}
        case_key["all_value_correct"].append(geshi)
    testcase_code += "\t\t('%s',%s,%s)" % (
        instruct + case + '-' + str(index), ','.join([f"para.get('{method_path}', 'all_value_correct', '{item}')" for item in all_param_without_type]), 'HTTP_STATUS_CODE_200') + ',\n'
    body_params_json[method_path].update(case_key)

    case1 = '存在参数值: %s 不存在的场景'
    case1_key = "exist_nexist_value"
    for key_para in all_param_without_type:
        tmp_case_key = {f"{key_para}_{case1_key}":[]}
        for param in all_param:
            if key_para in param:
                geshi = {"apiname":param.split('/')[0],"type":param.split('/')[1],"value":"nexist_value"}
            else:    
                geshi = {"apiname":param.split('/')[0],"type":param.split('/')[1],"value":supply_params_value(param.split('/')[1])}
            tmp_case_key[f"{key_para}_{case1_key}"].append(geshi)
        body_params_json[method_path].update(tmp_case_key)
        index += 1
        testcase_code += "\t\t('%s',%s,%s)" % (
            instruct + case1 % (key_para) + '-' + str(index), ','.join([f"para.get('{method_path}', f'{key_para}_{case1_key}', '{item}')" for item in all_param_without_type]), 'HTTP_STATUS_CODE_400') + ',\n'

    case2 = '存在值: %s 为空的场景'
    case2_key = "exist_empty_value"
    for key_para in all_param_without_type:
        tmp_case_key = {f"{key_para}_{case2_key}":[]}
        for param in all_param:
            if key_para in param:
                geshi = {"apiname":param.split('/')[0],"type":param.split('/')[1],"value":""}
            else:    
                geshi = {"apiname":param.split('/')[0],"type":param.split('/')[1],"value":supply_params_value(param.split('/')[1])}
            tmp_case_key[f"{key_para}_{case2_key}"].append(geshi)
        body_params_json[method_path].update(tmp_case_key)
        index += 1
        testcase_code += "\t\t('%s',%s,%s)" % (
            instruct + case2 % (key_para) + '-' + str(index), ','.join([f"para.get('{method_path}', f'{key_para}_{case2_key}', '{item}')" for item in all_param_without_type]), 'HTTP_STATUS_CODE_400') + ',\n'

    case3 = '存在值: %s 不传为None的场景'
    case3_key = "exist_none_value"
    for key_para in all_param_without_type:
        tmp_case_key = {f"{key_para}_{case3_key}":[]}
        for param in all_param:
            if key_para in param:
                geshi = {"apiname":param.split('/')[0],"type":param.split('/')[1],"value":None}
            else:    
                geshi = {"apiname":param.split('/')[0],"type":param.split('/')[1],"value":supply_params_value(param.split('/')[1])}
            tmp_case_key[f"{key_para}_{case3_key}"].append(geshi)
        body_params_json[method_path].update(tmp_case_key)
        index += 1
        testcase_code += "\t\t('%s',%s,%s)" % (
            instruct + case3 % (key_para) + '-' + str(index), ','.join([f"para.get('{method_path}', f'{key_para}_{case3_key}', '{item}')" for item in all_param_without_type]), 'HTTP_STATUS_CODE_400') + ',\n'

    case4 = '存在值: %s 类型错误的场景'
    case4_key = "exist_errortype_value"
    for key_para in all_param_without_type:
        tmp_case_key = {f"{key_para}_{case4_key}":[]}
        for param in all_param:
            if key_para in param:
                geshi = {"apiname":param.split('/')[0],"type":param.split('/')[1],"value":supply_params_value(param.split('/')[1],type="unnormal")}
            else:    
                geshi = {"apiname":param.split('/')[0],"type":param.split('/')[1],"value":supply_params_value(param.split('/')[1])}
            tmp_case_key[f"{key_para}_{case4_key}"].append(geshi)
        body_params_json[method_path].update(tmp_case_key)
        index += 1
        testcase_code += "\t\t('%s',%s,%s)" % (
            instruct + case4 % (key_para) + '-' + str(index), ','.join([f"para.get('{method_path}', f'{key_para}_{case4_key}', '{item}')" for item in all_param_without_type]), 'HTTP_STATUS_CODE_400') + ',\n'

    case5 = '存在值: %s 范围异常的场景'
    case5_key = "exist_wrongrange_value"
    for key_para in all_param_without_type:
        tmp_case_key = {f"{key_para}_{case5_key}":[]}
        for param in all_param:
            if key_para in param:
                geshi = {"apiname":param.split('/')[0],"type":param.split('/')[1],"value":supply_params_value(param.split('/')[1],type="wrongrange")}
            else:    
                geshi = {"apiname":param.split('/')[0],"type":param.split('/')[1],"value":supply_params_value(param.split('/')[1])}
            tmp_case_key[f"{key_para}_{case5_key}"].append(geshi)
        body_params_json[method_path].update(tmp_case_key)
        index += 1
        testcase_code += "\t\t('%s',%s,%s)" % (
            instruct + case5 % (key_para) + '-' + str(index), ','.join([f"para.get('{method_path}', f'{key_para}_{case5_key}', '{item}')" for item in all_param_without_type]), 'HTTP_STATUS_CODE_400') + ',\n'

    return testcase_code,body_params_json


def get_instruct(apiinfo={}):
    apilist = list(apiinfo.values())[0].split('++')
    return apilist[6]

def get_funcname(apiinfo={}):
    funcname = ''
    for k, _ in apiinfo.items():
        funcname = k
    return funcname

def api_method_path(apiinfo={}):
    apilist = list(apiinfo.values())[0].split('++')
    return f"{apilist[0].lower()}_{apilist[1]}"

def get_params(apiinfo={}):
    params_list = []
    apilist = list(apiinfo.values())[0].split('++')
    if apilist[7]:
        params_list += apilist[7].split(',')
    if apilist[8]:
        params_list += apilist[8].split(',')
    if apilist[9]:
        params_list += apilist[9].split(',')
    return params_list

def gen_params_in_def(params_list):
    newparams = ''
    if params_list:
        for param in params_list:
            if '.' in param:
                param = param.split('/')[0].replace('.', '_')
            else:
                param = param.split('/')[0]
            newparams += param + ', '
    return newparams

def gen_params_in_to_common(params_list):
    outkey = {}
    pure_params = []
    if params_list:
        for param in params_list:
            if '.' in param:
                param2 = param.split('/')[0].replace('.', '_')
                if outkey.get(param.split('/')[0].split('.')[0]):
                    outkey[param.split('/')[0].split('.')[0]].append(param2)
                else:
                    outkey[param.split('/')[0].split('.')[0]] = [param2]
            else:
                pure_params.append(param.split('/')[0])
    # 构造请求body
    request_body = ''
    if pure_params:
        for param in pure_params:
            request_body += f'{param}={param},'
    if outkey:
        keys = list(outkey.keys())
        for key in keys:
            if len(outkey[key]) > 0:
                key_params = '{'
                for index,param in enumerate(outkey[key]):
                    if index == len(outkey[key]) - 1:
                        key_params += f'"{param.split("_")[-1]}":{param}'
                    else:
                        key_params += f'"{param.split("_")[-1]}":{param},'
                key_params += '}'
                request_body += f'{key}={key_params},'

    return request_body

def gen_respkey(apiinfo={}):
    apilist = list(apiinfo.values())[0].split('++')
    if apilist[12]:
        resp = json.loads(apilist[12])
        respkeys = ','.join([f"'{key}'" for key in list(resp.keys())])
        return respkeys
    return ''
    
def generate_code(apiinfo={}):

    print_mark = False
    business_codes = generate_business_code(rawapiinfo=apiinfo, printstatus=print_mark)
    common_codes = generate_common_function_code(rawapiinfo=apiinfo, printstatus=print_mark)
    testcase_codes, body_params = generate_testcase_code(rawapiinfo=apiinfo, printstatus=print_mark)
    # print("1. Bussiness code")
    # print(business_codes)
    # print("2. Common code")
    # print(common_codes)
    # print("3. Testcase code")
    # print(testcase_codes)
    return business_codes, common_codes, testcase_codes, body_params


if __name__ == '__main__':
    rm_exist_file()
    apiinfo={'post_v1_user_sync': '''post++/v1/user/sync++++++1++post_v1_user_sync++Create User Syncer++++++object/string,syncer.id/string,syncer.awsAk/string,syncer.awsSk/string,syncer.bucket/string,syncer.backend/string,syncer.awsRegion/string,syncer.dropboxToken/string,syncer.azureAccountKey/string,syncer.backblazeAppKey/string,syncer.azureAccountName/string,syncer.backblazeAppKeyId/string,syncer.googleAccountJson/string,SyncMode/string,SyncPath/string,instanceId/string++post_v1_user_sync++++{"jobId": 
""}'''}
    business_code, func_code, testcase_code, body_params = generate_code(apiinfo)
