import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, Space, Select, Form, message } from 'antd';
import { PlusOutlined, EditOutlined, SaveOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons';
import { createFunctionCase } from '../api/functionCaseService';

const { TextArea } = Input;
const { Option } = Select;

const AICasesTable = ({ loading }) => {
  const [cases, setCases] = useState([]);
  const [requirement, setRequirement] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [form] = Form.useForm();

  const isEditing = (record) => record.key === editingKey;

  const handleGenerate = async () => {
    // Mock API call for now
    console.log('Generating cases for requirement:', requirement);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Set mock data
    const mockGeneratedCases = [
      {
        key: '1',
        name: 'Login Test',
        module: 'Authentication',
        title: 'Verify user login with valid credentials',
        priority: 'High',
        preconditions: 'User account exists',
        inputs: 'Username and password',
        steps: '1. Enter username\n2. Enter password\n3. Click login',
        expectedResults: 'User successfully logged in'
      },
      {
        key: '2',
        name: 'Data Validation',
        module: 'Form Submission',
        title: 'Validate form data before submission',
        priority: 'Medium',
        preconditions: 'Form is accessible',
        inputs: 'Form field data',
        steps: '1. Fill form fields\n2. Submit form',
        expectedResults: 'Data validated successfully'
      }
    ];
    setCases(mockGeneratedCases);
  };

  const handleAddTo = async (record) => {
    try {
      // Create the case in the database
      const response = await createFunctionCase({
        name: record.name,
        module: record.module,
        testtitle: record.title,
        directory: record.directory || '',
        importance: record.priority.toLowerCase(),
        precondition: record.preconditions,
        testinput: record.inputs,
        steps: record.steps,
        expectedresults: record.expectedResults
      });

      if (response) {
        message.success('Case added successfully');
        setIsModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      console.error('Failed to add case:', error);
      message.error('Failed to add case');
    }
  };

  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      module: '',
      title: '',
      priority: '',
      preconditions: '',
      inputs: '',
      steps: '',
      expectedResults: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...cases];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setCases(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '15%',
      editable: true,
    },
    {
      title: '所属模块',
      dataIndex: 'module',
      width: '15%',
      editable: true,
    },
    {
      title: '测试标题',
      dataIndex: 'title',
      width: '15%',
      editable: true,
    },
    {
      title: '重要级别',
      dataIndex: 'priority',
      width: '10%',
      editable: true,
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="priority"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'Priority is required' }]}
          >
            <Select>
              <Option value="high">High</Option>
              <Option value="middle">Middle</Option>
              <Option value="low">Low</Option>
            </Select>
          </Form.Item>
        ) : (
          <span style={{ 
            color: text === 'High' ? '#f5222d' : 
                   text === 'Medium' ? '#faad14' : 
                   '#52c41a'
          }}>
            {text}
          </span>
        );
      }
    },
    {
      title: '前置条件',
      dataIndex: 'preconditions',
      width: '15%',
      editable: true,
    },
    {
      title: '测试输入',
      dataIndex: 'inputs',
      width: '15%',
      editable: true,
    },
    {
      title: '操作步骤',
      dataIndex: 'steps',
      width: '15%',
      editable: true,
    },
    {
      title: '预期结果',
      dataIndex: 'expectedResults',
      width: '15%',
      editable: true,
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              onClick={() => save(record.key)}
              type="primary"
              icon={<SaveOutlined />}
            >
              Save
            </Button>
            <Button onClick={cancel} icon={<CloseOutlined />}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Space>
            <Button
              disabled={editingKey !== ''}
              onClick={() => edit(record)}
              icon={<EditOutlined />}
            >
              Edit
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAddTo(record)}
            >
              Add to
            </Button>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'priority' ? 'select' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === 'select' ? (
      <Select>
        <Option value="high">High</Option>
        <Option value="middle">Middle</Option>
        <Option value="low">Low</Option>
      </Select>
    ) : (
      <Input />
    );

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  // useEffect(() => {
  //   setCases([
  //     {
  //       key: '1',
  //       name: 'Login Test',
  //       module: 'Authentication',
  //       title: 'Verify user login with valid credentials',
  //       priority: 'High',
  //       preconditions: 'User account exists',
  //       inputs: 'Username and password',
  //       steps: '1. Enter username\n2. Enter password\n3. Click login',
  //       expectedResults: 'User successfully logged in'
  //     },
  //     {
  //       key: '2',
  //       name: 'Data Validation',
  //       module: 'Form Submission',
  //       title: 'Validate form data before submission',
  //       priority: 'Medium',
  //       preconditions: 'Form is accessible',
  //       inputs: 'Form field data',
  //       steps: '1. Fill form fields\n2. Submit form',
  //       expectedResults: 'Data validated successfully'
  //     }
  //   ]);
  // }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16 }}>
        <TextArea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="Enter product requirement here..."
          autoSize={{ minRows: 3, maxRows: 6 }}
          style={{ marginBottom: 16 }}
          allowClear
        />
        <Space>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleGenerate}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Generate
          </Button>
          <Button
            danger
            onClick={() => {
              setCases([]);
              message.success('Table data cleared');
            }}
          >
            Clear Table
          </Button>
        </Space>
      </div>

      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={cases}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
          scroll={{ x: 1500 }}
        />
      </Form>
    </div>
  );
};

export default AICasesTable;
