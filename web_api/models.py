from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime

@dataclass
class HeaderParameter:
    is_checked: str
    type: str
    key: str
    value: str
    not_null: str
    description: str
    field_type: str

@dataclass
class RequestParameter:
    key: str
    value: Any
    description: str
    not_null: str = "-1"

@dataclass
class RequestBody:
    mode: str = "json"
    parameter: List[RequestParameter] = field(default_factory=list)
    raw: str = ""
    raw_para: List[RequestParameter] = field(default_factory=list)
    raw_schema: Dict[str, Any] = field(default_factory=dict)

@dataclass
class Request:
    description: str
    header: List[HeaderParameter]
    body: RequestBody

@dataclass
class ResponseExpect:
    name: str
    isDefault: int
    code: str
    contentType: str
    schema: Dict[str, Any]
    mock: str = ""
    verifyType: str = "schema"

@dataclass
class ResponseType:
    parameter: List[RequestParameter]
    raw: str
    expect: ResponseExpect

@dataclass
class Response:
    success: ResponseType
    error: ResponseType

@dataclass
class ApiEndpoint:
    name: str
    tags: List[str]
    target_type: str
    url: str
    method: str
    request: Request
    response: Response
    sort: int = 0

@dataclass
class ApiFolder:
    name: str
    target_type: str = "folder"
    description: str = ""
    children: List[ApiEndpoint] = field(default_factory=list)
    sort: int = 0

@dataclass
class Project:
    name: str
    description: str

@dataclass
class ApiDocument:
    project: Project
    apis: List[ApiFolder]


# Project: 表示整个项目的基本信息
# ApiDocument: 顶层文档结构，包含项目信息和API列表
# ApiFolder: API分组文件夹
# ApiEndpoint: 具体的API端点信息
# Request/Response: 请求和响应的详细信息
# HeaderParameter/RequestParameter: 请求头和请求参数的详细信息
# RequestBody: 请求体的详细信息
# ResponseExpect: 预期响应的详细信息
# 这个数据结构设计考虑了以下几点：

# 使用了Python的dataclass装饰器，使得类的定义更简洁
# 使用了类型提示，提高代码的可读性和可维护性
# 对于列表类型的字段，使用了field(default_factory=list)来避免可变默认值的问题
# 支持嵌套的数据结构，完整表示API文档的层级关系