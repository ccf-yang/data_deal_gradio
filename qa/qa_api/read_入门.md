代码查看顺序：
    qa_api/
    ├── manage.py          # 1. 先看项目入口
    ├── qa/
    │   ├── settings.py    # 2. 了解项目配置
    │   └── urls.py        # 3. 了解URL总路由
    └── apps/
        └── account/       # 4. 进入具体应用
            ├── urls.py    # 5. 应用路由
            ├── models.py  # 6. 数据模型
            ├── views.py   # 7. 业务逻辑
            └── utils.py   # 8. 工具函数

    请求处理流程
    URL请求 → urls.py → 中间件 → 视图处理 → 数据库操作 → 响应

    配置文件加载
        settings.py   # 项目全局配置
            ↓
        urls.py       # 全局URL路由配置
            ↓
        应用的urls.py  # 应用级URL路由

    按优先级排序：
        models.py - 数据结构设计
        urls.py - 路由配置
        views.py - 业务逻辑
        utils.py - 工具函数
        中间件文件 - 请求处理
--------------------------------------------------------------------------------

首先理解Django项目的基本结构：
    manage.py  # Django项目的命令行工具，是项目的入口点
        这个文件是所有Django项目都会有的，用于：
            启动开发服务器：python manage.py runserver
            数据库迁移：python manage.py migrate
            创建超级用户：python manage.py createsuperuser

了解 Django MTV(Model-Template-View) 架构：
    M(Model): models.py - 数据模型
    T(Template): 前端模板（这个项目似乎是前后端分离，所以没看到模板）
    V(View): views.py - 处理业务逻辑

先从最简单的 models.py 开始看：
    # 最基础的模型示例
    class History(models.Model):
        username = models.CharField(max_length=100, null=True)
        ip = models.CharField(max_length=50)
        is_success = models.BooleanField(default=True)
        created_at = models.CharField(max_length=20, default=human_datetime)
    class Meta:
        db_table = 'login_histories'  # 指定表名
        ordering = ('-id',)  # 排序方式
这个模型很容易理解：
    记录用户登录历史
    包含用户名、IP、是否登录成功等信息
    Django会自动将这个类转换为数据库表


然后看 urls.py：
    urlpatterns = [
        url(r'^login/$', login),  # 处理登录请求
        url(r'^user/$', UserView.as_view()),  # 用户管理
        url(r'^role/$', RoleView.as_view()),  # 角色管理
    ]
    这是Django的URL路由配置：
        当访问 /login/ 时，调用 login 函数
        当访问 /user/ 时，调用 UserView 类的对应方法
        使用正则表达式匹配URL

接着看基础的视图 views.py：
# 最基础的视图示例
    class SelfView(View):
        def get(self, request):  # 处理GET请求
            data = request.user.to_dict(selects=('nickname', 'wx_token'))
            return json_response(data)

        def patch(self, request):  # 处理PATCH请求
            form, error = JsonParser(
                Argument('nickname', required=False, help='请输入昵称'),
            ).parse(request.body)
            if error is None:
                request.user.nickname = form.nickname
                request.user.save()
            return json_response(error=error)
    基本视图逻辑：
        不同的HTTP方法对应不同的处理函数
        GET 用于获取数据
        PATCH 用于更新数据
        返回JSON格式的响应
学习建议：
    a. 先掌握基础概念：
        Django的请求处理流程
        ORM（对象关系映射）基础
        类视图的使用
    b. 从简单的功能开始看：
        History模型和HistoryView - 最简单的模型和视图
        SelfView - 基础的用户信息管理
        逐步深入到更复杂的UserView和RoleView
    c. 重点关注：
        # 基础的数据模型定义
        class User(models.Model):
            username = models.CharField(max_length=100)
            password_hash = models.CharField(max_length=100)
        # 基础的视图处理
        class HistoryView(AdminView):
            def get(self, request):
                histories = History.objects.all()
                return json_response(histories)


----------------------------------------------------
Django框架，项目结构如下：

qa_api: 项目根目录
apps: 应用目录，包含多个应用
account: 账户应用
alarm: 报警应用
libs: 公共库目录，包含一些公共函数和类
manage.py: 项目管理脚本
settings.py: 项目设置文件
urls.py: 项目URL配置文件

