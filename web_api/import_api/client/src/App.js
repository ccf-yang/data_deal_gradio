import React, { useState, useEffect } from 'react';
import { Layout, Menu, Upload, Input, Button, message, Alert } from 'antd';
import { 
  UploadOutlined, 
  LinkOutlined, 
  ImportOutlined, 
  SaveOutlined,
  GroupOutlined,
  CloudOutlined,
  RobotOutlined,
  CodeOutlined,
  CheckSquareOutlined
} from '@ant-design/icons';
import axios from 'axios';
import DirectoryModal from './components/DirectoryModal';
import SavedApiTable from './components/SavedApiTable';
import ImportApiTable from './components/ImportApiTable';
import GroupTable from './components/GroupTable';
import EnvironmentTable from './components/EnvironmentTable';
import AICasesTable from './components/AICasesTable';
import FuncCasesTable from './components/FuncCasesTable';
import FunctionTaskTable from './components/FunctionTaskTable';
import './App.css';

const { Header, Sider, Content } = Layout;

const API_BASE_URL = 'http://localhost:3001';

function App() {
  const [apis, setApis] = useState([]);
  const [savedApis, setSavedApis] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeMenu, setActiveMenu] = useState('new');
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedApis, setSelectedApis] = useState([]);

  useEffect(() => {
    console.log('App.js: Initial mount');
  }, []);

  const showToast = (type, content) => {
    messageApi[type](content);
  };

  const loadSavedApis = async () => {
    console.log('=== START: Loading Saved APIs ===');
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/api/saved-apis`);
      const apisByDocument = response.data;
      
      // Transform the data structure while preserving document information
      const processedApis = Object.entries(apisByDocument).flatMap(([document, documentApis]) => {
        if (!Array.isArray(documentApis)) {
          console.warn(`Document ${document} has no APIs or invalid format`);
          return [];
        }

        return documentApis.map(api => {
          // If the API has endpoints, process each endpoint
          if (api.endpoints && Array.isArray(api.endpoints)) {
            return {
              ...api,
              directory: document,
              endpoints: api.endpoints.map(endpoint => ({
                ...endpoint,
                directory: document
              }))
            };
          }
          // If it's a single endpoint API
          return {
            ...api,
            directory: document
          };
        });
      });

      if (processedApis.length > 0) {
        console.log('Processed APIs:', processedApis);
        setSavedApis(processedApis);
        if (activeMenu === 'saved') {
          setApis(processedApis);
        }
      } else {
        setError('No APIs found');
      }
    } catch (error) {
      console.error('Error in loadSavedApis:', error.message);
      setError(`Failed to load APIs: ${error.message}`);
      showToast('error', `Failed to load APIs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (info) => {
    const { file, onSuccess, onError } = info;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_BASE_URL}/convert`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Ensure we have an array of APIs
      const apiData = response.data.apis || response.data;
      setApis(Array.isArray(apiData) ? apiData : [apiData]);
      showToast('success', 'File uploaded successfully');
      onSuccess('ok');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('error', `Upload failed: ${error.message}`);
      onError(error);
    }
  };

  const handleUrlImport = async () => {
    if (!urlInput.trim()) {
      showToast('error', 'Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/convert-url`, { url: urlInput });
      const apiData = response.data.apis || response.data;
      setApis(Array.isArray(apiData) ? apiData : [apiData]);
      showToast('success', 'API imported successfully');
      setUrlInput('');
    } catch (error) {
      console.error('URL import error:', error);
      showToast('error', `Import failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSelected = async (selectedApis) => {
    if (!selectedApis.length) {
      showToast('warning', 'Please select APIs to save');
      return;
    }
    setIsDirectoryModalOpen(true);
    setSelectedApis(selectedApis);
  };

  const handleSaveApi = async (directory) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/save`, {
        apis: selectedApis.map(api => ({
          ...api,
          directory
        })),
        directory
      });
      
      showToast('success', 'APIs saved successfully');
      setIsDirectoryModalOpen(false);
      
      // Reload saved APIs and switch to saved view
      await loadSavedApis();
      setActiveMenu('saved');
    } catch (error) {
      console.error('Save error:', error);
      showToast('error', `Save failed: ${error.message}`);
    }
  };

  const renderImportSection = () => {
    return (
      <div style={{ padding: '16px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Upload.Dragger
            customRequest={handleFileUpload}
            showUploadList={false}
            style={{ 
              width: '180px',
              margin: 0,
              padding: '4px 8px',
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UploadOutlined style={{ fontSize: '14px', color: '#1890ff' }} />
              <span style={{ color: '#595959', fontSize: '14px', margin: 0, lineHeight: '1' }}>Upload File</span>
            </div>
          </Upload.Dragger>

          <Input
            placeholder="Enter API URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            prefix={<LinkOutlined style={{ color: '#1890ff' }} />}
            style={{ 
              width: '400px',
              height: '40px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          />
          
          <Button
            type="primary"
            onClick={handleUrlImport}
            loading={loading}
            style={{
              height: '40px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #1890ff 0%, #1677ff 100%)'
            }}
          >
            Import from URL
          </Button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (activeMenu === 'new') {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderImportSection()}
          <div style={{ flex: 1, padding: '24px' }}>
            <ImportApiTable 
              apis={apis} 
              loading={loading}
              onSave={handleSaveSelected}
            />
          </div>
        </div>
      );
    }

    if (activeMenu === 'saved') {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {error && <Alert message={error} type="error" style={{ marginBottom: '16px' }} />}
          <SavedApiTable 
            apis={savedApis} 
            loading={loading} 
            onSelect={setSelectedApi}
          />
        </div>
      );
    }

    if (activeMenu === 'group') {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <GroupTable loading={loading} />
        </div>
      );
    }

    if (activeMenu === 'environment') {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <EnvironmentTable />
        </div>
      );
    }

    if (activeMenu === 'aicases') {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <AICasesTable />
        </div>
      );
    }

    if (activeMenu === 'funccases') {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <FuncCasesTable />
        </div>
      );
    }

    if (activeMenu === 'functask') {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <FunctionTaskTable />
        </div>
      );
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {contextHolder}
      <Header className="header" style={{ display: 'flex', alignItems: 'center', height: '90px', justifyContent: 'space-between' }}>
        <h1 style={{ color: 'white', margin: 0, flexGrow: 1, fontSize: '28px' }}>Test Platform</h1>
      </Header>
      <Layout>
        <Sider 
          width={200} 
          className="sidebar"
        >
          <Menu
            mode="inline"
            selectedKeys={[activeMenu]}
            style={{ 
              height: '100%', 
              borderRight: 0,
              background: 'transparent'
            }}
            onClick={({ key }) => {
              setActiveMenu(key);
              if (key === 'saved') {
                loadSavedApis();
              }
            }}
          >
            <Menu.Item 
              key="new" 
              icon={<ImportOutlined style={{ fontSize: '18px' }} />}
            >
              Import API
            </Menu.Item>
            <Menu.Item 
              key="saved" 
              icon={<SaveOutlined style={{ fontSize: '18px' }} />}
            >
              Saved API
            </Menu.Item>
            <Menu.Item 
              key="group" 
              icon={<GroupOutlined style={{ fontSize: '18px' }} />}
            >
              Group
            </Menu.Item>
            <Menu.Item 
              key="environment" 
              icon={<CloudOutlined style={{ fontSize: '18px' }} />}
            >
              Environment
            </Menu.Item>
            <Menu.Item 
              key="aicases" 
              icon={<RobotOutlined style={{ fontSize: '18px' }} />}
            >
              AI Cases
            </Menu.Item>
            <Menu.Item 
              key="funccases" 
              icon={<CodeOutlined style={{ fontSize: '18px' }} />}
            >
              Function Cases
            </Menu.Item>
            <Menu.Item 
              key="functask" 
              icon={<CheckSquareOutlined style={{ fontSize: '18px' }} />}
            >
              Function Task
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
      <DirectoryModal
        open={isDirectoryModalOpen}
        onCancel={() => setIsDirectoryModalOpen(false)}
        onSave={handleSaveApi}
      />
    </Layout>
  );
};

export default App;
