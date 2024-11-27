import React, { useState } from 'react';
import { Layout, Menu, message } from 'antd';
import { 
  ImportOutlined, 
  SaveOutlined,
  GroupOutlined,
  CloudOutlined,
  RobotOutlined,
  CodeOutlined,
  CheckSquareOutlined
} from '@ant-design/icons';
import ImportApiIndex from './pages/apipage/import_api';
import SavedApiIndex from './pages/apipage/saved_api';
import GroupIndex from './pages/apipage/group';
import EnvironmentIndex from './pages/apipage/environment';
import AICasesIndex from './pages/functionpage/aicases';
import FuncCasesIndex from './pages/functionpage/cases';
import FunctionTaskIndex from './pages/functionpage/tasks';
import './App.css';

const { Header, Sider, Content } = Layout;

function App() {
  const [activeMenu, setActiveMenu] = useState('new');
  const [messageApi, contextHolder] = message.useMessage();

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
            onClick={({ key }) => setActiveMenu(key)}
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
            {activeMenu === 'new' && (
              <ImportApiIndex />
            )}
            {activeMenu === 'saved' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <SavedApiIndex />
              </div>
            )}
            {activeMenu === 'group' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <GroupIndex />
              </div>
            )}
            {activeMenu === 'environment' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <EnvironmentIndex />
              </div>
            )}
            {activeMenu === 'aicases' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <AICasesIndex />
              </div>
            )}
            {activeMenu === 'funccases' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <FuncCasesIndex />
              </div>
            )}
            {activeMenu === 'functask' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <FunctionTaskIndex />
              </div>
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
