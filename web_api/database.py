from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from typing import List, Optional, Dict, Any
import json

Base = declarative_base()

class ProjectModel(Base):
    __tablename__ = 'projects'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    api_folders = relationship("ApiFolderModel", back_populates="project")

class ApiFolderModel(Base):
    __tablename__ = 'api_folders'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    target_type = Column(String(50), default="folder")
    description = Column(Text)
    sort = Column(Integer, default=0)
    project_id = Column(Integer, ForeignKey('projects.id'))
    
    project = relationship("ProjectModel", back_populates="api_folders")
    endpoints = relationship("ApiEndpointModel", back_populates="folder")

class ApiEndpointModel(Base):
    __tablename__ = 'api_endpoints'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    tags = Column(JSON)  # 存储为JSON数组
    target_type = Column(String(50))
    url = Column(String(255))
    method = Column(String(20))
    sort = Column(Integer, default=0)
    folder_id = Column(Integer, ForeignKey('api_folders.id'))
    
    # 存储复杂的请求和响应数据为JSON
    request_data = Column(JSON)
    response_data = Column(JSON)
    
    folder = relationship("ApiFolderModel", back_populates="endpoints")

    def set_request(self, request_dict: dict):
        self.request_data = json.dumps(request_dict)
    
    def get_request(self) -> dict:
        return json.loads(self.request_data) if self.request_data else {}
    
    def set_response(self, response_dict: dict):
        self.response_data = json.dumps(response_dict)
    
    def get_response(self) -> dict:
        return json.loads(self.response_data) if self.response_data else {}

# 数据库连接和会话管理
class Database:
    def __init__(self, db_url: str = "sqlite:///api_docs.db"):
        self.engine = create_engine(db_url)
        self.Session = sessionmaker(bind=self.engine)
        
    def create_tables(self):
        """创建所有表"""
        Base.metadata.create_all(self.engine)
        
    def get_session(self):
        """获取新的会话"""
        return self.Session()

    def save_api_document(self, api_doc):
        """保存整个API文档"""
        session = self.get_session()
        try:
            # 创建项目
            project_model = ProjectModel(
                name=api_doc.project.name,
                description=api_doc.project.description
            )
            session.add(project_model)
            
            # 保存API文件夹和端点
            for folder in api_doc.apis:
                folder_model = ApiFolderModel(
                    name=folder.name,
                    target_type=folder.target_type,
                    description=folder.description,
                    sort=folder.sort,
                    project=project_model
                )
                session.add(folder_model)
                
                # 保存端点
                for endpoint in folder.children:
                    endpoint_model = ApiEndpointModel(
                        name=endpoint.name,
                        tags=endpoint.tags,
                        target_type=endpoint.target_type,
                        url=endpoint.url,
                        method=endpoint.method,
                        sort=endpoint.sort,
                        folder=folder_model
                    )
                    # 将请求和响应数据转换为JSON存储
                    endpoint_model.set_request(endpoint.request.__dict__)
                    endpoint_model.set_response(endpoint.response.__dict__)
                    session.add(endpoint_model)
            
            session.commit()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def get_all_projects(self) -> List[ProjectModel]:
        """获取所有项目"""
        session = self.get_session()
        try:
            return session.query(ProjectModel).all()
        finally:
            session.close()

    def get_project_by_name(self, name: str) -> Optional[ProjectModel]:
        """通过名称获取项目"""
        session = self.get_session()
        try:
            return session.query(ProjectModel).filter(ProjectModel.name == name).first()
        finally:
            session.close()

    def get_api_folders_by_project(self, project_id: int) -> List[ApiFolderModel]:
        """获取项目下的所有API文件夹"""
        session = self.get_session()
        try:
            return session.query(ApiFolderModel).filter(
                ApiFolderModel.project_id == project_id
            ).all()
        finally:
            session.close()

    def get_endpoints_by_folder(self, folder_id: int) -> List[ApiEndpointModel]:
        """获取文件夹下的所有API端点"""
        session = self.get_session()
        try:
            return session.query(ApiEndpointModel).filter(
                ApiEndpointModel.folder_id == folder_id
            ).all()
        finally:
            session.close()
