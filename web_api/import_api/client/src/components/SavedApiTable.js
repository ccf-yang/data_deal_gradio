import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Modal, Switch, Tooltip, message } from 'antd';
import { 
  EyeOutlined, 
  DeleteOutlined, 
  PlayCircleOutlined, 
  FileAddOutlined,
  BarChartOutlined,
  CodeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { MethodTag } from './MethodTag';
import ApiDetailView from './ApiDetailView';
import GroupModal from './GroupModal';
import axios from 'axios';
import { API_BASE_URL, DEFAULT_PAGE_SIZE } from '../config';
import { removeApis } from '../api/savedApiService';

const { Option } = Select;

const SavedApiTable = ({ apis, loading, onSelect, onReload }) => {
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [filteredApis, setFilteredApis] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [autoStates, setAutoStates] = useState({});
  const [selectedEnvironment, setSelectedEnvironment] = useState('test');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;

  // Get unique directories for the filter dropdown
  const directories = [...new Set(apis.map(api => api.directory || 'Default'))].sort();

  // Process APIs to add unique keys
  const processApis = (apis) => {
    return apis.map((api, index) => ({
      ...api,
      key: `${api.path}-${api.method}-${api.directory}-${index}` // Create a truly unique key
    }));
  };

  useEffect(() => {
    setFilteredApis(processApis(apis));
    setSelectedDirectory(null);
  }, [apis]);

  useEffect(() => {
    if (selectedDirectory) {
      setFilteredApis(processApis(apis.filter(api => api.directory === selectedDirectory)));
    } else {
      setFilteredApis(processApis(apis));
    }
  }, [selectedDirectory, apis]);

  const handleDirectoryChange = (value) => {
    setSelectedDirectory(value);
    if (onSelect) {
      onSelect(null);
    }
  };

  const handleEnvironmentChange = (value) => {
    setSelectedEnvironment(value);
  };

  const handleAddToGroup = () => {
    if (!selectedRowKeys.length) {
      message.warning('Please select APIs to add to group');
      return;
    }
    setIsGroupModalVisible(true);
  };

  const handleSaveToGroup = async (groupName) => {
    try {
      const selectedApis = filteredApis.filter(api => selectedRowKeys.includes(api.key));
      await axios.post(`${API_BASE_URL}/api/group/add`, {
        groupName,
        apis: selectedApis
      });
      message.success('APIs added to group successfully');
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Failed to add APIs to group:', error);
      message.error('Failed to add APIs to group');
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedRowKeys.length) {
      message.warning('Please select APIs to delete');
      return;
    }

    const selectedApis = filteredApis.filter(api => selectedRowKeys.includes(api.key));
    const groupedByDirectory = selectedApis.reduce((acc, api) => {
      if (!acc[api.directory]) {
        acc[api.directory] = [];
      }
      acc[api.directory].push(api);
      return acc;
    }, {});

    Modal.confirm({
      title: 'Delete Selected APIs',
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected APIs?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          // Delete APIs for each directory
          for (const [directory, directoryApis] of Object.entries(groupedByDirectory)) {
            await removeApis(directoryApis, directory);
          }
          
          message.success(`${selectedRowKeys.length} APIs deleted successfully`);
          setSelectedRowKeys([]);
          if (onReload) {
            onReload();
          }
        } catch (error) {
          console.error('Batch delete error:', error);
          message.error(`Failed to delete APIs: ${error.message}`);
        }
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ]
  };

  const showApiDetail = (record) => {
    const api = record.parentApi || record;
    setSelectedApi(api);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedApi(null);
  };

  const handleAutoChange = (checked, record) => {
    setAutoStates(prev => ({
      ...prev,
      [record.key]: checked
    }));
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: 'Delete API',
      content: `Are you sure you want to delete "${record.path}" from "${record.directory}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await removeApis([record], record.directory);
          message.success('API deleted successfully');
          if (onReload) {
            onReload();
          }
        } catch (error) {
          console.error('Delete error:', error);
          message.error(`Failed to delete API: ${error.message}`);
        }
      },
    });
  };

  const handleAddCase = (record) => {
    // Add your add case logic here
    console.log('Add Case:', record);
  };

  const handleParamShow = (record) => {
    // Add your param show logic here
    console.log('Show Params:', record);
  };

  const handleRun = (record) => {
    // Add your run logic here
    console.log('Run:', record);
  };

  const handleReport = (record) => {
    // Add your report logic here
    console.log('Report:', record);
  };

  const columns = [
    {
      title: 'API Name',
      dataIndex: 'path',
      key: 'path',
      render: (text, record) => (
        <span style={{ 
          color: '#1890ff',
          fontWeight: record.endpoints ? 500 : 'normal'
        }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (text) => text ? <MethodTag method={text} /> : null,
    },
    {
      title: 'Document',
      dataIndex: 'directory',
      key: 'directory',
      width: 200,
      render: (text) => <span>{text || 'Default'}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 480,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EyeOutlined />}
            onClick={() => showApiDetail(record)}
            size="small"
            style={{ background: '#1890ff', borderColor: '#1890ff' }}
          >
            Details
          </Button>
          <Button
            type="default"
            icon={<FileAddOutlined />}
            onClick={() => handleAddCase(record)}
            size="small"
            style={{ color: '#52c41a', borderColor: '#52c41a' }}
          >
            Add Case
          </Button>
          <Button
            type="default"
            icon={<CodeOutlined />}
            onClick={() => handleParamShow(record)}
            size="small"
            style={{ color: '#722ed1', borderColor: '#722ed1' }}
          >
            Param Show
          </Button>
          <Button
            type="default"
            icon={<PlayCircleOutlined />}
            onClick={() => handleRun(record)}
            size="small"
            style={{ color: '#13c2c2', borderColor: '#13c2c2' }}
          >
            Run
          </Button>
          <Button
            type="default"
            icon={<BarChartOutlined />}
            onClick={() => handleReport(record)}
            size="small"
            style={{ color: '#fa8c16', borderColor: '#fa8c16' }}
          >
            Report
          </Button>
          <Button
            danger
            type="primary"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            size="small"
          >
            Delete
          </Button>
          <Tooltip title={autoStates[record.key] ? "Auto Mode On" : "Auto Mode Off"}>
            <Switch
              size="small"
              checked={autoStates[record.key]}
              onChange={(checked) => handleAutoChange(checked, record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Select
          style={{ width: 200 }}
          placeholder="Filter by directory"
          onChange={handleDirectoryChange}
          value={selectedDirectory}
          allowClear
        >
          {directories.map(dir => (
            <Option key={dir} value={dir}>{dir}</Option>
          ))}
        </Select>

        <Select
          style={{ width: 120 }}
          value={selectedEnvironment}
          onChange={handleEnvironmentChange}
        >
          <Option value="test">Test</Option>
          <Option value="prod">Production</Option>
        </Select>

        <Button
          type="primary"
          onClick={handleAddToGroup}
          disabled={!selectedRowKeys.length}
          icon={<PlusOutlined />}
          style={{
            background: '#52c41a',
            borderColor: '#52c41a'
          }}
        >
          Add to Group ({selectedRowKeys.length})
        </Button>

        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={handleBatchDelete}
          disabled={!selectedRowKeys.length}
        >
          Delete Selected ({selectedRowKeys.length})
        </Button>
      </div>

      <Table
        rowSelection={{
          ...rowSelection,
          columnWidth: 100
        }}
        columns={columns}
        dataSource={filteredApis}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          onChange: (page) => setCurrentPage(page),
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
        }}
        size="middle"
      />

      <Modal
        title="API Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        width={800}
        footer={null}
        destroyOnClose={true}
      >
        {selectedApi && <ApiDetailView api={selectedApi} />}
      </Modal>

      <GroupModal
        open={isGroupModalVisible}
        onClose={() => setIsGroupModalVisible(false)}
        onSave={handleSaveToGroup}
        apis={selectedRowKeys.map(key => filteredApis.find(api => api.key === key))}
      />
    </div>
  );
};

export default SavedApiTable;
