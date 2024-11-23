import React, { useState } from 'react';
import { Table, Button, Space, Modal } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { MethodTag } from './MethodTag';
import ApiDetailView from './ApiDetailView';

const GroupApiTable = ({ apis, loading }) => {
  const [selectedApi, setSelectedApi] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showApiDetail = (record) => {
    setSelectedApi(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedApi(null);
  };

  const handleDelete = (record) => {
    console.log('Delete API:', record);
  };

  const handleParamShow = (record) => {
    console.log('Show Params:', record);
  };

  const columns = [
    {
      title: 'API Name',
      dataIndex: 'path',
      key: 'path',
      render: (text) => (
        <span style={{ color: '#1890ff', fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (text) => <MethodTag method={text} />,
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
      width: 300,
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
            icon={<CodeOutlined />}
            onClick={() => handleParamShow(record)}
            size="small"
            style={{ color: '#722ed1', borderColor: '#722ed1' }}
          >
            Param Show
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
    <>
      <Table
        columns={columns}
        dataSource={apis}
        loading={loading}
        pagination={{
          pageSize: 10,
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
    </>
  );
};

export default GroupApiTable;
