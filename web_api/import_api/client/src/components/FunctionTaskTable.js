import React, { useState } from 'react';
import { Table, Button, Modal, Tag, Select } from 'antd';
import { CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';

const { Option } = Select;

const FunctionTaskTable = () => {
  const [isCasesModalVisible, setIsCasesModalVisible] = useState(false);
  const [selectedCases, setSelectedCases] = useState([]);
  const [taskData, setTaskData] = useState([
    {
      id: '1',
      name: 'Login Module Testing',
      assignedPerson: 'John Doe',
      cases: [
        { id: '1', name: 'Test Login Success', status: 'Pending' },
        { id: '2', name: 'Test Login Failure', status: 'Pending' },
      ],
      status: 'In Progress'
    },
    {
      id: '2',
      name: 'User Profile Testing',
      assignedPerson: 'Jane Smith',
      cases: [
        { id: '3', name: 'Test Profile Update', status: 'Pending' },
        { id: '4', name: 'Test Avatar Upload', status: 'Pending' },
      ],
      status: 'In Progress'
    },
  ]);

  const statusOptions = [
    { value: 'Not Started', color: 'default' },
    { value: 'In Progress', color: 'blue' },
    { value: 'Blocked', color: 'red' },
    { value: 'Under Review', color: 'orange' },
    { value: 'Completed', color: 'green' },
  ];

  const handleViewCases = (cases) => {
    setSelectedCases(cases);
    setIsCasesModalVisible(true);
  };

  const handleFinishTask = (record) => {
    console.log('Finishing task:', record);
    // Add your logic to handle task completion
  };

  const handleStatusChange = (value, record) => {
    const newData = taskData.map(item => {
      if (item.id === record.id) {
        return { ...item, status: value };
      }
      return item;
    });
    setTaskData(newData);
    console.log('Status changed for task:', record.id, 'New status:', value);
  };

  const casesColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Pending' ? 'orange' : 'green'}>
          {status}
        </Tag>
      ),
    },
  ];

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Assigned Person',
      dataIndex: 'assignedPerson',
      key: 'assignedPerson',
    },
    {
      title: 'Cases',
      key: 'cases',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewCases(record.cases)}
        >
          View Cases ({record.cases.length})
        </Button>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 140 }}
          onChange={(value) => handleStatusChange(value, record)}
          dropdownMatchSelectWidth={false}
        >
          {statusOptions.map(option => (
            <Option key={option.value} value={option.value}>
              <Tag color={option.color}>{option.value}</Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => handleFinishTask(record)}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
          disabled={record.status === 'Completed'}
        >
          Finish
        </Button>
      ),
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Table
        columns={columns}
        dataSource={taskData}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Task Cases"
        open={isCasesModalVisible}
        onCancel={() => setIsCasesModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={casesColumns}
          dataSource={selectedCases}
          rowKey="id"
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default FunctionTaskTable;
