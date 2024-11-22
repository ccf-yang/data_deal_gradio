import React, { useState } from 'react';
import { Table, Button, Modal } from 'antd';
import { MethodTag } from './MethodTag';
import ApiDetailView from './ApiDetailView';

const ImportApiTable = ({ apis, loading, onSave }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = (api) => {
    setSelectedApi(api);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedApi(null);
  };

  const columns = [
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (method) => <MethodTag method={method} />,
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
      width: 300,
    },
    {
      title: 'Summary',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => showModal(record)}
          size="small"
        >
          Details
        </Button>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const handleSave = () => {
    const selectedApis = apis.filter((_, index) => selectedRowKeys.includes(index));
    onSave(selectedApis);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={handleSave}
          disabled={!selectedRowKeys.length}
          style={{
            height: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
          }}
        >
          Save Selected APIs
        </Button>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={apis.map((api, index) => ({ ...api, key: index }))}
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

export default ImportApiTable;
