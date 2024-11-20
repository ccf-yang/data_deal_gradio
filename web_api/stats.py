from sqlalchemy import func
from typing import Dict, List, Tuple
from .database import Database, ProjectModel, ApiFolderModel, ApiEndpointModel

class ApiStats:
    def __init__(self, db: Database):
        self.db = db
        
    def get_project_summary(self, project_id: int) -> Dict:
        """获取项目概要统计"""
        session = self.db.get_session()
        try:
            # 获取文件夹数量
            folder_count = session.query(func.count(ApiFolderModel.id))\
                .filter(ApiFolderModel.project_id == project_id)\
                .scalar()
                
            # 获取端点数量
            endpoint_count = session.query(func.count(ApiEndpointModel.id))\
                .join(ApiFolderModel)\
                .filter(ApiFolderModel.project_id == project_id)\
                .scalar()
                
            # 获取各种HTTP方法的使用统计
            method_stats = session.query(
                ApiEndpointModel.method,
                func.count(ApiEndpointModel.id)
            ).join(ApiFolderModel)\
                .filter(ApiFolderModel.project_id == project_id)\
                .group_by(ApiEndpointModel.method)\
                .all()
                
            return {
                'folder_count': folder_count,
                'endpoint_count': endpoint_count,
                'method_stats': dict(method_stats)
            }
        finally:
            session.close()
            
    def get_folder_stats(self, folder_id: int) -> Dict:
        """获取文件夹统计信息"""
        session = self.db.get_session()
        try:
            # 获取端点数量
            endpoint_count = session.query(func.count(ApiEndpointModel.id))\
                .filter(ApiEndpointModel.folder_id == folder_id)\
                .scalar()
                
            # 获取各种HTTP方法的使用统计
            method_stats = session.query(
                ApiEndpointModel.method,
                func.count(ApiEndpointModel.id)
            ).filter(ApiEndpointModel.folder_id == folder_id)\
                .group_by(ApiEndpointModel.method)\
                .all()
                
            return {
                'endpoint_count': endpoint_count,
                'method_stats': dict(method_stats)
            }
        finally:
            session.close()
            
    def get_endpoint_complexity(self, endpoint_id: int) -> Dict:
        """分析端点复杂度"""
        session = self.db.get_session()
        try:
            endpoint = session.query(ApiEndpointModel).get(endpoint_id)
            if not endpoint:
                return {}
                
            request_data = endpoint.get_request()
            response_data = endpoint.get_response()
            
            # 分析请求参数数量
            param_count = len(request_data.get('parameters', []))
            
            # 分析响应字段数量
            response_fields = len(response_data.get('success', {}).get('parameter', []))
            
            return {
                'parameter_count': param_count,
                'response_field_count': response_fields,
                'has_error_response': bool(response_data.get('error')),
            }
        finally:
            session.close()
            
    def get_api_coverage(self, project_id: int) -> Dict:
        """分析API覆盖率"""
        session = self.db.get_session()
        try:
            # 获取所有端点
            endpoints = session.query(ApiEndpointModel)\
                .join(ApiFolderModel)\
                .filter(ApiFolderModel.project_id == project_id)\
                .all()
                
            total_endpoints = len(endpoints)
            if not total_endpoints:
                return {}
                
            # 统计各项覆盖率
            has_description = sum(1 for e in endpoints if e.get_request().get('description'))
            has_example = sum(1 for e in endpoints if e.get_request().get('example'))
            has_error_handling = sum(1 for e in endpoints if e.get_response().get('error'))
            
            return {
                'total_endpoints': total_endpoints,
                'description_coverage': has_description / total_endpoints * 100,
                'example_coverage': has_example / total_endpoints * 100,
                'error_handling_coverage': has_error_handling / total_endpoints * 100
            }
        finally:
            session.close()
            
    def get_deprecated_apis(self, project_id: int) -> List[Dict]:
        """获取已废弃的API列表"""
        session = self.db.get_session()
        try:
            deprecated_apis = session.query(ApiEndpointModel)\
                .join(ApiFolderModel)\
                .filter(
                    ApiFolderModel.project_id == project_id,
                    ApiEndpointModel.tags.contains(['deprecated'])
                ).all()
                
            return [
                {
                    'id': api.id,
                    'name': api.name,
                    'url': api.url,
                    'method': api.method
                }
                for api in deprecated_apis
            ]
        finally:
            session.close()
