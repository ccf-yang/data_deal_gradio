import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Select, message } from 'antd';
import {
  FileAddOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import GroupApiTable from './GroupApiTable';
import { 
  getAllGroupedApis, 
  getGroups, 
  deleteGroup, 
  getGroupApis, 
  deleteApiFromGroup 
} from '../api/groupApiService';
import { getEnvironments } from '../api/environmentService';

const { Option } = Select;

const GroupTable = ({ loading: externalLoading }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedApis, setSelectedApis] = useState([]);
  const [selectedGroupName, setSelectedGroupName] = useState('');
  const [groupData, setGroupData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [environments, setEnvironments] = useState([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState('test');

  useEffect(() => {
    fetchGroupData();
    const fetchEnvironments = async () => {
      try {
        const response = await getEnvironments();
        if (response.environments) {
          setEnvironments(response.environments);
          // Set first environment as default if available
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

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const response = await getAllGroupedApis();
      
      // Transform the response data to match mock data structure
      const transformedData = Object.entries(response).map(([groupName, apis], index) => ({
        key: String(index + 1),
        groupName: groupName,
        apis: apis.map((api, apiIndex) => ({
          key: String(apiIndex + 1),
          path: api.api_path,
          method: api.api_method,
          directory: api.directory,
          testcases_code: api.testcases_code,
          // bussiness_code: api.bussiness_code,
          // common_code: api.common_code,
          // is_auto_test: api.is_auto_test,
          // report_url: api.report_url,
          // header_params: api.header_params,
          // path_params: api.path_params,
          // query_params: api.query_params,
          // body_params: api.body_params,
          // response_params: api.response_params,
          // group: api.group,
          // apiinfo: api.apiinfo,
          // // Add any additional fields from apiinfo that might be needed
          ...api.apiinfo
        })),
        environment: 'test' // default environment
      }));

      setGroupData(transformedData);
    } catch (error) {
      console.error('Error fetching group data:', error);
      message.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCase = (record) => {
    console.log('Add case for group:', record);
  };

  const handleRun = (record) => {
    console.log('Run group:', record);
  };

  const handleReport = async (record) => {
    try {
      const response = await getGroups();
      const group = response.find(g => g.name === record.groupName); // 判断group name所在url是否有值
      
      if (group && group.url) {
        // Open the report URL in a new tab
        window.open(group.url, '_blank');
      } else {
        message.info('No report URL available for this group');
      }
    } catch (error) {
      console.error('Error fetching group report:', error);
      message.error('Failed to get group report URL');
    }
  };

  const handleDelete = async (record) => {
    try {
      setDeleteLoading(prev => ({ ...prev, [record.key]: true }));
      
      // First, check if there are any APIs in the group
      const groupApis = await getGroupApis(record.groupName);
      
      // If there are APIs, delete them from the group first
      if (groupApis && groupApis.length > 0) {
        for (const api of groupApis) {
          await deleteApiFromGroup(
            api.api_method,
            api.api_path,
            api.directory,
            record.groupName
          );
        }
      }
      
      // Then delete the group itself
      await deleteGroup(record.groupName);
      
      message.success('Group deleted successfully');
      // Refresh the group list
      fetchGroupData();
    } catch (error) {
      console.error('Error deleting group:', error);
      message.error('Failed to delete group');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [record.key]: false }));
    }
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
          value={selectedEnvironment}
          onChange={setSelectedEnvironment}
          style={{ width: 120, marginRight: 8 }}
          placeholder="Environment"
        >
          {environments.map(env => (
            <Option key={env.name} value={env.name}>{env.name}</Option>
          ))}
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Table
        columns={columns}
        dataSource={groupData}
        loading={loading || externalLoading}
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
          loading={loading} 
          groupName={selectedGroupName}
          onReload={fetchGroupData}
        />
      </Modal>
    </div>
  );
};

export default GroupTable;
