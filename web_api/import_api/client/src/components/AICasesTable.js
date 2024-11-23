import React, { useState } from 'react';
import { Table, Button, Modal, Input, Space, Select, Form, Divider } from 'antd';
import { SendOutlined, PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const AICasesTable = ({ loading }) => {
  const [requirement, setRequirement] = useState('');
  const [cases, setCases] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [documents, setDocuments] = useState([
    { value: 'doc1', label: 'Document 1' },
    { value: 'doc2', label: 'Document 2' },
    { value: 'doc3', label: 'Document 3' },
  ]);
  const [newDocName, setNewDocName] = useState('');
  const [form] = Form.useForm();

  const handleGenerate = async () => {
    // Mock API call
    console.log('Generating cases for requirement:', requirement);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Set mock data
    setCases(mockGeneratedCases);
  };

  const showAddToModal = (record) => {
    setSelectedCase(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    form.resetFields();
    setNewDocName('');
  };

  const handleAddTo = async () => {
    try {
      const values = await form.validateFields();
      console.log('Adding case to document:', values.document, 'Case:', selectedCase);
      setIsModalVisible(false);
      form.resetFields();
      setNewDocName('');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const addNewDocument = (e) => {
    e.preventDefault();
    if (!newDocName) return;
    
    const newDoc = {
      label: newDocName,
      value: `doc${Date.now()}`,
    };
    
    setDocuments([...documents, newDoc]);
    setNewDocName('');
    form.setFieldsValue({ document: newDoc.value });
  };

  // Mock data for test cases
  const mockGeneratedCases = [
    {
      key: '1',
      id: 'TC001',
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
      id: 'TC002',
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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '所属模块',
      dataIndex: 'module',
      key: 'module',
      width: 150,
    },
    {
      title: '测试标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '重要级别',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (text) => (
        <span style={{ 
          color: text === 'High' ? '#f5222d' : 
                 text === 'Medium' ? '#faad14' : 
                 '#52c41a'
        }}>
          {text}
        </span>
      ),
    },
    {
      title: '前置条件',
      dataIndex: 'preconditions',
      key: 'preconditions',
      width: 150,
    },
    {
      title: '测试输入',
      dataIndex: 'inputs',
      key: 'inputs',
      width: 150,
    },
    {
      title: '操作步骤',
      dataIndex: 'steps',
      key: 'steps',
      width: 200,
      render: (text) => (
        <div style={{ whiteSpace: 'pre-line' }}>{text}</div>
      ),
    },
    {
      title: '预期结果',
      dataIndex: 'expectedResults',
      key: 'expectedResults',
      width: 200,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => showAddToModal(record)}
        >
          Add to
        </Button>
      ),
    },
  ];

  const dropdownRender = (menu) => (
    <>
      {menu}
      <Divider style={{ margin: '8px 0' }} />
      <Space style={{ padding: '0 8px 4px' }}>
        <Input
          placeholder="Enter new document name"
          value={newDocName}
          onChange={(e) => setNewDocName(e.target.value)}
        />
        <Button type="text" icon={<PlusOutlined />} onClick={addNewDocument}>
          Add
        </Button>
      </Space>
    </>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16 }}>
        <TextArea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="Enter product requirement here..."
          autoSize={{ minRows: 3, maxRows: 6 }}
          style={{ marginBottom: 16 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleGenerate}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
        >
          Generate
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={cases}
        loading={loading}
        scroll={{ x: 1500 }}
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          showSizeChanger: false
        }}
      />

      <Modal
        title="Add to Document"
        open={isModalVisible}
        onOk={handleAddTo}
        onCancel={handleModalClose}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          name="addToForm"
        >
          <Form.Item
            name="document"
            label="Select Document"
            rules={[{ required: true, message: 'Please select a document!' }]}
          >
            <Select
              placeholder="Choose a document"
              dropdownRender={dropdownRender}
              options={documents}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AICasesTable;
