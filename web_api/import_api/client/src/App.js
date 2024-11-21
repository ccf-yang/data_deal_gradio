import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ApiTree from './components/ApiTree';
import ApiDetail from './components/ApiDetail';
import Toast from './components/Toast';
import DirectoryModal from './components/DirectoryModal';
import ApiDirectory from './components/ApiDirectory';
import './App.css';

const API_BASE_URL = 'http://localhost:3001';

function App() {
  // 当前导入或解析的API列表，用于显示在左侧树形菜单中
  const [apis, setApis] = useState([]);
  
  // 已保存的API列表，用于"Saved APIs"标签页显示
  const [savedApis, setSavedApis] = useState([]);
  
  // 当前选中的API详情，用于右侧详情面板显示
  const [selectedApi, setSelectedApi] = useState(null);
  
  // 错误信息状态，用于显示API导入或保存时的错误提示
  const [error, setError] = useState(null);
  
  // 加载状态标志，用于显示加载动画和禁用操作
  const [loading, setLoading] = useState(false);
  
  // URL输入框的值，用于API URL导入功能
  const [urlInput, setUrlInput] = useState('');
  
  // 当前激活的标签页，'new'表示新API导入页，'saved'表示已保存API页
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'saved'
  
  // Toast提示框状态，包含显示状态、消息内容和类型（success/error）
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' }); //initially hidden
  
  // 目录选择弹窗状态
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);

  useEffect(() => {
    loadSavedApis();
  }, []);

  const loadSavedApis = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/saved-apis`);
      if (response.data && Array.isArray(response.data.apis)) {
        setSavedApis(response.data.apis);
        if (activeTab === 'saved') {
          setApis(response.data.apis);
        }
      }
    } catch (error) {
      console.error('Error loading saved APIs:', error);
      setError('Failed to load saved APIs');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/convert`, formData);
      if (response.data && Array.isArray(response.data.apis)) {
        setApis(response.data.apis);
        setSelectedApi(null);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (event) => {
    event.preventDefault();
    if (!urlInput) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/convert-url`, { url: urlInput });
      if (response.data && Array.isArray(response.data.apis)) {
        setApis(response.data.apis);
        setSelectedApi(null);
      }
    } catch (error) {
      console.error('Error fetching from URL:', error);
      setError(error.response?.data?.error || 'Failed to fetch from URL');
    } finally {
      setLoading(false);
    }
  };

  const handleApiSelect = (api) => {
    setSelectedApi(api);
  };

  const handleSaveApi = async () => {
    if (!selectedApi) {
      setError('No API selected');
      return;
    }

    setIsDirectoryModalOpen(true);
  };

  const handleDirectorySubmit = async (directory) => {
    try {
      setLoading(true);
      setError(null);
      
      // 保存当前选中的API到指定目录
      const response = await axios.post(`${API_BASE_URL}/api/save`, {
        apis: [selectedApi],  // 发送完整的API对象
        directory
      });
      
      setToast({
        visible: true,
        message: 'API saved successfully',
        type: 'success'
      });
      
      // 重新加载保存的APIs
      await loadSavedApis();
      setIsDirectoryModalOpen(false);
    } catch (error) {
      console.error('Error saving API:', error);
      setError(error.response?.data?.error || 'Failed to save API');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setApis([]);
    setSelectedApi(null);
    setUrlInput('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedApi(null);
    if (tab === 'saved') {
      setApis(savedApis);
    } else {
      setApis([]);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 2000);
  };

  return (
    <div className="app">
      <Toast {...toast} />
      <header className="app-header">
        <h1>API Documentation Viewer</h1>
      </header>
      
      <div className="app-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => handleTabChange('new')}
            >
              <i className="nav-icon fas fa-file-import"></i>
              <span>Import API</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => handleTabChange('saved')}
            >
              <i className="nav-icon fas fa-save"></i>
              <span>Saved APIs</span>
            </button>
          </nav>
          {activeTab === 'saved' && (
            <ApiDirectory 
              apis={savedApis} 
              onSelect={handleApiSelect}
              selectedApi={selectedApi}
            />
          )}
        </aside>

        <main className="main-content">
          <div className="content-area">
            <div className="content-left">
              <div className="api-tree-container">
                <ApiTree 
                  apis={apis} 
                  onSelect={handleApiSelect} 
                  selectedApi={selectedApi}
                />
              </div>
            </div>

            <div className="content-right">
              <div className="content-right-header">
                {activeTab === 'new' && (
                  <div className="header-controls">
                    <div className="import-controls">
                      <div className="file-import">
                        <input
                          type="file"
                          accept=".json,.yaml,.yml"
                          onChange={handleFileUpload}
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="control-button">
                          <i className="button-icon fas fa-file-upload"></i>
                          Choose File
                        </label>
                      </div>
                      <div className="url-import">
                        <form onSubmit={handleUrlSubmit} className="url-form">
                          <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="Enter Swagger/OpenAPI URL"
                          />
                          <button type="submit" className="control-button">
                            <i className="button-icon fas fa-link"></i>
                            Import URL
                          </button>
                        </form>
                      </div>
                      <button onClick={handleClear} className="control-button clear">
                        <i className="button-icon fas fa-trash"></i>
                        Clear
                      </button>
                    </div>
                    {selectedApi && (
                      <button 
                        className="action-button save"
                        onClick={handleSaveApi}
                      >
                        <i className="button-icon fas fa-save"></i>
                        Save API
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="content-right-body">
                {selectedApi && (
                  <div className="api-detail-container">
                    <ApiDetail api={selectedApi} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {error && <div className="error-toast">{error}</div>}
      {loading && <div className="loading-overlay">Loading...</div>}

      <DirectoryModal
        isOpen={isDirectoryModalOpen}
        onClose={() => setIsDirectoryModalOpen(false)}
        onSave={handleDirectorySubmit}
      />
    </div>
  );
}

export default App;
