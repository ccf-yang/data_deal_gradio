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
import ParamsShowModal from './ParamsShowModal'; // Import the new ParamsShowModal
import { DEFAULT_PAGE_SIZE } from '../config';
import {
  addApiCodeWithGroup,
  deleteApiCode,
  addApiCodeWithoutGroup,
  getApiCode,
  updateApiCode,
  getAllAutoTestStatus
} from '../api/groupApiService';
import { removeApis } from '../api/savedApiService';
import { getEnvironments } from '../api/environmentService';

const { Option } = Select;

const SavedApiTable = ({ apis, loading, onSelect, onReload }) => {
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [filteredApis, setFilteredApis] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isParamsModalVisible, setIsParamsModalVisible] = useState(false); // New state for ParamsShowModal
  const [paramsLoading, setParamsLoading] = useState(false); // New state for params loading
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [autoStates, setAutoStates] = useState({});
  const [selectedEnvironment, setSelectedEnvironment] = useState('test');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTestCasesCode, setCurrentTestCasesCode] = useState('');
  const [environments, setEnvironments] = useState([]);
  const pageSize = DEFAULT_PAGE_SIZE;
  // 通过set函数来控制前面变量的值，前面变量最开始直接应用到react中

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

    // Fetch all auto test statuses when apis change
    const fetchAutoTestStatus = async () => {
      try {
        const response = await getAllAutoTestStatus();
        if (response.status === 'success') {
          const newAutoStates = {};
          response.data.forEach(api => {
            const key = `${api.api_path}-${api.api_method}-${api.directory}-${apis.findIndex(
              a => a.path === api.api_path && a.method === api.api_method && a.directory === api.directory
            )}`;
            newAutoStates[key] = api.is_auto_test;
          });
          setAutoStates(newAutoStates);
        }
      } catch (error) {
        console.error('Failed to fetch auto test statuses:', error);
        message.error('Failed to fetch auto test statuses');
      }
    };

    if (apis.length > 0) {
      fetchAutoTestStatus();
    }
  }, [apis]);

  useEffect(() => {
    if (selectedDirectory) {
      setFilteredApis(processApis(apis.filter(api => api.directory === selectedDirectory)));
    } else {
      setFilteredApis(processApis(apis));
    }
  }, [selectedDirectory, apis]);

  useEffect(() => {
    const fetchEnvironments = async () => {
      try {
        const response = await getEnvironments();
        if (response.environments) {
          setEnvironments(response.environments);
        }
        if (response.environments.length > 0) {
          setSelectedEnvironment(response.environments[0].name);
        }
      } catch (error) {
        console.error('Failed to fetch environments:', error);
        message.error('Failed to fetch environments');
      }
    };
    fetchEnvironments();
  }, []);

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
      
      for (const api of selectedApis) {
        await addApiCodeWithGroup({
          api_method: api.method,
          api_path: api.path,
          directory: api.directory,
          bussiness_code: api.bussiness_code || '',
          common_code: api.common_code || '',
          testcases_code: api.testcases_code || '',
          is_auto_test: api.is_auto_test || false,
          report_url: api.report_url || '',
          header_params: api.header_params || '',
          path_params: api.path_params || '',
          query_params: api.query_params || '',
          body_params: api.body_params || '',
          response_params: api.response_params || ''
        }, groupName);
      }
      
      message.success('APIs added to group successfully');
      setSelectedRowKeys([]);
      setIsGroupModalVisible(false);
      if (onReload) {
        onReload();
      }
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
          // Step 1: Delete APIs for each directory
          for (const [directory, directoryApis] of Object.entries(groupedByDirectory)) {
            await removeApis(directoryApis, directory);

            // Step 2: Check and delete API codes for each API
            for (const api of directoryApis) {
              try {
                const apiCode = await getApiCode({
                  api_method: api.method,
                  api_path: api.path,
                  directory: api.directory
                });

                // Step 3: If API code exists, delete it
                if (apiCode) {
                  await deleteApiCode({
                    api_method: api.method,
                    api_path: api.path,
                    directory: api.directory
                  });
                }
              } catch (error) {
                // If getApiCode fails, it means no API code exists, so we can ignore this error
                console.log('No API code found to delete for:', api.path);
              }
            }
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

  const handleDelete = async (record) => {
    Modal.confirm({
      title: 'Delete API',
      content: `Are you sure you want to delete "${record.path}" from "${record.directory}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          // Step 1: Delete from saved API
          await removeApis([record], record.directory);

          // Step 2: Check if API code exists
          try {
            const apiCode = await getApiCode({
              api_method: record.method,
              api_path: record.path,
              directory: record.directory
            });

            // Step 3: If API code exists, delete it
            if (apiCode) {
              await deleteApiCode({
                api_method: record.method,
                api_path: record.path,
                directory: record.directory
              });
            }
          } catch (error) {
            // If getApiCode fails, it means no API code exists, so we can ignore this error
            console.log('No API code found to delete');
          }

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

  const handleAddCase = async (record) => {
    try {
      const response = await addApiCodeWithoutGroup({
        api_method: record.method,
        api_path: record.path,
        directory: record.directory,
        bussiness_code: record.bussiness_code || '',
        common_code: record.common_code || '',
        testcases_code: record.testcases_code || '',
        is_auto_test: record.is_auto_test || false,
        report_url: record.report_url || '',
        header_params: record.header_params || '',
        path_params: record.path_params || '',
        query_params: record.query_params || '',
        body_params: record.body_params || '',
        response_params: record.response_params || ''
      });
      message.success('Case added successfully');
      if (onReload) {
        onReload();
      }
    } catch (error) {
      console.error('Failed to add case:', error);
      if (error.response?.data?.error?.includes('UNIQUE constraint failed')) {
        message.warning('This API case already exists');
      } else {
        message.error('Failed to add case');
      }
    }
  };

  const handleParamShow = async (record) => {
    try {
      setParamsLoading(true);
      const response = await getApiCode({
        api_method: record.method,
        api_path: record.path,
        directory: record.directory
      });
      setCurrentTestCasesCode(response.testcases_code);
      setIsParamsModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch API params:', error);
      message.error('Failed to load API parameters');
    } finally {
      setParamsLoading(false);
    }
  };

  const handleParamsModalClose = () => {
    setIsParamsModalVisible(false);
    setCurrentTestCasesCode(null);
  };

  const handleRun = (record) => {
    // Add your run logic here
    console.log('Run:', record);
  };

  const handleReport = async (record) => {
    try {
      const response = await getApiCode({
        api_method: record.method,
        api_path: record.path,
        directory: record.directory
      });

      if (response && response.report_url) {
        // Open report URL in a new tab
        window.open(response.report_url, '_blank');
        } else {
        message.info('Report is not ready, please wait for a while');
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      message.error('Failed to fetch report');
    }
  };

  const handleAutoModeChange = async (checked, record) => {
    try {
      // Update local state immediately for better UX
      setAutoStates(prev => ({
        ...prev,
        [record.key]: checked
      }));

      // Call API to update is_auto_test
      await updateApiCode({
        api_method: record.method,
        api_path: record.path,
        directory: record.directory,
        is_auto_test: checked
      });

      message.success(`Auto Mode ${checked ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      // Revert local state on error
      setAutoStates(prev => ({
        ...prev,
        [record.key]: !checked
      }));
      console.error('Failed to update Auto Mode:', error);
      message.error('Failed to update Auto Mode, add to cases first');
    }
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
            loading={paramsLoading}
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
        </Space>
      ),
    },
    {
      title: 'Auto',
      dataIndex: 'auto',
      key: 'auto',
      width: 100,
      render: (_, record) => (
        <Switch
          checked={autoStates[record.key] || false}
          onChange={(checked) => handleAutoModeChange(checked, record)}
        />
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
          value={selectedEnvironment}
          onChange={setSelectedEnvironment}
          style={{ width: 120, marginRight: 8 }}
          placeholder="Environment"
        >
          {environments.map(env => (
            <Option key={env.name} value={env.name}>{env.name}</Option>
          ))}
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

      <ParamsShowModal // New ParamsShowModal
        visible={isParamsModalVisible}
        onClose={handleParamsModalClose}
        testcasesCode={currentTestCasesCode}
      />

    </div>
  );
};

export default SavedApiTable;
