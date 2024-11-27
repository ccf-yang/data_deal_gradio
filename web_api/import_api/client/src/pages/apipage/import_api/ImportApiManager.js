import React, { useState, useEffect, useCallback } from 'react';
import { Table, Upload, Button, Modal, message, Select, Input } from 'antd';
import { UploadOutlined, SaveOutlined, FolderOutlined, AntDesignOutlined } from '@ant-design/icons';
import { MethodTag } from '../../common/MethodTag';
import ApiDetailView from '../../common/ApiDetailView';
import { convertSwagger, saveApis, getDirectories, createDirectory } from '../../../api/savedApiService';

const ImportApiManager = () => {
  const [apis, setApis] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [directories, setDirectories] = useState([]);
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [isDirectoryModalVisible, setIsDirectoryModalVisible] = useState(false);
  const [newDirectoryName, setNewDirectoryName] = useState('');

  const showToast = useCallback((type, content) => {
    messageApi[type](content);
  }, [messageApi]);

  const loadDirectories = useCallback(async () => {
    try {
      const dirs = await getDirectories();
      setDirectories(dirs);
    } catch (error) {
      showToast('error', 'Failed to load directories');
    }
  }, [showToast]);

  useEffect(() => {
    loadDirectories();
  }, [loadDirectories]);

  useEffect(() => {
    console.log('Current state:', {
      selectedRowKeys,
      selectedDirectory,
      isButtonDisabled: !selectedRowKeys.length || !selectedDirectory
    });
  }, [selectedRowKeys, selectedDirectory]);

  const handleFileUpload = async (info) => {
    const { file, onSuccess, onError } = info;
    setLoading(true);
    
    try {
      const result = await convertSwagger(file);
      
      // Ensure we have an array of APIs
      const apiData = result.apis || result;
      const processedApis = Array.isArray(apiData) ? apiData : [apiData];
      setApis(processedApis);
      showToast('success', 'File uploaded successfully');
      onSuccess('ok');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('error', `Upload failed: ${error.message}`);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const showModal = (api) => {
    setSelectedApi(api);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedApi(null);
  };

  const handleCreateDirectory = async () => {
    if (!newDirectoryName.trim()) {
      showToast('error', 'Please enter a directory name');
      return;
    }

    try {
      setLoading(true);
      await createDirectory(newDirectoryName);
      await loadDirectories();
      setNewDirectoryName('');
      setIsDirectoryModalVisible(false);
      showToast('success', 'Directory created successfully');
    } catch (error) {
      showToast('error', 'Failed to create directory');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDirectory) {
      showToast('error', 'Please select a directory');
      return;
    }

    try {
      setLoading(true);
      const selectedApis = apis.filter((_, index) => selectedRowKeys.includes(index));
      await saveApis(selectedApis, selectedDirectory);
      showToast('success', 'APIs saved successfully');
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Save error:', error);
      showToast('error', `Save failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
      width: 200,
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => showModal(record)}
          size="small"
          icon={<AntDesignOutlined />}
        >
          Details
        </Button>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      console.log('Selected row keys:', newSelectedRowKeys);
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div className="import-api-manager">
      {contextHolder}
      <div style={{ display: 'flex', gap: '8px', marginBottom: 16, alignItems: 'center' , justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '18px', marginBottom: 16, alignItems: 'center' }}>
          <Button
              color="primary" 
              variant="solid"
              icon={<FolderOutlined />}
              onClick={() => setIsDirectoryModalVisible(true)}
            >
              新建目录
          </Button>
          <Upload
            customRequest={handleFileUpload}
            showUploadList={false}
          >
          <Button icon={<UploadOutlined />} color="default" variant="solid">Upload Swagger File</Button>
          </Upload>

          <Select
            style={{ width: 200 }}
            placeholder="选择API保存目录"
            value={selectedDirectory}
            onChange={setSelectedDirectory}
            options={directories.map(dir => ({ label: dir, value: dir }))}
          />
        </div>
        <div>
          <Button
            style={{ width: 100, marginRight: 16 }}
            icon={<SaveOutlined />}
            onClick={handleSave}
            disabled={!selectedRowKeys.length || !selectedDirectory}
            type="primary"
          >
            Save
          </Button>
        </div>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={apis.map((api, index) => ({ ...api, key: index }))}
        loading={loading}
        pagination={false}
        scroll={{ y: 800 }}
      />

      <Modal
        title="API Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedApi && <ApiDetailView api={selectedApi} />}
      </Modal>

      <Modal
        title="创建新目录"
        open={isDirectoryModalVisible}
        onOk={handleCreateDirectory}
        onCancel={() => {
          setIsDirectoryModalVisible(false);
          setNewDirectoryName('');
        }}
        confirmLoading={loading}
      >
        <Input
          placeholder="Enter directory name"
          value={newDirectoryName}
          onChange={(e) => setNewDirectoryName(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ImportApiManager;
