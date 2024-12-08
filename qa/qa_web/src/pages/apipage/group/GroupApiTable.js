import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { MethodTag } from '../../common/MethodTag';
import ApiDetailView from '../../common/ApiDetailView';
import ParamsShowModal from '../../common/ParamsShowModal';
import { getApiCode, deleteApiFromGroup } from '../../../api/groupApiService';

const GroupApiTable = ({ apis: initialApis, loading, groupName, onReload }) => {
  const [apis, setApis] = useState(initialApis);
  const [selectedApi, setSelectedApi] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isParamsModalVisible, setIsParamsModalVisible] = useState(false);
  const [currentTestCasesCode, setCurrentTestCasesCode] = useState(null);
  const [selectedParamsApi, setSelectedParamsApi] = useState(null);
  const [paramsLoading, setParamsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState({});

  // Update local apis when prop changes
  useEffect(() => {
    setApis(initialApis);
  }, [initialApis]);

  const showApiDetail = (record) => {
    setSelectedApi(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedApi(null);
  };

  const handleModalCancel = () => {
    setIsParamsModalVisible(false);
    setSelectedParamsApi(null);
    setCurrentTestCasesCode(null);
  };

  const handleModalSuccess = () => {
    message.success('Parameters updated successfully');
    setIsParamsModalVisible(false);
    if (onReload) {
      onReload();
    }
  };

  const handleDelete = async (record) => {
    try {
      setDeleteLoading(prev => ({ ...prev, [record.key]: true }));
      await deleteApiFromGroup(
        record.method,
        record.path,
        record.directory,
        groupName
      );
      message.success('API deleted from group successfully');
      
      // Update local state immediately
      setApis(prevApis => prevApis.filter(api => 
        !(api.method === record.method && 
          api.path === record.path && 
          api.directory === record.directory)
      ));
      
      // Notify parent component to refresh
      if (onReload) {
        onReload();
      }
    } catch (error) {
      console.error('Failed to delete API:', error);
      message.error('Failed to delete API from group');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [record.key]: false }));
    }
  };

  const handleParamShow = async (record) => {
    try {
      setIsParamsModalVisible(true);
      setSelectedParamsApi(record);
      
      const response = await getApiCode({
        api_method: record.method,
        api_path: record.path,
        directory: record.directory
      });
      
      let parsedParams;
      try {
        parsedParams = JSON.parse(response.body_params);
      } catch (parseError) {
        parsedParams = response.body_params;
      }
      
      setCurrentTestCasesCode(parsedParams);
    } catch (error) {
      console.error('Failed to fetch API params:', error);
      message.error('请先点击Add Case!');
      setIsParamsModalVisible(false);
    }
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
            loading={deleteLoading[record.key]}
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
        visible={isModalVisible}
        onCancel={handleModalClose}
        width={800}
        footer={null}
      >
        {selectedApi && <ApiDetailView api={selectedApi} />}
      </Modal>
      
      {isParamsModalVisible && (
        <ParamsShowModal
          visible={isParamsModalVisible}
          onCancel={handleModalCancel}
          onSuccess={handleModalSuccess}
          currentApi={selectedParamsApi}
          testCasesCode={currentTestCasesCode}
        />
      )}
    </>
  );
};

export default GroupApiTable;
