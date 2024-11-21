import json
from database import Database
from cache import RedisCache, cache_decorator
from stats import ApiStats
from models import ApiDocument, Project, ApiFolder
from validators import ApiEndpointValidator

class ApiManager:
    def __init__(self, db_url: str = "sqlite:///api_docs.db", redis_host: str = 'localhost'):
        self.db = Database(db_url)
        self.cache = RedisCache(host=redis_host)
        self.stats = ApiStats(self.db)
        
    def import_from_json(self, json_file: str):
        """从JSON文件导入API文档"""
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            api_doc = ApiDocument(
                project=Project(**data['project']),
                apis=[ApiFolder(**folder) for folder in data['apis']]
            )
            self.db.save_api_document(api_doc)
            
    @cache_decorator(expire=3600)
    def get_project_stats(self, project_id: int):
        """获取项目统计信息（带缓存）"""
        return {
            'summary': self.stats.get_project_summary(project_id),
            'coverage': self.stats.get_api_coverage(project_id),
            'deprecated': self.stats.get_deprecated_apis(project_id)
        }
        
    def validate_endpoint(self, endpoint_data: dict) -> bool:
        """验证API端点数据"""
        try:
            ApiEndpointValidator(**endpoint_data)
            return True
        except Exception as e:
            print(f"Validation error: {str(e)}")
            return False

def main():
    # 初始化管理器
    manager = ApiManager()
    
    # 创建数据库表
    manager.db.create_tables()
    
    # 导入JSON数据
    manager.import_from_json('result.json')
    
    # 获取所有项目
    projects = manager.db.get_all_projects()
    
    for project in projects:
        print(f"\n项目: {project.name}")
        
        # 获取项目统计信息
        stats = manager.get_project_stats(project.id)
        
        print("\n项目概要:")
        print(f"文件夹数量: {stats['summary']['folder_count']}")
        print(f"端点数量: {stats['summary']['endpoint_count']}")
        print("\nHTTP方法统计:")
        for method, count in stats['summary']['method_stats'].items():
            print(f"{method}: {count}")
            
        print("\nAPI覆盖率:")
        coverage = stats['coverage']
        print(f"描述文档覆盖率: {coverage['description_coverage']:.1f}%")
        print(f"示例代码覆盖率: {coverage['example_coverage']:.1f}%")
        print(f"错误处理覆盖率: {coverage['error_handling_coverage']:.1f}%")
        
        print("\n已废弃的API:")
        for api in stats['deprecated']:
            print(f"- {api['name']} ({api['method']} {api['url']})")

if __name__ == '__main__':
    main()
