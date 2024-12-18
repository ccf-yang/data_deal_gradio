
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
	def func_api_iaas_get_v1_user_syncer(self,http_code=HTTP_STATUS_CODE_200):
		_resp=self.CuseBusiness.api_iaas_get_v1_user_syncer(data={})
		resp = self.resp_check.com_check_resp_http_code(response=_resp, http_code=http_code)
		return resp
