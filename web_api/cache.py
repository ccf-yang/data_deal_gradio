import redis
import json
from typing import Optional, Any, List
from functools import wraps
from datetime import timedelta

class RedisCache:
    def __init__(self, host='localhost', port=6379, db=0):
        self.redis = redis.Redis(host=host, port=port, db=db)
        
    def set(self, key: str, value: Any, expire: int = None):
        """设置缓存"""
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        self.redis.set(key, value)
        if expire:
            self.redis.expire(key, expire)
            
    def get(self, key: str) -> Optional[Any]:
        """获取缓存"""
        value = self.redis.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value.decode()
        return None
        
    def delete(self, key: str):
        """删除缓存"""
        self.redis.delete(key)
        
    def clear(self):
        """清空所有缓存"""
        self.redis.flushdb()

def cache_decorator(expire: int = 3600):
    """缓存装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            # 生成缓存键
            cache_key = f"{func.__name__}:{':'.join(str(arg) for arg in args)}"
            if kwargs:
                cache_key += f":{':'.join(f'{k}={v}' for k, v in kwargs.items())}"
                
            # 尝试从缓存获取
            cached_result = self.cache.get(cache_key)
            if cached_result is not None:
                return cached_result
                
            # 执行原函数
            result = func(self, *args, **kwargs)
            
            # 存入缓存
            self.cache.set(cache_key, result, expire)
            return result
        return wrapper
    return decorator

# 缓存键生成器
class CacheKeyGenerator:
    @staticmethod
    def project_key(project_id: int) -> str:
        return f"project:{project_id}"
        
    @staticmethod
    def folder_key(folder_id: int) -> str:
        return f"folder:{folder_id}"
        
    @staticmethod
    def endpoint_key(endpoint_id: int) -> str:
        return f"endpoint:{endpoint_id}"
        
    @staticmethod
    def project_folders_key(project_id: int) -> str:
        return f"project:{project_id}:folders"
        
    @staticmethod
    def folder_endpoints_key(folder_id: int) -> str:
        return f"folder:{folder_id}:endpoints"
