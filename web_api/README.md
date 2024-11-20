# Swagger to Apipost 转换工具 - API 文档管理系统

一个功能强大的 Web 工具，用于将 Swagger/OpenAPI 规范转换为 Apipost 格式，并提供完整的 API 文档管理功能。

## 🔍 项目概述

- **目标**：开发一个 Web 工具，用于将 Swagger/OpenAPI 规范转换为 Apipost 格式，并构建一个完整的 API 文档管理系统
- **特点**：支持文档转换、持久化存储、缓存优化、统计分析等功能

## 🛠 技术栈

- **前端**：HTML, JavaScript
- **后端**：
  - Python (数据处理和存储)
  - Node.js, Express (转换服务)
- **数据库**：SQLite (通过 SQLAlchemy ORM)
- **缓存**：Redis
- **工具**：
  - Alembic (数据库迁移)
  - Pydantic (数据验证)
  - swagger2apipost (转换核心)

## 📂 项目结构

```
web_api/
├── import api/
│   ├── index.html      # 用户界面
│   ├── server.js       # Express 服务器
│   └── result.json     # 转换结果示例
├── models.py           # 数据模型定义
├── database.py         # 数据库映射层
├── cache.py           # Redis 缓存实现
├── stats.py           # 统计分析功能
├── validators.py      # 数据验证模块
├── main.py            # 主程序
├── alembic.ini        # 数据库迁移配置
└── migrations/        # 数据库迁移脚本
    └── env.py         # 迁移环境配置
```

## 🌟 主要功能

1. **文档转换**
   - Swagger/OpenAPI 到 Apipost 的转换
   - 支持 JSON 和 YAML 格式
   - 实时转换和预览

2. **数据存储**
   - 使用 SQLAlchemy ORM 进行数据映射
   - 支持复杂的文档结构
   - JSON 字段存储灵活数据

3. **性能优化**
   - Redis 缓存层
   - 缓存装饰器
   - 自动缓存键生成

4. **统计分析**
   - 项目概要统计
   - API 覆盖率分析
   - 端点复杂度评估
   - 废弃 API 识别

5. **数据验证**
   - Pydantic 模型验证
   - 字段类型检查
   - 自定义验证规则

## 📋 安装和使用

1. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

2. **初始化数据库**
   ```bash
   alembic init migrations
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```

3. **启动 Redis** (如果需要缓存功能)
   ```bash
   redis-server
   ```

4. **启动 Node.js 服务器**
   ```bash
   cd "import api"
   npm install
   node server.js
   ```

5. **运行主程序**
   ```bash
   python main.py
   ```

## 🔧 配置说明

### 数据库配置
- 默认使用 SQLite
- 可在 `database.py` 中修改数据库连接

### Redis 配置
- 默认连接本地 Redis
- 可在 `cache.py` 中修改连接参数

### 数据验证规则
- 在 `validators.py` 中定义
- 可根据需要自定义验证规则

## 🚀 使用示例

```python
# 初始化管理器
manager = ApiManager()

# 导入 API 文档
manager.import_from_json('result.json')

# 获取统计信息
stats = manager.get_project_stats(project_id)
print(f"API 总数: {stats['summary']['endpoint_count']}")
print(f"文档覆盖率: {stats['coverage']['description_coverage']}%")
```

## ⚠️ 注意事项

- 确保 Redis 服务正在运行（如果使用缓存）
- 验证 Swagger 文件格式
- 监控数据库和缓存性能
- 定期备份数据

## 🔒 安全建议

- 启用 CORS 保护
- 限制文件上传大小
- 验证输入文件格式
- 使用数据验证

## 🚧 未来计划

- [ ] 支持更多 OpenAPI 版本
- [ ] 增强错误处理
- [ ] 添加日志系统
- [ ] 优化用户界面
- [ ] 支持更多数据库
- [ ] 添加更多分析功能

## 📝 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 提交 Pull Request

## 📄 许可证

MIT License


更新了 .gitignore 文件，添加了以下类别的忽略项：

Python 相关：
字节码文件 (__pycache__/, *.pyc)
虚拟环境 (venv/, .env)
构建文件 (build/, dist/)
包文件 (*.egg-info/)
Node.js 相关：
node_modules/
npm 和 yarn 日志文件
调试日志
数据库文件：
SQLite 文件 (*.sqlite, *.db)
IDE 和编辑器：
VS Code (.vscode/)
PyCharm (.idea/)
Sublime Text 配置
vim 临时文件
缓存和日志：
日志文件 (*.log)
缓存目录 (.cache/)
Redis 缓存
项目特定：
数据库迁移版本
上传文件目录
实例配置
转换结果文件