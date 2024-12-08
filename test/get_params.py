import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(BASE_DIR, 'params.json')
params = json.load(open(json_path, 'r'))

class ParamsAccessor:
    def __init__(self, data):
        self.data = data[0] if isinstance(data, list) else data
    
    def get_value(self, endpoint, test_case, param_name):
        try:
            # 获取指定测试用例下的参数列表
            params_list = self.data[endpoint][test_case]
            # 在参数列表中查找指定的参数
            for param in params_list:
                if param["apiname"] == param_name:
                    return param["value"]
            return None
        except (KeyError, TypeError):
            return None

para = ParamsAccessor(params)

if __name__ == "__main__":
    # 参数剥离出来，更新和展示，就更新和展示这个json，code里面生成的时候，就写死这样的调用
    
    
    # 测试用例
    print("=== 正确值测试 ===")
    print(f"Name: {para.get_value('get_/api/register', 'all_value_correct', 'name')}")
    print(f"Email: {para.get_value('get_/api/register', 'all_value_correct', 'email')}")
    print(f"Password: {para.get_value('get_/api/register', 'all_value_correct', 'password')}")
    
    print("\n=== 错误值测试 ===")
    print(f"Name Error Value: {para.get_value('get_/api/register', 'name_error', 'name')}")
    print(f"Email Error Value: {para.get_value('get_/api/register', 'email_error', 'email')}")
    print(f"Password Error Value: {para.get_value('get_/api/register', 'password_error', 'password')}")