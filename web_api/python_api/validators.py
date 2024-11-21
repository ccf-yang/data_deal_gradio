from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime

class HeaderParameterValidator(BaseModel):
    is_checked: str
    type: str
    key: str
    value: str
    not_null: str
    description: str
    field_type: str

    @validator('type')
    def validate_type(cls, v):
        allowed_types = ['Text', 'Number', 'Boolean']
        if v not in allowed_types:
            raise ValueError(f'Type must be one of {allowed_types}')
        return v

class RequestParameterValidator(BaseModel):
    key: str
    value: Any
    description: str
    not_null: str = "-1"

    @validator('key')
    def validate_key(cls, v):
        if not v.strip():
            raise ValueError('Key cannot be empty')
        return v

class ApiEndpointValidator(BaseModel):
    name: str
    tags: List[str]
    target_type: str
    url: str
    method: str
    request_data: Dict[str, Any]
    response_data: Dict[str, Any]
    sort: int = 0

    @validator('method')
    def validate_method(cls, v):
        allowed_methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        if v.upper() not in allowed_methods:
            raise ValueError(f'Method must be one of {allowed_methods}')
        return v.upper()

    @validator('url')
    def validate_url(cls, v):
        if not v.strip():
            raise ValueError('URL cannot be empty')
        # 可以添加更复杂的URL验证逻辑
        return v
