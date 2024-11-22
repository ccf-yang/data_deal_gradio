import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { MethodTag } from './MethodTag';
import ApiDetailView from './ApiDetailView';

const { Option } = Select;

const SavedApiTable = ({ apis, loading, onSelect }) => {
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [filteredApis, setFilteredApis] = useState(apis);
  const [selectedApi, setSelectedApi] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Get unique directories for the filter dropdown
  const directories = [...new Set(apis.map(api => api.directory || 'Default'))].sort();

  useEffect(() => {
    setFilteredApis(apis);
    setSelectedDirectory(null);
  }, [apis]);

  useEffect(() => {
    if (selectedDirectory) {
      setFilteredApis(apis.filter(api => api.directory === selectedDirectory));
    } else {
      setFilteredApis(apis);
    }
  }, [selectedDirectory, apis]);

  const handleDirectoryChange = (value) => {
    setSelectedDirectory(value);
    if (onSelect) {
      onSelect(null);
    }
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
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />}
          onClick={() => showApiDetail(record)}
          size="small"
        >
          Details
        </Button>
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
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredApis.map((api, index) => ({ ...api, key: index }))}
        loading={loading}
        pagination={false}
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
    </div>
  );
};

export default SavedApiTable;
