import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, DatePicker, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ClockCircleOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getAllFunctionTasks, createFunctionTask, deleteFunctionTasks, updateFunctionTask, getSelectedFunctionTasks } from '../../../api/functionTaskService';
import { getAllFunctionCases } from '../../../api/functionCaseService';
import { ASSIGNERS, TASK_STATUSES } from '../../../config';

const { Option } = Select;

// Create a simplified version of FuncCasesTable for the modal
const CasesTable = ({ cases }) => {
  const columns = [
    {
      title: '用例名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      fixed: 'left',
      width: 150
    },
    {
      title: '所属模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      filters: [...new Set(cases.map(c => c.module))].map(module => ({
        text: module,
        value: module,
      })),
      onFilter: (value, record) => record.module === value
    },
    {
      title: '测试标题',
      dataIndex: 'testtitle',
      key: 'testtitle',
      width: 200,
      render: (text) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {text}
        </div>
      )
    },
    {
      title: '所属目录',
      dataIndex: 'directory',
      key: 'directory',
      width: 150,
      filters: [...new Set(cases.map(c => c.directory))].map(dir => ({
        text: dir,
        value: dir,
      })),
      onFilter: (value, record) => record.directory === value
    },
    {
      title: '重要性',
      dataIndex: 'importance',
      key: 'importance',
      width: 100,
      filters: [
        { text: 'high', value: 'high' },
        { text: 'middle', value: 'middle' },
        { text: 'low', value: 'low' }
      ],
      onFilter: (value, record) => record.importance === value,
      render: (text) => (
        <span style={{
          color: text === 'high' ? '#f5222d' :
                 text === 'middle' ? '#faad14' :
                 '#52c41a'
        }}>
          {text}
        </span>
      )
    },
    {
      title: '预置条件',
      dataIndex: 'precondition',
      key: 'precondition',
      width: 200,
      render: (text) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {text}
        </div>
      )
    },
    {
      title: '测试输入',
      dataIndex: 'testinput',
      key: 'testinput',
      width: 200,
      render: (text) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {text}
        </div>
      )
    },
    {
      title: '测试步骤',
      dataIndex: 'steps',
      key: 'steps',
      width: 250,
      render: (text) => (
        <div style={{ whiteSpace: 'pre-line' }}>
          {text?.split('\n').map((step, index) => (
            <div key={index}>
              {index + 1}. {step}
            </div>
          ))}
        </div>
      )
    },
    {
      title: '预期结果',
      dataIndex: 'expectedresults',
      key: 'expectedresults',
      width: 200,
      render: (text) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {text}
        </div>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={cases.map(c => ({ ...c, key: c.id }))}
      pagination={{ 
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} cases`
      }}
      scroll={{ x: 1500, y: 1500 }}
      size="middle"
      bordered
    />
  );
};

const FunctionTaskTable = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const [editingTask, setEditingTask] = useState(null);
  const [assignedPersonFilter, setAssignedPersonFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [isCasesModalVisible, setIsCasesModalVisible] = useState(false);
  const [selectedTaskCases, setSelectedTaskCases] = useState([]);
  const [selectedTaskName, setSelectedTaskName] = useState('');
  const [allCases, setAllCases] = useState({});

  // Get unique assigned persons and statuses for filters
  const assignedPersons = [...new Set(tasks.map(t => t.assignedPerson))];

  useEffect(() => {
    fetchTasks();
    fetchAllCases();
  }, []);

  const fetchAllCases = async () => {
    try {
      const response = await getAllFunctionCases();
      const casesMap = {};
      response.cases.forEach(c => {
        casesMap[c.id] = c;
      });
      setAllCases(casesMap);
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await getAllFunctionTasks();
      const tasksData = response.tasks || [];
      setTasks(tasksData.map(task => ({
        ...task,
        key: task.id.toString(),
        casesCount: task.cases?.length || 0
      })));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      message.error('Failed to fetch tasks');
    }
  };

  const handleViewCases = (record) => {
    const taskCases = record.cases.map(caseId => allCases[caseId]).filter(Boolean);
    setSelectedTaskCases(taskCases);
    setSelectedTaskName(record.name);
    setIsCasesModalVisible(true);
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingTask(null);
    setIsModalVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      const response = await getSelectedFunctionTasks([record.id]);
      const taskData = response.tasks[0];
      setEditingTask(taskData);
      form.setFieldsValue({
        name: taskData.name,
        assignedPerson: taskData.assignedPerson,
        status: taskData.status
      });
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error fetching task details:', error);
      message.error('Failed to fetch task details');
    }
  };

  const handleDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select tasks to delete');
      return;
    }

    Modal.confirm({
      title: 'Are you sure you want to delete these tasks?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteFunctionTasks(selectedRowKeys);
          message.success('Tasks deleted successfully');
          setSelectedRowKeys([]);
          fetchTasks();
        } catch (error) {
          console.error('Error deleting tasks:', error);
          message.error('Failed to delete tasks');
        }
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingTask) {
        await updateFunctionTask({
          id: editingTask.id,
          ...values,
          cases: editingTask.cases // Preserve existing cases
        });
        message.success('Task updated successfully');
      } else {
        await createFunctionTask({
          ...values,
          cases: [], // New task starts with no cases
          status: values.status || 'pending'
        });
        message.success('Task created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      message.error('Failed to save task');
    }
  };

  const getStatusTag = (status) => {
    let color = 'default';
    let icon = null;

    switch (status) {
      case TASK_STATUSES.PENDING:
        color = 'warning';
        icon = <ClockCircleOutlined />;
        break;
      case TASK_STATUSES.IN_PROGRESS:
        color = 'processing';
        icon = <SyncOutlined spin />;
        break;
      case TASK_STATUSES.COMPLETED:
        color = 'success';
        icon = <CheckCircleOutlined />;
        break;
      default:
        break;
    }

    return (
      <Tag color={color} icon={icon}>
        {status}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Assigned Person',
      dataIndex: 'assignedPerson',
      key: 'assignedPerson',
      filters: assignedPersons.map(person => ({ text: person, value: person })),
      filteredValue: assignedPersonFilter ? [assignedPersonFilter] : null,
      onFilter: (value, record) => record.assignedPerson === value
    },
    {
      title: 'Cases',
      dataIndex: 'casesCount',
      key: 'casesCount',
      sorter: (a, b) => a.casesCount - b.casesCount,
      render: (text, record) => (
        <Button type="link" onClick={() => handleViewCases(record)}>
          {text} cases
        </Button>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Pending', value: TASK_STATUSES.PENDING },
        { text: 'In Progress', value: TASK_STATUSES.IN_PROGRESS },
        { text: 'Completed', value: TASK_STATUSES.COMPLETED }
      ],
      filteredValue: statusFilter ? [statusFilter] : null,
      onFilter: (value, record) => record.status === value,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      sorter: (a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return moment(a.deadline).unix() - moment(b.deadline).unix();
      },
      render: (deadline) => {
        if (!deadline) return '-';
        const date = moment(deadline);
        const now = moment();
        const isOverdue = date.isBefore(now);
        const color = isOverdue ? '#ff4d4f' : 
                     date.isBefore(now.add(3, 'days')) ? '#faad14' : 
                     '#52c41a';
        return (
          <span style={{ color }}>
            {date.format('YYYY-MM-DD HH:mm')}
          </span>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          New Task
        </Button>
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          disabled={selectedRowKeys.length === 0}
        >
          Delete Selected
        </Button>
      </Space>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={tasks}
        onChange={(pagination, filters) => {
          setAssignedPersonFilter(filters.assignedPerson?.[0]);
          setStatusFilter(filters.status?.[0]);
        }}
      />

      <Modal
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingTask(null);
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: TASK_STATUSES.PENDING,
            deadline: editingTask?.deadline ? moment(editingTask.deadline) : null
          }}
        >
          <Form.Item
            name="name"
            label="Task Name"
            rules={[{ required: true, message: 'Please enter task name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="assignedPerson"
            label="Assigned Person"
            rules={[{ required: true, message: 'Please select assigned person' }]}
          >
            <Select>
              {ASSIGNERS.map(assigner => (
                <Option key={assigner.id} value={assigner.name}>
                  {assigner.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue={TASK_STATUSES.PENDING}
          >
            <Select>
              <Option value={TASK_STATUSES.PENDING}>
                <Space>
                  <ClockCircleOutlined />
                  Pending
                </Space>
              </Option>
              <Option value={TASK_STATUSES.IN_PROGRESS}>
                <Space>
                  <SyncOutlined spin />
                  In Progress
                </Space>
              </Option>
              <Option value={TASK_STATUSES.COMPLETED}>
                <Space>
                  <CheckCircleOutlined />
                  Completed
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="deadline"
            label="Deadline"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              placeholder="Select deadline"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Cases for Task: ${selectedTaskName}`}
        visible={isCasesModalVisible}
        onCancel={() => setIsCasesModalVisible(false)}
        width={1000}
        footer={null}
      >
        <CasesTable cases={selectedTaskCases} />
      </Modal>
    </div>
  );
};

export default FunctionTaskTable;
