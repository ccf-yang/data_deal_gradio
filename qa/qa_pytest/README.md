# API 自动化测试框架

## 框架介绍
这是一个基于Python的API自动化测试框架，采用多层架构设计，支持多环境配置和灵活的用例管理。

## 框架内部机制

### 1. 核心架构层次
```
测试用例层 → 公共方法层 → 业务层 → 请求包装层 → 端点代理层 → HTTP客户端
```

#### 1.1 装饰器链初始化
- `@api.mark(module='domain_in_env')`：环境模块标记装饰器
  - 用于关联特定环境配置
  - 从 `test_env_conf.py` 读取环境信息
- `@api.http.get/post/put/delete`：HTTP方法装饰器
  - 定义请求方法和端点路径
  - 处理请求参数映射

#### 1.2 请求构建流程
1. **测试用例层** (`testcases/test_auto_cases/`)
   - 定义测试参数和预期响应
   - 使用pytest标记进行用例分类
   - 通过 `check_resp_params` 处理响应验证

2. **公共方法层** (`common/`)
   - 通过 `SessionManager` 管理会话状态
   - 封装业务方法
   - 处理HTTP状态码验证
   - 提供统一的测试用例接口

3. **业务层** (`business/`)
   - 使用装饰器定义API端点
   - 处理请求参数转换
   - 实现业务逻辑封装

### 2. 框架核心组件

#### 2.1 请求处理组件
1. **RequestDescWrapper**
   - 构建完整请求URL
   - 管理请求参数和头信息
   - 处理请求方法选择

2. **EndPointApiProxy**
   - 解析环境特定端点
   - 管理URL路径构建
   - 集成插件系统实现动态端点配置

3. **RequestProxyInterface**
   - 定义请求代理接口规范
   - 确保不同请求类型的一致性实现

#### 2.2 配置管理
1. **环境配置** (`variables/test_env_conf.py`)
   ```python
   class qa:
       env = 'qa'
       ENDPOINTS = {
           "domain_in_env": {"url": "https://api-server.ppinfra.com"}
       }
   ```

2. **运行配置** (`variables/config.ini`)
   - 控制日志输出
   - 环境选择
   - 运行时行为配置

### 3. 插件系统详解

#### 3.1 插件系统架构
插件系统采用分层设计，主要包含以下组件：

1. **插件管理器** (PluginManager)
   - 负责插件的注册、初始化和运行
   - 提供统一的插件访问接口
   - 管理插件生命周期

2. **规范构建器** (SpecificationsBuilder)
   - 定义插件规范
   - 构建插件实现
   - 管理钩子方法

3. **插件接口** (PluginInterface)
   - 定义插件必须实现的方法
   - 提供标准化的插件契约
   - 确保插件实现的一致性

#### 3.2 插件生命周期

1. **初始化阶段**
```python
# 1. 创建规范构建器
builder = SpecificationsBuilder(name='default_plugin', interface=PluginInterface)

# 2. 构建插件规范
builder.build()
# - 解析接口方法
# - 创建规范列表
# - 注册钩子规范

# 3. 注册插件实现
builder.addRegister(plugin)
# - 验证插件实现
# - 包装插件方法
# - 注册到插件管理器
```

2. **运行时阶段**
```python
# 1. 调用插件方法
PluginManager.run('request', request=request_object)
# - 查找对应的钩子方法
# - 执行所有注册的实现
# - 返回处理结果
```

#### 3.3 插件类型和功能

1. **内置插件** (InnerPlugin)
   - 请求参数处理
   ```python
   class InnerPlugin(PluginInterface):
       def request(self, request: RequestObject):
           # 处理URL参数
           _url_params = request.kwargs.pop('url_params', {})
           if _url_params:
               request.url = request.url.format(**_url_params)
   ```

2. **环境插件** (EndPointPlugin)
   - 环境配置管理
   ```python
   class EndPointPlugin(EndPointsInterface):
       def endpoints(self, mark: MarkData):
           # 根据环境返回对应配置
           if env == "qa":
               return qa.ENDPOINTS
           return prod.ENDPOINTS
   ```