账户应用（account）

    账户应用包含以下文件：
        models.py: 定义账户模型（User、Role、History）
        views.py: 定义账户视图（UserView、RoleView、SelfView）
        urls.py: 定义账户URL配置
        utils.py: 定义一些账户相关的公共函数（get_host_perms、has_host_perm、verify_password）
    账户模型（models.py）
        账户模型定义了三个模型：User、Role、History。
        User模型：定义了用户的基本信息（username、nickname、password_hash等）和一些方法（make_password、verify_password等）
        Role模型：定义了角色信息（name、desc等）和一些方法（add_deploy_perm等）
        History模型：定义了历史记录信息（username、type、ip等）
    账户视图（views.py）
        账户视图定义了三个视图：UserView、RoleView、SelfView。
        UserView：处理用户相关的请求（获取用户列表、创建用户、更新用户等）
        RoleView：处理角色相关的请求（获取角色列表、创建角色、更新角色等）
        SelfView：处理当前用户相关的请求（获取当前用户信息、更新当前用户信息等）
    账户URL配置（urls.py）
        账户URL配置定义了账户应用的URL路由。    
        /login/: 登录视图
        /logout/: 注销视图
        /user/: 用户视图
        /role/: 角色视图
        /self/: 当前用户视图
    公共库（libs）
        公共库包含了一些公共函数和类。
        ModelMixin: 定义了模型的公共方法（to_dict等）
        JsonParser: 定义了JSON解析器
        Argument: 定义了参数解析器
        human_datetime: 定义了人类可读的日期时间函数
    项目管理脚本（manage.py）
        项目管理脚本定义了项目的管理命令。
        set: 设置命令
        update: 更新命令
        updatedb: 更新数据库命令
        user: 用户命令
        这些命令可以通过python manage.py <command>执行。
    项目设置文件（settings.py）
        项目设置文件定义了项目的设置。
        INSTALLED_APPS: 安装的应用列表
        DATABASES: 数据库配置
        TOKEN_TTL: Token过期时间
        这些设置可以通过django.conf.settings访问。
    这个项目的代码逻辑如下：
        用户请求登录或注册，账户应用处理请求并验证用户信息。
        如果用户信息验证通过，账户应用创建或更新用户模型并返回Token。
        用户使用Token访问其他应用的视图，其他应用验证Token并处理请求。
        如果Token过期或无效，用户需要重新登录或注册。

----------------------------------------------------
1. 项目启动加载顺序
    1.1 入口文件 manage.py
        # manage.py
        import os
        import sys

        def main():
            # 1. 首先设置Django配置文件路径
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qa.settings')
            
            # 2. 加载Django核心功能
            from django.core.management import execute_from_command_line
            
            # 3. 执行Django命令
            execute_from_command_line(sys.argv)
    1.2 配置文件加载
        settings.py   # 项目全局配置
            ↓
        urls.py       # 全局URL路由配置
            ↓
        应用的urls.py  # 应用级URL路由
2. 代码阅读顺序建议
    第一步：项目结构
    qa_api/
    ├── manage.py          # 1. 先看项目入口
    ├── qa/
    │   ├── settings.py    # 2. 了解项目配置
    │   └── urls.py        # 3. 了解URL总路由
    └── apps/
        └── account/       # 4. 进入具体应用
            ├── urls.py    # 5. 应用路由
            ├── models.py  # 6. 数据模型
            ├── views.py   # 7. 业务逻辑
            └── utils.py   # 8. 工具函数
第二步：数据模型(models.py)
    class User(models.Model):
        username = models.CharField(max_length=100)
        password_hash = models.CharField(max_length=100)
        # ...其他字段

    class Role(models.Model):
        name = models.CharField(max_length=50)
        # ...其他字段
    理解数据结构
    了解模型关系
    查看字段定义
第三步：URL配置(urls.py)
    urlpatterns = [
        url(r'^login/$', login),
        url(r'^user/$', UserView.as_view()),
        url(r'^role/$', RoleView.as_view()),
    ]
    了解API接口
    对应视图函数
    路由规则
第四步：视图逻辑(views.py)
    class UserView(AdminView):
        def get(self, request):
            # 处理GET请求
            pass
        
        def post(self, request):
            # 处理POST请求
            pass
    业务逻辑实现
    请求处理流程
    数据处理方式
3. 关键流程追踪
3.1 请求处理流程
    URL请求 → urls.py → 中间件 → 视图处理 → 数据库操作 → 响应
3.2 用户认证流程
# 登录请求处理示例
def login(request):
    form = JsonParser(
        Argument('username'),
        Argument('password'),
    ).parse(request.body)
    user = User.objects.filter(username=form.username).first()
    if user and user.verify_password(form.password):
            return json_response(user.to_dict())
3.3 权限处理流程
    class AdminView(View):
        def dispatch(self, request, *args, **kwargs):
        # 权限检查
        if not request.user.has_perms(...):
            return json_response(error='无权限访问')
        return super().dispatch(request, *args, **kwargs)
4. 开发调试建议
4.1 使用Django Shell
    python manage.py shell
    可以交互式测试：

    模型操作
    数据查询
    功能测试
4.2 查看SQL日志
    # settings.py
    LOGGING = {
        'handlers': {
            'console': {
                'level': 'DEBUG',
                'class': 'logging.StreamHandler',
            },
        },
    }
4.3 断点调试    
    # 在关键位置添加断点
    import pdb; pdb.set_trace()
5. 重点关注文件
    按优先级排序：
    models.py - 数据结构设计
    urls.py - 路由配置
    views.py - 业务逻辑
    utils.py - 工具函数
    中间件文件 - 请求处理
