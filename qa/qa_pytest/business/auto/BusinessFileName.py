
from ppioBaseCore import api
class BussinessClassName(object):
	@api.mark(module='domain_in_env')
	@api.http.get(path="/api/v1/user/syncer")
	def api_iaas_get_v1_user_syncer(self, data=None):
		'''
		@功能说明: Create User Syncer
		'''
		return dict(params=data)
