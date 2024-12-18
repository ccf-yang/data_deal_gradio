
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
	@pytest.mark.parametrize("doc, httpcode", [
		('接口用途: Create User Syncer,, 无参数',HTTP_STATUS_CODE_200),
	])
	@pytest.mark.atest
	def test_check_api_iaas_get_v1_user_syncer(self,doc, httpcode):
		resp_data=self.Tusecommon.func_api_iaas_get_v1_user_syncer( http_code=httpcode)
		if httpcode == HTTP_STATUS_CODE_200:
			if resp_data:
				respkeys=['userSyncers','total']
				rb = self.check_resp_params(respkeys, list(resp_data.keys()))
				if isinstance(rb, str) and rb.startswith('sad'):
					assert rb == [], "错误信息为：{}".format(rb)
				else:
					assert rb == [], "实际响应参数少了{}".format(rb)