3. **HTTP插件** (HttpPlugin)
   - 请求/响应处理
   - 会话管理
   - 认证处理

#### 3.4 插件运行机制

1. **钩子方法定义**
```python
# 使用pluggy库定义钩子
spec = pluggy.HookspecMarker('default_plugin')
impl = pluggy.HookimplMarker('default_plugin')

# 定义规范
@spec
def request(self, request: RequestObject): pass

# 实现规范
@impl
def request(self, request: RequestObject):
    # 具体实现
    pass
```

2. **插件调用流程**
```
请求发起 
  → PluginManager.run('request') 
    → 获取规范构建器
      → 查找已注册插件 
        → 按序执行插件方法
          → 返回处理结果
```

3. **多插件协作**
- 插件按注册顺序执行
- 支持链式处理
- 结果可传递给下一个插件

#### 3.5 插件开发指南

1. **创建新插件**
```python
from ppioBaseCore.plugin.interface import PluginInterface

class CustomPlugin(PluginInterface):
    def request(self, request: RequestObject):
        # 自定义请求处理逻辑
        pass
        
    def response(self, response: ResponseObject):
        # 自定义响应处理逻辑
        pass
```

2. **注册插件**
```python
# 在适当的初始化位置
PluginManager.register(CustomPlugin())
```

3. **使用插件功能**
```python
# 在需要的地方调用
PluginManager.run('custom_method', **kwargs)
```

#### 3.6 插件系统优势

1. **灵活性**
   - 支持动态加载插件
   - 可根据需求启用/禁用插件
   - 便于扩展新功能

2. **可维护性**
   - 插件接口标准化
   - 职责划分清晰
   - 便于单元测试

3. **可扩展性**
   - 支持自定义插件
   - 插件间低耦合
   - 易于集成新功能

#### 3.7 HTTP插件完整示例

让我们通过HTTP插件的完整生命周期来理解插件系统是如何工作的：

##### 1. 插件定义

```python
from ppioBaseCore.plugin.interface import PluginInterface
from ppioBaseCore.model.data import RequestObject

class HttpPlugin(PluginInterface):
    def request(self, request: RequestObject):
        # 处理请求参数
        if 'other_params' in request.kwargs:
            _other_params = request.kwargs.pop('other_params')
            request.url = request.url.format(**_other_params)
```

##### 2. 插件注册

在框架初始化时（通常在conftest.py中）：
```python
from ppioBaseCore.plugin import PluginManager
from your_plugins import HttpPlugin

# 注册HTTP插件
PluginManager.http(reg=HttpPlugin())
```

##### 3. 请求处理流程

1. **装饰器触发**
```python
@request_hook
def get(self, url, params=None, **kwargs):
    pass

# request_hook装饰器内部实现
def request_hook(f):
    def do_request(*args, **kwargs):
        # 1. 获取HttpOption实例
        _instance = args[0]
        _option = getattr(_instance, 'option')
        
        # 2. 创建请求对象
        _request_object = RequestObject(_option, f.__name__, *args, **kwargs)
        
        # 3. 触发插件处理
        PluginManager.run('request', request=_request_object)
        
        # 4. 构建并发送请求
        return NiceRequest(request_object=_request_object).build()
    return update_wrapper(do_request, f)
```

2. **插件执行流程**
```python
# 示例API调用
@api_service('/users/{user_id}')
def get_user_info(self, user_id):
    return self.get(
        url=self.url,
        other_params={'user_id': user_id}
    )

# 执行顺序：
1. @api_service装饰器设置基础URL
2. get方法被request_hook装饰器拦截
3. 创建RequestObject对象
4. PluginManager调用已注册的HttpPlugin
5. HttpPlugin处理other_params参数
6. 最终请求被发送到 '/users/123'
```

##### 4. 请求处理示例

