import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Checkbox, DatePicker } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UserAddOutlined, ClockCircleOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getAllFunctionCases, createFunctionCase, deleteFunctionCase, updateFunctionCase } from '../api/functionCaseService';
import { createFunctionTask, getAllFunctionTasks, updateFunctionTask, getSelectedFunctionTasks } from '../api/functionTaskService';
import { ASSIGNERS, TASK_STATUSES } from '../config';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

const AssignModal = ({ visible, onClose, selectedCases, onAssign }) => {
  const [form] = Form.useForm();
  const [tasks, setTasks] = useState([]);
  const [selectedCaseIds, setSelectedCaseIds] = useState([]);
  const [taskOptions, setTaskOptions] = useState([]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [selectedTaskData, setSelectedTaskData] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchTasks();
      setSelectedCaseIds(selectedCases.map(c => c.id));
    }
  }, [visible, selectedCases]);

  const fetchTasks = async () => {
    try {
      const response = await getAllFunctionTasks();
      const existingTasks = response.tasks || [];
      setTasks(existingTasks);
      
      const options = [
        ...existingTasks.map(task => ({
          value: task.id.toString(),
          label: task.name,
          isExisting: true
        }))
      ];
      setTaskOptions(options);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      message.error('Failed to fetch existing tasks');
    }
  };

  const handleCreateNewTask = async () => {
    if (!newTaskInput.trim()) {
      message.error('Please enter a task name');
      return;
    }

    try {
      const response = await createFunctionTask({
        name: newTaskInput,
        assignedPerson: '',
        cases: [],
        status: 'pending'
      });
      message.success('New task created successfully');
      setNewTaskInput('');
      fetchTasks(); // Refresh task list
    } catch (error) {
      console.error('Error creating task:', error);
      message.error('Failed to create task');
    }
  };

  const handleTaskChange = async (value) => {
    form.setFieldsValue({ taskName: value });
    if (value) {
      try {
        const response = await getSelectedFunctionTasks([value]);
        const taskData = response.tasks[0];
        setSelectedTaskData(taskData);
        form.setFieldsValue({ assignedPerson: taskData.assignedPerson });
      } catch (error) {
        console.error('Error fetching task details:', error);
      }
    } else {
      setSelectedTaskData(null);
      form.setFieldsValue({ assignedPerson: undefined });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const selectedIds = selectedCases
        .filter(c => selectedCaseIds.includes(c.id))
        .map(c => c.id);

      if (!values.taskName) {
        message.error('Please select a task');
        return;
      }

      // Get the latest task data
      const response = await getSelectedFunctionTasks([values.taskName]);
      const existingTask = response.tasks[0];
      
      if (existingTask) {
        const existingCases = existingTask.cases || [];
        const updatedCases = [...new Set([...existingCases, ...selectedIds])];
        
        await updateFunctionTask({
          id: existingTask.id,
          name: existingTask.name,
          assignedPerson: values.assignedPerson, // Use the form value
          cases: updatedCases,
          status: existingTask.status
        });
        message.success('Task updated successfully');
      }

      onClose();
      form.resetFields();
      setSelectedTaskData(null);
    } catch (error) {
      console.error('Error updating task:', error);
      message.error('Failed to update task');
    }
  };

  const handleCaseSelection = (caseId, checked) => {
    setSelectedCaseIds(prev => 
      checked ? [...prev, caseId] : prev.filter(id => id !== caseId)
    );
  };

  return (
    <Modal
      title="Assign Cases to Task"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      width={800}
    >
      <Form form={form} layout="vertical">
        <Space style={{ width: '100%', marginBottom: 16 }} align="baseline">
          <Input
            placeholder="Enter new task name"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={handleCreateNewTask}>
            Create New Task
          </Button>
        </Space>

        <Form.Item
          name="taskName"
          label="Select Task"
          rules={[{ required: true, message: 'Please select a task' }]}
        >
          <Select
            placeholder="Select task"
            onChange={handleTaskChange}
            style={{ width: '100%' }}
            allowClear
          >
            {taskOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
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

        {selectedTaskData && (
          <div style={{ marginBottom: 16 }}>
            <p><strong>Current cases:</strong> {selectedTaskData.cases?.length || 0}</p>
            <p><strong>Status:</strong> {selectedTaskData.status}</p>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <h4>Selected Cases:</h4>
          {selectedCases.map(caseItem => (
            <div key={caseItem.id} style={{ marginBottom: 8 }}>
              <Checkbox
                checked={selectedCaseIds.includes(caseItem.id)}
                onChange={(e) => handleCaseSelection(caseItem.id, e.target.checked)}
              >
                {caseItem.name} - {caseItem.module}
              </Checkbox>
            </div>
          ))}
        </div>
      </Form>
    </Modal>
  );
};

const FuncCasesTable = () => {
  const [cases, setCases] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [moduleFilter, setModuleFilter] = useState(null);
  const [directoryFilter, setDirectoryFilter] = useState(null);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [existingTasks, setExistingTasks] = useState([]);
  const [newTaskInput, setNewTaskInput] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (isAssignModalVisible) {
      // Fetch existing tasks when modal opens
      getAllFunctionTasks()
        .then(response => {
          const tasks = response.tasks || [];
          const uniqueTaskNames = [...new Set(tasks.map(task => task.name))];
          setExistingTasks(uniqueTaskNames);
        })
        .catch(error => {
          console.error('Failed to fetch tasks:', error);
        });
    }
  }, [isAssignModalVisible]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await getAllFunctionCases();
      if (response && response.cases && Array.isArray(response.cases)) {
        setCases(response.cases.map(caseItem => ({
          ...caseItem,
          key: caseItem.id
        })));
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
      message.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const response = await createFunctionCase(values);
      if (response) {
        message.success('Case created successfully');
        setIsModalVisible(false);
        form.resetFields();
        fetchCases();
      }
    } catch (error) {
      console.error('Failed to create case:', error);
      message.error('Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingCase(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const response = await updateFunctionCase(editingCase.id, values);
      if (response) {
        message.success('Case updated successfully');
        setIsModalVisible(false);
        form.resetFields();
        setEditingCase(null);
        fetchCases();
      }
    } catch (error) {
      console.error('Failed to update case:', error);
      message.error('Failed to update case');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one case to delete');
      return;
    }

    Modal.confirm({
      title: 'Are you sure you want to delete the selected cases?',
      content: `This will delete ${selectedRowKeys.length} case(s).`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          setLoading(true);
          await deleteFunctionCase(selectedRowKeys);
          message.success('Cases deleted successfully');
          setSelectedRowKeys([]);
          fetchCases();
        } catch (error) {
          console.error('Failed to delete cases:', error);
          message.error('Failed to delete some cases');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleAssign = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select cases to assign');
      return;
    }
    setIsAssignModalVisible(true);
  };

  const handleAddTask = () => {
    if (newTaskInput && !existingTasks.includes(newTaskInput)) {
      setExistingTasks([...existingTasks, newTaskInput]);
      setNewTaskInput('');
      form.setFieldsValue({ name: newTaskInput });
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
    },
    {
      title: 'Test Title',
      dataIndex: 'testtitle',
      key: 'testtitle',
    },
    {
      title: 'Directory',
      dataIndex: 'directory',
      key: 'directory',
    },
    {
      title: 'Importance',
      dataIndex: 'importance',
      key: 'importance',
      render: (text) => (
        <span style={{
          color: text === 'high' ? '#f5222d' :
                 text === 'middle' ? '#faad14' :
                 '#52c41a'
        }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Precondition',
      dataIndex: 'precondition',
      key: 'precondition',
    },
    {
      title: 'Test Input',
      dataIndex: 'testinput',
      key: 'testinput',
    },
    {
      title: 'Steps',
      dataIndex: 'steps',
      key: 'steps',
      render: (text) => <div style={{ whiteSpace: 'pre-line' }}>{text}</div>,
    },
    {
      title: 'Expected Results',
      dataIndex: 'expectedresults',
      key: 'expectedresults',
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
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  const filteredCases = cases.filter(caseItem => {
    if (moduleFilter && caseItem.module !== moduleFilter) return false;
    if (directoryFilter && caseItem.directory !== directoryFilter) return false;
    return true;
  });

  const handleAssignOk = async () => {
    try {
      const values = await form.validateFields();
      const taskData = {
        name: values.name || `Task for ${selectedRowKeys.length} cases`,
        assignedPerson: values.assignedPerson,
        cases: selectedRowKeys,
        status: TASK_STATUSES.PENDING,
        deadline: values.deadline ? values.deadline.format() : null
      };
      
      await createFunctionTask(taskData);
      form.resetFields();
      setIsAssignModalVisible(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCase(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Create Case
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
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleAssign}
            disabled={selectedRowKeys.length === 0}
          >
            Assign Cases
          </Button>
          <Select
            style={{ width: 200 }}
            placeholder="Filter by Module"
            allowClear
            onChange={value => setModuleFilter(value)}
          >
            {filteredCases.map(caseItem => caseItem.module).filter((value, index, self) => self.indexOf(value) === index).map(module => (
              <Option key={module} value={module}>{module}</Option>
            ))}
          </Select>
          <Select
            style={{ width: 200 }}
            placeholder="Filter by Directory"
            allowClear
            onChange={value => setDirectoryFilter(value)}
          >
            {filteredCases.map(caseItem => caseItem.directory).filter(Boolean).filter((value, index, self) => self.indexOf(value) === index).map(directory => (
              <Option key={directory} value={directory}>{directory}</Option>
            ))}
          </Select>
        </Space>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredCases}
        loading={loading}
        scroll={{ x: 1500 }}
      />

      <Modal
        title={editingCase ? "Edit Function Case" : "Create Function Case"}
        open={isModalVisible}
        onOk={editingCase ? handleSave : handleCreate}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCase(null);
          form.resetFields();
        }}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="module"
            label="Module"
            rules={[{ required: true, message: 'Please input the module!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="testtitle"
            label="Test Title"
            rules={[{ required: true, message: 'Please input the test title!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="directory"
            label="Directory"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="importance"
            label="Importance"
            rules={[{ required: true, message: 'Please select the importance!' }]}
          >
            <Select>
              <Option value="high">High</Option>
              <Option value="middle">Middle</Option>
              <Option value="low">Low</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="precondition"
            label="Precondition"
          >
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="testinput"
            label="Test Input"
          >
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="steps"
            label="Steps"
            rules={[{ required: true, message: 'Please input the steps!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="expectedresults"
            label="Expected Results"
            rules={[{ required: true, message: 'Please input the expected results!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Assign Cases to Task"
        open={isAssignModalVisible}
        onOk={handleAssignOk}
        onCancel={() => {
          setIsAssignModalVisible(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: TASK_STATUSES.PENDING
          }}
        >
          <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
            <Input 
              placeholder="Enter new task name"
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              style={{ width: '70%' }}
              onPressEnter={handleAddTask}
            />
            <Button 
              type="primary"
              onClick={handleAddTask}
            >
              Add Task
            </Button>
          </Space.Compact>

          <Form.Item
            name="name"
            label="Task Name"
            rules={[{ required: true, message: 'Please select or create a task name' }]}
          >
            <Select
              style={{ width: '100%' }}
              placeholder="Select a task name or leave empty for default"
              allowClear
            >
              <Select.Option value={`Task for ${selectedRowKeys.length} cases`}>
                Default: Task for {selectedRowKeys.length} cases
              </Select.Option>
              {existingTasks.map(taskName => (
                <Select.Option key={taskName} value={taskName}>
                  {taskName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="assignedPerson"
            label="Assigned Person"
            rules={[{ required: true, message: 'Please select assigned person' }]}
          >
            <Select placeholder="Select person">
              {ASSIGNERS.map(assigner => (
                <Select.Option key={assigner.id} value={assigner.name}>
                  {assigner.name}
                </Select.Option>
              ))}
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
    </div>
  );
};

export default FuncCasesTable;
