import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import ApiTree from './components/ApiTree';
import ApiDetail from './components/ApiDetail';
import Toast from './components/Toast';
import DirectoryModal from './components/DirectoryModal';
// import ApiDirectory from './components/ApiDirectory';
import DocumentView from './components/DocumentView';
import ApiList from './components/ApiList';
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
    // Only initialize state if needed
    console.log('App.js: Initial mount');
  }, []);

  const loadSavedApis = async () => {
    console.log('=== START: Loading Saved APIs ===');
    
    try {
      setLoading(true);
      setError(null);
      
      // Get directories first
      const dirResponse = await axios.get(`${API_BASE_URL}/api/directories`);
      const directories = dirResponse.data;
      console.log('>>> Directories from server:', directories);
      
      // Get APIs organized by directory
      const response = await axios.get(`${API_BASE_URL}/api/saved-apis`);
      const apisByDirectory = response.data; // This is now the raw api.json content
      console.log('>>> APIs by directory:', apisByDirectory);
      
      // Transform the data structure to our app's format
      const allApis = [];
      
      // For each directory in api.json, add its APIs with directory info
      Object.entries(apisByDirectory).forEach(([directory, apis]) => {
        if (Array.isArray(apis)) {
          const apisWithDir = apis.map(api => ({
            ...api,
            directory // Add directory name to each API
          }));
          allApis.push(...apisWithDir);
        }
      });

      console.log('>>> Processed APIs:', allApis.map(api => ({
        path: api.path,
        directory: api.directory
      })));
      
      if (allApis.length > 0) {
        console.log('>>> Setting APIs in state, count:', allApis.length);
        setSavedApis(allApis);
        setApis(allApis);
      } else {
        setError('No APIs found');
      }
    } catch (error) {
      console.error('Error in loadSavedApis:', error.message);
      setError(`Failed to load APIs: ${error.message}`);
    } finally {
      setLoading(false);
      console.log('=== END: Loading Saved APIs ===');
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

  const handleImportUrl = async () => {
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
      
      // Save the current selected API to specified directory
      const response = await axios.post(`${API_BASE_URL}/api/save`, {
        apis: [selectedApi],  // Send complete API object
        directory
      });
      
      setToast({
        visible: true,
        message: 'API saved successfully',
        type: 'success'
      });
      
      // Don't reload saved APIs if we're on the import tab
      if (activeTab === 'saved') {
        await loadSavedApis();
      }
      
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

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    setSelectedApi(null);
    
    if (tab === 'saved') {
      console.log('Switching to saved tab, loading saved APIs');
      await loadSavedApis();  // Load saved APIs only for 'saved' tab
    } else {
      // For 'new' (import) tab, clear everything
      setApis([]);
      setUrlInput('');
      setError(null);
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
        <div className="sidebar">
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => handleTabChange('new')}
            >
              <span className="nav-icon">📥</span>
              Import API
            </button>
            <button
              className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => handleTabChange('saved')}
            >
              <span className="nav-icon">📚</span>
              Saved APIs
            </button>
          </nav>
        </div>

        <div className="main-content">
          {activeTab === 'new' && (
            <div className="import-controls">
              <div className="controls-row">
                <div className="url-input-group">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Enter API URL..."
                    className="url-input"
                  />
                  <button
                    onClick={handleImportUrl}
                    className="import-button"
                    disabled={loading}
                  >
                    Import URL
                  </button>
                </div>
                <div className="file-upload-group">
                  <label className="import-button">
                    <input
                      type="file"
                      accept=".json,.yaml,.yml"
                      onChange={handleFileUpload}
                      className="file-input"
                    />
                    Upload API File
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="content-panels">
            {activeTab === 'new' ? (
              <div className="api-list-panel">
                <ApiList
                  apis={apis}
                  onSelect={handleApiSelect}
                  selectedApi={selectedApi}
                />
              </div>
            ) : (
              <DocumentView
                apis={savedApis}
                onSelectApi={handleApiSelect}
                selectedApi={selectedApi}
              />
            )}

            {/* API Details Panel */}
            {selectedApi && (
              <div className="api-detail-container">
                <ApiDetail
                  api={selectedApi}
                  onSave={handleSaveApi}
                  isSaved={savedApis.includes(selectedApi)}
                />
              </div>
            )}
          </div>
        </div>
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
