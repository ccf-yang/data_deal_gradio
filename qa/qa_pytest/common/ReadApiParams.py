import json
from common.FileAction import FileAction

def get_api_params_by_key(keyname):
    api_params_path = FileAction().com_get_file_all_path("api_params.json")
    with open(api_params_path, "r") as f:
        api_params = json.load(f)
        return api_params.get(keyname,"")

def get_api_params():
    api_params_path = FileAction().com_get_file_all_path("api_params.json")
    with open(api_params_path, "r") as f:
        api_params = json.load(f)
        return api_params