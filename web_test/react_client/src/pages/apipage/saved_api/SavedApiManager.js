import React, { useState, useEffect } from 'react';
import { Select, Button, Modal, message } from 'antd';
import { 
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import SavedApiTable from './SavedApiTable';
import GroupModal from './GroupModal';
import ParamsShowModal from '../../common/ParamsShowModal';
import {
  addApiCodeWithGroup,
  getApiCode,
  updateApiCode,
  getAllAutoTestStatus
} from '../../../api/groupApiService';
import { removeApis, getSavedApis } from '../../../api/savedApiService';
import { getEnvironments } from '../../../api/environmentService';

const { Option } = Select;

const SavedApiManager = () => {
  const [apis, setApis] = useState([]);
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [filteredApis, setFilteredApis] = useState([]);
  const [isParamsModalVisible, setIsParamsModalVisible] = useState(false);
  const [paramsLoading, setParamsLoading] = useState(false);
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [autoStates, setAutoStates] = useState({});
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [environments, setEnvironments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get unique directories for the filter dropdown
  const directories = [...new Set(apis.map(api => api.directory || 'Default'))].sort();

  // Process APIs to add unique keys
  const processApis = (apisData) => {
    // If the input is already an array, process it directly
    if (Array.isArray(apisData)) {
      return apisData.map((api, index) => ({
        ...api,
        key: `${api.path}-${api.method}-${api.directory}-${index}`
      }));
    }

    // If it's an object with directory keys, flatten it into an array
    if (typeof apisData === 'object' && apisData !== null) {
      const flattenedApis = [];
      Object.entries(apisData).forEach(([directory, apis]) => {
        if (Array.isArray(apis)) {
          apis.forEach((api) => {
            flattenedApis.push({
              ...api,
              directory: directory
            });
          });
        }
      });
      return flattenedApis.map((api, index) => ({
        ...api,
        key: `${api.path}-${api.method}-${api.directory}-${index}`
      }));
    }

    console.log('Unexpected API data format:', apisData);
    return [];
  };

  const loadSavedApis = async () => {
    try {
      setLoading(true);
      const response = await getSavedApis();
      console.log('API Response:', response);
      if (response) {
        const processedApis = processApis(response);
        if (processedApis.length > 0) {
          setApis(processedApis);
          setFilteredApis(processedApis);
        } else {
          message.info('No APIs found');
        }
      }
    } catch (error) {
      console.error('Error loading saved APIs:', error);
      message.error('Failed to load saved APIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedApis();
    
    const fetchEnvironments = async () => {
      try {
        const response = await getEnvironments();
        if (response.environments) {
          setEnvironments(response.environments);
          if (response.environments.length > 0) {
            setSelectedEnvironment(response.environments[0].name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch environments:', error);
        message.error('Failed to fetch environments');
      }
    };
    fetchEnvironments();
  }, []);

  useEffect(() => {
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
      setFilteredApis(apis.filter(api => api.directory === selectedDirectory));
    } else {
      setFilteredApis(apis);
    }
  }, [selectedDirectory, apis]);

  const handleDirectoryChange = (value) => {
    setSelectedDirectory(value);
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
        await addApiCodeWithGroup(
          {
            api_method: api.method,
            api_path: api.path,
            directory: api.directory
          },
          groupName
        );
      }
      
      message.success('APIs added to group successfully');
      setSelectedRowKeys([]);
      setIsGroupModalVisible(false);
      loadSavedApis();
    } catch (error) {
      console.error('Failed to add APIs to group:', error);
      message.error(error.message || 'Failed to add APIs to group');
    }
  };

  const handleAutoTestChange = async (record, checked) => {
    try {
      await updateApiCode({
        api_method: record.method,
        api_path: record.path,
        directory: record.directory,
        is_auto_test: checked
      });

      setAutoStates(prev => ({
        ...prev,
        [record.key]: checked
      }));

      message.success(`Auto test ${checked ? 'enabled' : 'disabled'} successfully`);
      loadSavedApis();
    } catch (error) {
      console.error('Failed to update auto test status:', error);
      message.error('Failed to update auto test status');
    }
  };

  const handleShowParams = async (record) => {
    try {
      setParamsLoading(true);
      const apiCode = await getApiCode({
        api_method: record.method,
        api_path: record.path,
        directory: record.directory
      });
      
      setIsParamsModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch API code:', error);
      message.error('Failed to fetch API parameters');
    } finally {
      setParamsLoading(false);
    }
  };

  const handleCloseGroupModal = () => {
    setIsGroupModalVisible(false);
  };

  const handleCloseParamsModal = () => {
    setIsParamsModalVisible(false);
  };

// 该js主要用作div布局，saved api表格单独写在SavedApiTable.js

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Select
            style={{ width: 200, marginRight: 16 }}
            placeholder="Filter by Directory"
            onChange={handleDirectoryChange}
            value={selectedDirectory}
            allowClear
          >
            {directories.map(dir => (
              <Option key={dir} value={dir}>{dir}</Option>
            ))}
          </Select>
          <Select
            style={{ width: 200 }}
            placeholder="Select Environment"
            onChange={handleEnvironmentChange}
            value={selectedEnvironment}
            allowClear
          >
            {environments.map(env => (
              <Option key={env.name} value={env.name}>{env.name}</Option>
            ))}
          </Select>
        </div>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddToGroup}
            disabled={!selectedRowKeys.length}
            style={{ marginRight: 8 }}
          >
            Add to Group
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            disabled={!selectedRowKeys.length}
            onClick={() => {
              Modal.confirm({
                title: 'Delete Selected APIs',
                content: `Are you sure you want to delete ${selectedRowKeys.length} selected APIs?`,
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: async () => {
                  try {
                    const selectedApis = filteredApis.filter(api => selectedRowKeys.includes(api.key));
                    for (const api of selectedApis) {
                      await removeApis([api], api.directory);
                    }
                    message.success(`${selectedRowKeys.length} APIs deleted successfully`);
                    setSelectedRowKeys([]);
                    loadSavedApis();
                  } catch (error) {
                    console.error('Batch delete error:', error);
                    message.error(`Failed to delete APIs: ${error.message}`);
                  }
                },
              });
            }}
            style={{ marginRight: 8 }}
          >
            Delete Selected
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadSavedApis}
          >
            Refresh
          </Button>
        </div>
      </div>

      <SavedApiTable
        apis={filteredApis}
        loading={loading}
        onReload={loadSavedApis}
        selectedEnvironment={selectedEnvironment}
        autoStates={autoStates}
        onAutoTestChange={handleAutoTestChange}
        onShowParams={handleShowParams}
        selectedRowKeys={selectedRowKeys}
        setSelectedRowKeys={setSelectedRowKeys}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <Modal
        title="API Parameters"
        visible={isParamsModalVisible}
        onCancel={handleCloseParamsModal}
        width={800}
        footer={null}
      >
        <ParamsShowModal loading={paramsLoading} />
      </Modal>

      <GroupModal
        visible={isGroupModalVisible}
        onClose={handleCloseGroupModal}
        onSave={handleSaveToGroup}
        apis={filteredApis.filter(api => selectedRowKeys.includes(api.key))}
      />
    </div>
  );
};

export default SavedApiManager;
