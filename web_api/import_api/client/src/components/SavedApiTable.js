import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Modal, Switch, Tooltip } from 'antd';
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

const { Option } = Select;

const SavedApiTable = ({ apis, loading, onSelect }) => {
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [filteredApis, setFilteredApis] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [autoStates, setAutoStates] = useState({});
  const [selectedEnvironment, setSelectedEnvironment] = useState('test');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
    const selectedApis = filteredApis.filter(api => selectedRowKeys.includes(api.key));
    console.log('Adding to group:', selectedEnvironment, 'Selected APIs:', selectedApis);
    // Add your group addition logic here
  };

  const rowSelection = {
    selectedRowKeys,
    onSelect: (record, selected) => {
      if (selected) {
        setSelectedRowKeys([...selectedRowKeys, record.key]);
      } else {
        setSelectedRowKeys(selectedRowKeys.filter(key => key !== record.key));
      }
    },
    hideSelectAll: true
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

  const handleDelete = (record) => {
    // Add your delete logic here
    console.log('Delete:', record);
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
      <div style={{ marginBottom: 16 }}>
        <Space>
          <span>Filter by Directory:</span>
          <Select
            style={{ width: 200 }}
            value={selectedDirectory}
            onChange={handleDirectoryChange}
            allowClear
            placeholder="Select a directory"
          >
            {directories.map(dir => (
              <Option key={dir} value={dir}>{dir}</Option>
            ))}
          </Select>
          <span style={{ marginLeft: 16 }}>Environment:</span>
          <Select
            style={{ width: 120 }}
            value={selectedEnvironment}
            onChange={handleEnvironmentChange}
          >
            <Option value="test">Test</Option>
            <Option value="pre">Pre</Option>
            <Option value="online">Online</Option>
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddToGroup}
            style={{ marginLeft: 8 }}
            disabled={selectedRowKeys.length === 0}
          >
            Add to Group ({selectedRowKeys.length} selected)
          </Button>
        </Space>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredApis}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredApis.length,
          onChange: (page) => setCurrentPage(page),
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          showSizeChanger: false
        }}
      />

      <Modal
        title="API Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        width={800}
        footer={null}
      >
        {selectedApi && <ApiDetailView api={selectedApi} />}
      </Modal>
    </div>
  );
};

export default SavedApiTable;
