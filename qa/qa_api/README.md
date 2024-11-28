# Spug API 使用指南

## 测试环境

### 1. 环境准备

1. 安装依赖：
   ```bash
   # 使用豆瓣源安装依赖（推荐）
   pip install -i https://pypi.doubanio.com/simple/ -r requirements.txt

   # 如果遇到 paramiko 相关错误，需要先卸载再安装指定版本
   pip uninstall -y paramiko
   pip install -i https://pypi.doubanio.com/simple/ paramiko==2.7.2
   ```

2. 初始化数据库：

   ```bash
   # 每个app里面要先新建一个migrations目录，然后在migrations目录下创建一个__init__.py文件
   mkdir migrations
   touch migrations/__init__.py
   ```
   ```bash
   # 创建数据库迁移文件
   python manage.py makemigrations

   # 应用数据库迁移
   python manage.py migrate
   ```

3. 创建管理员账户：
   ```bash
   # 创建超级管理员账户
   python manage.py user add -u admin -p admin123 -n 管理员 -s

   # 参数说明：
   # -u: 设置用户名
   # -p: 设置密码（必须至少8位，包含数字、小写和大写字母）
   # -n: 设置昵称
   # -s: 设置为超级管理员
   ```

3. 关于自定义命令：

   为什么 `python manage.py user add -u admin -p admin123 -n 管理员 -s` 可以新建用户？
   这是因为在项目中定义了一个自定义的Django管理命令。该命令位于 `apps/account/management/commands/user.py`，主要功能包括：

   - 支持的参数：
     - `-u`: 用户名（必填）
     - `-p`: 密码（必填）
     - `-n`: 昵称（必填）
     - `-s`: 是否设为超级用户（可选）

   - 支持的操作：
     - `user add`: 创建新用户
     - `user reset`: 重置用户密码
     - `user enable`: 启用被禁用的用户

   如何创建自己的Django管理命令：

   1. 在app目录下创建命令目录结构：
      ```bash
      your_app/
      ├── management/
      │   ├── __init__.py
      │   └── commands/
      │       ├── __init__.py
      │       └── your_command.py
      ```

   2. 在your_command.py中实现命令：
      ```python
      from django.core.management.base import BaseCommand

      class Command(BaseCommand):
          help = '命令说明'

          def add_arguments(self, parser):
              # 添加命令参数
              parser.add_argument('参数名', type=str, help='参数说明')
              parser.add_argument('-短参数', '--长参数', required=False, help='参数说明')

          def handle(self, *args, **options):
              # 实现命令逻辑
              self.stdout.write(self.style.SUCCESS('成功信息'))
              self.stderr.write(self.style.ERROR('错误信息'))
      ```

   3. 使用命令：
      ```bash
      python manage.py your_command [参数]
      ```

### 2. 启动服务

使用Django的开发服务器：
```bash
python manage.py runserver
```

默认情况下，服务器会在 http://127.0.0.1:8000/ 启动

#### 可选参数：

- 指定端口：
  ```bash
  python manage.py runserver 8000
  ```

- 允许其他机器访问：
  ```bash
  python manage.py runserver 0.0.0.0:8000
  ```

### 3. 测试环境特点

- 集成开发服务器：自动处理HTTP请求、WebSocket连接、静态文件服务
- 单进程运行
- 自动代码重载
- 详细调试信息
- 支持基本的HTTP请求、WebSocket连接和后台任务

## 生产环境

### 1. 环境准备

1. 安装必要的包：
   ```bash
   pip install -r requirements.txt gunicorn daphne supervisor
   ```

2. 初始化数据库（如果需要）：
   ```bash
   python manage.py migrate
   ```

### 2. 启动服务

生产环境包含多个服务组件：

1. API服务 (9001端口)
   ```bash
   cd qa_api
   gunicorn -b 127.0.0.1:9001 -w 2 --threads 8 qa.wsgi
   ```

2. WebSocket服务 (9002端口)
   ```bash
   cd qa_api
   daphne -p 9002 qa.asgi:application
   ```

3. 后台服务
   - Worker服务：处理后台任务
   - Monitor服务：系统监控
   - Scheduler服务：任务调度器

建议使用supervisor管理所有服务（Linux环境）或分别启动各个服务（Windows环境）

### 3. 生产环境特点

- 多进程运行
- 更高性能和稳定性
- 负载均衡
- 完善的错误处理
- 服务解耦

## 数据库说明

项目使用两种数据库：

1. SQLite3（主数据库，测试环境）
   - 位置：项目根目录下的 `db.sqlite3` 文件
   - 用途：存储主要业务数据

2. Redis（缓存和消息队列）
   - 默认配置：127.0.0.1:6379
   - 用途：系统缓存、Channels通信、消息队列

注意：确保Redis服务已经启动，否则系统可能无法正常运行。

## 常见问题解决

如果安装依赖时遇到问题，可以尝试：
```bash
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
```

## 结论

虽然测试环境可以使用Django的`runserver`命令来运行所有功能，但在生产环境中，建议分开部署各个服务，以获得更好的性能、可靠性和可维护性。这种做法类似于在开发时使用SQLite，而在生产环境中选择MySQL/PostgreSQL，体现了开发便利性和生产稳定性之间的权衡。