```python
# 原始请求
url = '/users/{user_id}/posts/{post_id}'
params = {
    'user_id': '123',
    'post_id': '456'
}

# 1. 创建请求对象
request = RequestObject(
    option=HttpOption(),
    method='get',
    url=url,
    other_params=params
)

# 2. 插件处理
# HttpPlugin.request被调用
request.url = '/users/123/posts/456'

# 3. 发送请求
response = NiceRequest(request_object=request).build()
```

##### 5. 完整测试用例示例

```python
class TestUserAPI:
    def test_get_user_info(self):
        # 1. 准备测试数据
        user_id = "123"
        expected_response = {
            "id": "123",
            "name": "John Doe"
        }
        
        # 2. 调用API
        response = self.api.get_user_info(user_id)
        
        # 3. 验证结果
        assert response.status_code == 200
        assert response.json() == expected_response
```

##### 6. 插件工作原理

1. **初始化阶段**
```python
# 1. 创建插件规范
builder = SpecificationsBuilder(name='http_plugin', interface=PluginInterface)

# 2. 注册插件实现
builder.addRegister(HttpPlugin())
```

2. **请求处理阶段**
```python
# 1. 拦截请求
@request_hook
def get(url, **kwargs):
    pass

# 2. 创建请求对象
request = RequestObject(option, method, url, **kwargs)

# 3. 调用插件链
PluginManager.run('request', request=request)

# 4. 处理URL参数
if 'other_params' in request.kwargs:
    request.url = request.url.format(**request.kwargs.pop('other_params'))

# 5. 发送请求
response = session.request(method, url, **kwargs)
```

3. **响应处理阶段**
```python
# 1. 创建响应对象
response = ResponseObject(
    response=raw_response,
    request=request,
    total_time=execution_time
)

# 2. 调用响应处理插件
PluginManager.run('response', response=response)
```

这个完整的示例展示了：

1. **插件的定义和注册**
   - 如何创建HTTP插件
   - 如何注册到框架

2. **请求处理流程**
   - 装饰器如何拦截请求
   - 插件如何处理请求参数
   - 请求对象的生命周期

3. **实际使用场景**
   - 完整的测试用例示例
   - URL参数处理
   - 响应处理

通过这个例子，我们可以看到插件系统如何优雅地处理HTTP请求的各个环节，使得代码更加模块化和可维护。

### 4. 文件操作和工具类

#### 4.1 文件处理 (`common/FileAction.py`)
- 配置文件读取
- JSON文件操作
- 路径管理
- 日志格式化

#### 4.2 配置读取 (`common/ReadConfigData.py`)
- 运行环境配置管理
- 日志输出控制
- 配置参数获取

### 5. 执行流程示例

以 `api_iaas_get_console_gpu_instances` 为例：

1. 测试用例调用公共方法：
   ```python
   resp_data = self.Tusecommon.func_api_iaas_get_console_gpu_instances()
   ```

2. 公共方法封装业务调用：
   ```python
   _resp = self.CuseBusiness.api_iaas_get_console_gpu_instances(data=req_data_header)
   ```

3. 业务层通过装饰器定义接口：
   ```python
   @api.mark(module='domain_in_env')
   @api.http.get(path="/api/v1/gpu/instances")
   def api_iaas_get_console_gpu_instances(self, data=None):
       return dict(params=data)
   ```

## 使用说明

### 1. 环境配置
1. 在 `variables/test_env_conf.py` 中配置环境信息
2. 在 `variables/config.ini` 中选择运行环境

### 2. 用例编写
1. 在 `business/auto/` 下创建业务接口定义
2. 在 `common/auto/` 下创建公共方法封装
3. 在 `testcases/test_auto_cases/` 下编写测试用例

### 3. 运行测试
```bash
python -m pytest testcases/test_auto_cases/test_cases_file_name.py -v
```

## 最佳实践
1. 合理使用装饰器管理环境配置
2. 保持各层次职责单一
3. 充分利用公共方法层减少代码重复
4. 使用pytest标记管理用例集
5. 适当配置日志级别辅助调试
6. 使用插件系统扩展框架功能
