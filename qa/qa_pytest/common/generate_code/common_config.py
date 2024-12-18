import os


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
apidir = os.path.join(cur_project_path, 'business','auto')  # 生成的api 相应business存放目录
funcdir = os.path.join(cur_project_path,'common','auto')  # 生成的func common文件存放目录
casesdir =os.path.join(cur_project_path, 'testcases','test_auto_cases')  # 生成的testcases存放目录

api_file_path = os.path.join(apidir, apifilename + '.py')
func_file_path = os.path.join(funcdir, funcfilename + '.py')
case_file_path = os.path.join(casesdir, testcasefilename + '.py')

bussiness_code_header='''
from ppioBaseCore import api
class BussinessClassName(object):
'''

common_code_header='''
from business.auto.BusinessFileName import BussinessClassName
from common.ResponseAction import ResponseAction
from variables.http_status_code import *
from common.StringHandle import StringHandle
from ppioBaseCore.session.SessionManager import SessionManager
from common.TimeAction import TimeAction
from common.ReadConfigData import ReadConfigData
run_env = ReadConfigData().get_cfg_run_env

class CommonClassName(object):
	def __init__(self):
		self.resp_check = ResponseAction()
		self.str = StringHandle()
		self.time = TimeAction()
		self.session = SessionManager()
		self.CuseBusiness = BussinessClassName()
'''

testcases_code_header='''
import random
import time
import pytest
import allure
from common.StringHandle import StringHandle
from common.TimeAction import TimeAction
from variables.http_status_code import *
from common.ReadConfigData import ReadConfigData
run_env = ReadConfigData().get_cfg_run_env
from common.auto.CommonFileName import CommonClassName
from utils.get_params import para
@allure.parent_suite("test")
class Test_Testcases_ClassName(object):
	def setup_class(self):
		self.str = StringHandle()
		self.time = TimeAction()
		self.Tusecommon = CommonClassName()
	def teardown_class(self):
		pass
	def check_resp_params(self, expert_keys, actual_resp):
		a = len(expert_keys)
		b = len(actual_resp.keys())
		if a > b:
			return 'sad,期望返回的参数比实际返回的参数多了{}个参数,分别是{}'.format(a - b,expert_keys - actual_resp.keys())
		if b > a:
			return 'sad,期望返回的参数比实际返回的参数少了了{}个参数,分别是{}'.format(b - a,actual_resp.keys() - expert_keys)
		if isinstance(actual_resp, dict):
			for k in actual_resp.keys():
				if k in expert_keys:
					expert_keys.remove(k)
			return expert_keys
		else:
			return 'sad,期望返回的参数类型不是dict,实际返回的参数类型是{}'.format(type(actual_resp))
'''

def rm_exist_file():
    if os.path.exists(api_file_path):
        os.remove(api_file_path)
    if os.path.exists(func_file_path):
        os.remove(func_file_path)
    if os.path.exists(case_file_path):
        os.remove(case_file_path)


def get_bussiness_code_header():
    return bussiness_code_header

def get_common_code_header():
    return common_code_header

def get_testcases_code_header():
    return testcases_code_header
