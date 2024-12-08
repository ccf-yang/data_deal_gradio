import os
import sys

# 定义项目的根目录路径
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_BASE_DIR = os.path.join(BASE_DIR,'apps')
sys.path.insert(0, BASE_DIR)
sys.path.insert(1, APP_BASE_DIR)  # 使用insert而不是append，确保优先级


# 安全警告：在生产环境中保密使用的密钥！
SECRET_KEY = 'vk0do47)egwzz!uk49%(y3s(fpx4+hfdsfdsf23%323432'

# 安全警告：不要在生产环境中启用调试模式！
DEBUG = True

# 允许的主机列表
ALLOWED_HOSTS = ['*']  # 在开发环境中允许所有主机访问

# CORS和安全设置
CORS_ALLOW_ALL_ORIGINS = True  # 允许所有跨域请求
CORS_ALLOW_CREDENTIALS = True  # 允许携带认证信息
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# 安装的应用列表
INSTALLED_APPS = [
    'django.contrib.auth',  # Django认证系统
    'django.contrib.contenttypes',  # Django内容类型系统
    'django.contrib.sessions',  # 会话框架
    'django.contrib.messages',  # 消息框架
    'rest_framework',  # Django REST framework
    'corsheaders',  # CORS支持
    'apps.account',  # 账户应用
    'apps.setting',  # 设置应用
    'apps.home',  # 主页应用
    'apps.autoapi',  # 自动化测试应用
    'apps.savedapi',  # 保存的API应用
    'apps.function_task',  # 功能任务应用
    'apps.function_cases',  # 功能用例应用
    'apps.environment',  # 环境应用
]

# REST framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [],
}

# 中间件列表
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS中间件必须放在最前面
    'django.middleware.security.SecurityMiddleware',  # 安全中间件
    'django.middleware.common.CommonMiddleware',  # 通用中间件
    'apps.account.middleware.AuthenticationMiddleware',  # 认证中间件
    'apps.account.middleware.HandleExceptionMiddleware',  # 异常处理中间件
]

# 根URL配置文件
ROOT_URLCONF = 'qa.urls'

# WSGI应用对象
WSGI_APPLICATION = 'qa.wsgi.application'

# mysql数据库配置
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': os.getenv('MYSQL_DATABASE', 'qa_db'),
#         'USER': os.getenv('MYSQL_USER', 'qa_user'),
#         'PASSWORD': os.getenv('MYSQL_PASSWORD', 'qa_password'),
#         'HOST': os.getenv('MYSQL_HOST', 'mysql'),
#         'PORT': '3306',
#         'OPTIONS': {
#             'charset': 'utf8mb4',
#             'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
#         }
#     }
# }
# 调试的sqlite3数据库配置
DATABASES = {
    'default': {
        'ATOMIC_REQUESTS': True,  # 每个请求作为一个原子操作
        'ENGINE': 'django.db.backends.sqlite3',  # 数据库引擎
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),  # 数据库文件路径
    }
}

# 缓存设置
# CACHES = {
#     "default": {
#         "BACKEND": "django_redis.cache.RedisCache",
#         "LOCATION": "redis://192.168.71.161:6379/1",
#         "OPTIONS": {
#             "CLIENT_CLASS": "django_redis.client.DefaultClient",
#             "PASSWORD": "jhkdjhkjdhsIUTYURTU_8HajfJ",
#         }
#     }
# }
# local using no password redis, docker run -it --rm --name redis-local -p 6379:6379  redis:6.2-alpine           
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://localhost:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

# Redis连接超时设置
REDIS_TIMEOUT = 10
REDIS_CONNECT_TIMEOUT = 20

# 模板设置
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',  # 模板后端
        'DIRS': [],  # 模板目录
        'APP_DIRS': False,  # 应用目录
    },
]

# Token有效期
TOKEN_TTL = 8 * 3600

# 请求键
REQUEST_KEY = 'qa:request'
# 构建键
BUILD_KEY = 'qa:build'

# 目录配置
REPOS_DIR = os.path.join(os.path.dirname(os.path.dirname(BASE_DIR)), 'repos')
# 构建目录
BUILD_DIR = os.path.join(REPOS_DIR, 'build')
# 传输目录
TRANSFER_DIR = os.path.join(BASE_DIR, 'storage', 'transfer')

# 国际化配置
LANGUAGE_CODE = 'en-us'

# 时区
TIME_ZONE = 'Asia/Shanghai'

# 使用国际化
USE_I18N = True

# 使用本地化
USE_L10N = True

# 使用时区
USE_TZ = False

# 认证排除路径
AUTHENTICATION_EXCLUDES = (
    '/account/login/',  # 登录页面
)

# 版本信息
QA_VERSION = 'v0.0.1'

# 覆盖默认配置
try:
    from qa.overrides import *
except ImportError:
    pass
