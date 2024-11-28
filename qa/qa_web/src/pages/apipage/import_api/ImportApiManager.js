import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isDirectoryModalVisible, setIsDirectoryModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [directories, setDirectories] = useState([]);
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [newDirectoryName, setNewDirectoryName] = useState('');
  
  // 使用 useRef 跟踪组件的挂载状态
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const showToast = useCallback((type, content) => {
    if (isMounted.current) {
      messageApi[type](content);
    }
  }, [messageApi]);

  const loadDirectories = useCallback(async () => {
    if (!isMounted.current) return;
    try {
      const dirs = await getDirectories();
      if (isMounted.current) {
        setDirectories(dirs);
      }
    } catch (error) {
      if (isMounted.current) {
        showToast('error', 'Failed to load directories');
      }
    }
  }, [showToast]);

  useEffect(() => {
    loadDirectories();
  }, [loadDirectories]);

  const handleCreateDirectoryClick = useCallback(() => {
    console.log('Create directory button clicked');
    if (isMounted.current) {
      setIsDirectoryModalVisible(true);
      console.log('Directory modal visibility set to true');
    }
  }, []);

  const handleCreateDirectory = useCallback(async () => {
    if (!isMounted.current) return;
    if (!newDirectoryName.trim()) {
      showToast('error', 'Please enter a directory name');
      return;
    }

    try {
      setLoading(true);
      await createDirectory(newDirectoryName);
      await loadDirectories();
      if (isMounted.current) {
        setNewDirectoryName('');
        setIsDirectoryModalVisible(false);
        showToast('success', 'Directory created successfully');
      }
    } catch (error) {
      if (isMounted.current) {
        showToast('error', 'Failed to create directory');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [newDirectoryName, loadDirectories, showToast]);

  const handleModalCancel = useCallback(() => {
    if (isMounted.current) {
      setIsDirectoryModalVisible(false);
      setNewDirectoryName('');
      console.log('Directory modal closed');
    }
  }, []);

  const handleFileUpload = useCallback(async (info) => {
    const { file, onSuccess, onError } = info;
    setLoading(true);
    
    try {
      const result = await convertSwagger(file);
      
      // Ensure we have an array of APIs
      const apiData = result.apis || result;
      const processedApis = Array.isArray(apiData) ? apiData : [apiData];
      if (isMounted.current) {
        setApis(processedApis);
        showToast('success', 'File uploaded successfully');
        onSuccess('ok');
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (isMounted.current) {
        showToast('error', `Upload failed: ${error.message}`);
        onError(error);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [showToast]);

  const showModal = useCallback((api) => {
    console.log('showModal called with api:', api);
    if (isMounted.current) {
      setSelectedApi(api);
      setIsModalVisible(true);
      console.log('Modal state after set:', { isModalVisible: true, selectedApi: api });
    }
  }, []);

  const handleModalClose = useCallback(() => {
    console.log('handleModalClose called');
    if (isMounted.current) {
      setIsModalVisible(false);
      setSelectedApi(null);
      console.log('Modal state after close:', { isModalVisible: false, selectedApi: null });
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!isMounted.current) return;
    if (!selectedDirectory) {
      showToast('error', 'Please select a directory');
      return;
    }

    try {
      setLoading(true);
      const selectedApis = apis.filter((_, index) => selectedRowKeys.includes(index));
      await saveApis(selectedApis, selectedDirectory);
      if (isMounted.current) {
        showToast('success', 'APIs saved successfully');
        setSelectedRowKeys([]);
      }
    } catch (error) {
      console.error('Save error:', error);
      if (isMounted.current) {
        showToast('error', `Save failed: ${error.message}`);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [selectedDirectory, selectedRowKeys, apis, showToast]);

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
          onClick={(e) => {
            e.stopPropagation();
            showModal(record);
          }}
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
      if (isMounted.current) {
        setSelectedRowKeys(newSelectedRowKeys);
      }
    },
  };

  return (
    <div className="import-api-manager">
      {contextHolder}
      <div style={{ display: 'flex', gap: '8px', marginBottom: 16, alignItems: 'center' , justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '18px', marginBottom: 16, alignItems: 'center' }}>
          <Button
            type="primary"
            icon={<FolderOutlined />}
            onClick={handleCreateDirectoryClick}
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
        columns={columns.map(col => ({
          ...col,
          onCell: (record) => ({
            onClick: (e) => {
              console.log('Table cell clicked:', {
                column: col.key,
                record,
                event: e.type
              });
            }
          })
        }))}
        dataSource={apis.map((api, index) => ({ ...api, key: index }))}
        loading={loading}
        pagination={false}
        scroll={{ y: 800 }}
      />

      <Modal
        visible={isDirectoryModalVisible}
        title="创建新目录"
        onOk={handleCreateDirectory}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        destroyOnClose
        maskClosable={false}
        keyboard={false}
        centered
      >
        <Input
          placeholder="Enter directory name"
          value={newDirectoryName}
          onChange={(e) => setNewDirectoryName(e.target.value)}
          onPressEnter={handleCreateDirectory}
          autoFocus
        />
      </Modal>

      <Modal
        title="API Details"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        destroyOnClose
        maskClosable={false}
        keyboard={false}
        centered
      >
        {selectedApi && <ApiDetailView api={selectedApi} />}
      </Modal>
    </div>
  );
};

export default ImportApiManager;
