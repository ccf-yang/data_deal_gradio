import ipaddress
from datetime import datetime
import re

# 判断是否是ip地址
def ip_validator(value):
    try:
        ipaddress.ip_address(value)
        return True
    except ValueError:
        return False


# 判断是否是日期字符串，支持 2018-04-11 或 2018-04-11 14:55:30
def date_validator(value: str) -> bool:
    value = value.strip()
    try:
        if len(value) == 10:
            datetime.strptime(value, '%Y-%m-%d')
            return True
        elif len(value) == 19:
            datetime.strptime(value, '%Y-%m-%d %H:%M:%S')
            return True
    except ValueError:
        pass
    return False


# 判断密码是否合法
def verify_password(password):
    if len(password) < 8:
        return False
    if not all(map(lambda x: re.findall(x, password), ['[0-9]', '[a-z]', '[A-Z]'])):
        return False
    return True

# 获取请求IP
def get_request_real_ip(headers: dict):
    x_real_ip = headers.get('x-forwarded-for')
    if not x_real_ip:
        x_real_ip = headers.get('x-real-ip', '')
    return x_real_ip.split(',')[0]

