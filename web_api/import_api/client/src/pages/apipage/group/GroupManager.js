import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Select, message, Tooltip } from 'antd';
import {
  FileAddOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import GroupApiTable from './GroupApiTable';
import { 
  getAllGroupedApis, 
  getGroups, 
  deleteGroup, 
  getGroupApis, 
  deleteApiFromGroup 
} from '../../../api/groupApiService';
import { getEnvironments } from '../../../api/environmentService';

const { Option } = Select;

const GroupManager = () => {
  // 这里为bool的是控制modal是否弹开的开关
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedApis, setSelectedApis] = useState([]);
  const [selectedGroupName, setSelectedGroupName] = useState('');
  const [groupData, setGroupData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [environments, setEnvironments] = useState([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState('');

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const response = await getAllGroupedApis();
      
      const transformedData = Object.entries(response).map(([groupName, apis], index) => ({
        key: String(index + 1),
        groupName: groupName,
        apis: apis.map((api, apiIndex) => ({
          key: String(apiIndex + 1),
          path: api.api_path,
          method: api.api_method,
          directory: api.directory,
          testcases_code: api.testcases_code,
          ...api.apiinfo
        })),
        environment: 'test'
      }));

      setGroupData(transformedData);
    } catch (error) {
      console.error('Error fetching group data:', error);
      message.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
    
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

  const handleAddCase = (record) => {
    console.log('Add case for group:', record);
  };

  const handleRun = (record) => {
    console.log('Run group:', record);
  };

  const handleReport = async (record) => {
    try {
      const response = await getGroups();
      const group = response.find(g => g.name === record.groupName);
      
      if (group && group.url) {
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
      
      const groupApis = await getGroupApis(record.groupName);
      
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
      
      await deleteGroup(record.groupName);
      
      message.success('Group deleted successfully');
      fetchGroupData();
    } catch (error) {
      console.error('Error deleting group:', error);
      message.error('Failed to delete group');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [record.key]: false }));
    }
  };

  const showApisModal = (apis, groupName) => {
    setSelectedApis(apis);
    setSelectedGroupName(groupName);
    setIsModalVisible(true);
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
      render: () => (
        <Select
          value={selectedEnvironment}
          onChange={setSelectedEnvironment}
          style={{ width: 120 }}
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
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="将组内的接口放到一批生成用例">  
            <Button
              type="default"
              size="small"
              icon={<FileAddOutlined />}
              onClick={() => handleAddCase(record)}
              style={{ color: '#52c41a', borderColor: '#52c41a' }}
            >
              Add Case
            </Button>
          </Tooltip>
          <Tooltip title="将组内的接口放到一批执行">  
            <Button
              type="default"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleRun(record)}
              style={{ color: '#13c2c2', borderColor: '#13c2c2' }}
            >
              Run
            </Button>
          </Tooltip>
          <Tooltip title="查看整组用例报告">  
            <Button
              type="default"
              size="small"
              icon={<BarChartOutlined />}
              onClick={() => handleReport(record)}
              style={{ color: '#722ed1', borderColor: '#722ed1' }}
            >
              Report
            </Button>
          </Tooltip>  
          <Button
            danger
            type="primary"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            loading={deleteLoading[record.key]}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Table
        columns={columns}
        dataSource={groupData}
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          showSizeChanger: false
        }}
      />
      
      <Modal
        title={`Group Name: ${selectedGroupName}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1200}
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

export default GroupManager;
