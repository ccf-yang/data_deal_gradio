from django.core.cache import cache
from django.conf import settings
from django.views.generic import View
from .models import User, History
from utils import (
    JsonParser, 
    Argument, 
    human_datetime, 
    json_response,
    verify_password,
    get_request_real_ip
)
from functools import partial
import time
import uuid
import json


class UserView(View):
    def get(self, request):
        users = []
        for u in User.objects.filter(deleted_at__isnull=True):
            tmp = u.to_dict(excludes=('access_token', 'password_hash'))  # queryset to dict, Model里面实现的
            tmp['password'] = '******'
            users.append(tmp)
        return json_response(users)  # Response(json.dumps(users))

    def post(self, request):
        form, error = JsonParser(
            Argument('username', help='请输入登录名'),
            Argument('password', help='请输入密码'),
            Argument('nickname', help='请输入昵称'),
        ).parse(request.body)
        if error is None:
            password = form.pop('password')
            if User.objects.filter(username=form.username, deleted_at__isnull=True).first():
                return json_response(error=f'已存在登录名为【{form.username}】的用户')
            if not verify_password(password):
                return json_response(error='请设置至少8位包含数字、小写和大写字母的新密码')
            user = User.objects.create(
                **form,
                password_hash=User.make_password(password),
            )
            return json_response({"message": "创建用户成功"})
        return json_response(error=error)

    def patch(self, request):
            form, error = JsonParser(
                Argument('id', type=int, help='参数错误'),
                Argument('password', required=False),
                Argument('is_active', type=bool, required=False),
            ).parse(request.body)
            if error is None:
                user = User.objects.get(pk=form.id)
                if form.password:
                    if not verify_password(form.password):
                        return json_response(error='请设置至少8位包含数字、小写和大写字母的新密码')
                    user.token_expired = 0
                    user.password_hash = User.make_password(form.pop('password'))
                if form.is_active is not None:
                    user.is_active = form.is_active
                    cache.delete(user.username)
                user.save()
            return json_response(error=error)

    def delete(self, request):
        form, error = JsonParser(
            Argument('id', type=int, help='请指定操作对象')
        ).parse(request.GET)
        if error is None:
            user = User.objects.filter(pk=form.id).first()
            if user:
                if user.id == request.user.id:
                    return json_response(error='无法删除当前登录账户')
                user.is_active = True
                user.deleted_at = human_datetime()
                user.save()
        return json_response(error=error)


def login(request):
    # 解析请求体中的参数
    form, error = JsonParser(
        Argument('username', help='请输入用户名'),
        Argument('password', help='请输入密码'),
        Argument('type', required=False)
    ).parse(request.body)
    
    if error is None:
        # 创建处理登录记录的偏函数，将登录请求调用记录函数，记录到数据库
        # partial返回的是一个新的函数对象，它将原函数的部分参数固定下来，形成一个新的函数。
        # 在这里，handle_response 是一个新的函数，它已经预先绑定了 handle_login_record 的前三个参数：
        # request, form.username, 和 form.type
        # 
        # 这样做的好处是：
        # 1. 简化代码：后续调用 handle_response 时，只需要传入 error 参数（如果有的话）
        # 2. 保持一致性：确保每次调用都使用相同的 request, username 和 type
        # 3. 提高可读性：将通用的参数提前设置，使得代码更加清晰

        # 使用示例：
        # 原来可能需要这样调用：
        # handle_login_record(request, form.username, form.type, error="Some error")

        # 现在可以简化为：
        # handle_response(error="Some error")

        # 这样的设计使得错误处理更加统一和简洁
        
        handle_response = partial(handle_login_record, request, form.username, form.type)
        
        # 查找用户
        user = User.objects.filter(username=form.username, type=form.type).first()
        
        # 检查用户是否被禁用
        if user and not user.is_active:
            return handle_response(error="账户已被系统禁用")

        if user and user.deleted_at is None:
            if user.verify_password(form.password):
                return handle_user_info(handle_response, request, user)

        # 处理登录失败
        value = cache.get_or_set(form.username, 0, 86400)
        if value >= 3:
            # 禁用账户
            if user and user.is_active:
                user.is_active = False
                user.save()
            return handle_response(error='账户已被系统禁用')
        
        # 增加失败次数
        cache.set(form.username, value + 1, 86400)
        return handle_response(error="用户名或密码错误，连续多次错误账户将会被禁用")
    
    # 返回解析错误
    return json_response(error=error)


def handle_login_record(request, username, login_type, error=None):
    x_real_ip = get_request_real_ip(request.headers)
    user_agent = request.headers.get('User-Agent')
    History.objects.create(
        username=username,
        type=login_type,
        ip=x_real_ip,
        agent=user_agent,
        is_success=False if error else True,
        message=error
    )
    if error:
        return json_response(error=error)


def handle_user_info(handle_response, request, user):
    cache.delete(user.username)
    handle_response()
    x_real_ip = get_request_real_ip(request.headers)
    token_isvalid = user.access_token and len(user.access_token) == 32 and user.token_expired >= time.time()
    user.access_token = user.access_token if token_isvalid else uuid.uuid4().hex
    user.token_expired = time.time() + settings.TOKEN_TTL
    user.last_login = human_datetime()
    user.last_ip = x_real_ip
    user.save()
    return json_response({
        'id': user.id,
        'access_token': user.access_token,
        'nickname': user.nickname,
        'is_supper': user.is_supper,
        'has_real_ip': True,
        'permissions': []
    })


def logout(request):
    # 让token失效的方法
    request.user.access_token = ''  # 清空access_token
    request.user.token_expired = 0  # 将token过期时间设为0
    request.user.save()  # 保存用户对象的更改
    return json_response({'message': '登出成功'})
