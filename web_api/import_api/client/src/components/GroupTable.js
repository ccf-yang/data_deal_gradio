import React, { useState } from 'react';
import { Table, Button, Space, Modal, Select } from 'antd';
import {
  FileAddOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import GroupApiTable from './GroupApiTable';

const { Option } = Select;

const GroupTable = ({ loading }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedApis, setSelectedApis] = useState([]);
  const [selectedGroupName, setSelectedGroupName] = useState('');

  // Mock data for the group table
  const mockData = [
    {
      key: '1',
      groupName: 'Test Group 1',
      apis: [
        { 
          path: '/v2/config', 
          method: 'POST',
          directory: 'cc',
          key: '1'
        },
        { 
          path: '/v3/async/make-photo', 
          method: 'POST',
          directory: 'sdf',
          key: '2'
        }
      ],
      environment: 'test'
    },
    {
      key: '2',
      groupName: 'Production APIs',
      apis: [
        { 
          path: '/v2/config', 
          method: 'GET',
          directory: 'cc',
          key: '3'
        }
      ],
      environment: 'online'
    }
  ];

  const handleAddCase = (record) => {
    console.log('Add case for group:', record);
  };

  const handleRun = (record) => {
    console.log('Run group:', record);
  };

  const handleReport = (record) => {
    console.log('Generate report for group:', record);
  };

  const handleDelete = (record) => {
    console.log('Delete group:', record);
  };

  const handleEnvironmentChange = (value, record) => {
    console.log('Change environment for group:', record, 'to:', value);
    // Add your environment change logic here
  };

  const showApisModal = (apis, groupName) => {
    setSelectedApis(apis);
    setSelectedGroupName(groupName);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'Group Name',
      dataIndex: 'groupName',
      key: 'groupName',
      render: (text) => <span style={{ color: '#1890ff', fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'APIs',
      dataIndex: 'apis',
      key: 'apis',
      render: (apis, record) => (
        <Button 
          type="link" 
          onClick={() => showApisModal(apis, record.groupName)}
          style={{ padding: 0 }}
        >
          {apis[0].path}
          {apis.length > 1 && ` +${apis.length - 1}`}
        </Button>
      ),
    },
    {
      title: 'Environment',
      dataIndex: 'environment',
      key: 'environment',
      render: (env, record) => (
        <Select
          value={env}
          onChange={(value) => handleEnvironmentChange(value, record)}
          style={{ width: 120 }}
        >
          <Option value="test">Test</Option>
          <Option value="pre">Pre</Option>
          <Option value="online">Online</Option>
        </Select>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 400,
      render: (_, record) => (
        <Space size="small">
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
        </Space>
      ),
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Table
        columns={columns}
        dataSource={mockData}
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          showSizeChanger: false
        }}
      />
      
      <Modal
        title={`APIs in ${selectedGroupName}`}
        open={isModalVisible}
        onCancel={handleModalClose}
        width={1000}
        footer={null}
      >
        <GroupApiTable 
          apis={selectedApis}
          loading={false}
        />
      </Modal>
    </div>
  );
};

export default GroupTable;
