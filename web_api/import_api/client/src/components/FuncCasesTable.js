import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Row, Col, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, UserSwitchOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const FuncCasesTable = ({ loading }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAllocationModalVisible, setIsAllocationModalVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [cases, setCases] = useState([
    {
      key: '1',
      id: 'FC001',
      name: 'User Login',
      module: 'Authentication',
      title: 'Verify user login functionality',
      directory: 'auth/login',
      priority: 'High',
      preconditions: 'Valid user credentials exist',
      inputs: 'Username, Password',
      steps: '1. Enter username\n2. Enter password\n3. Click login button',
      expectedResults: 'User successfully logged in',
      document: 'doc1'
    },
    {
      key: '2',
      id: 'FC002',
      name: 'Data Export',
      module: 'Data Management',
      title: 'Export user data to CSV',
      directory: 'data/export',
      priority: 'Medium',
      preconditions: 'User has data to export',
      inputs: 'Export format, Date range',
      steps: '1. Select format\n2. Choose date range\n3. Click export',
      expectedResults: 'Data exported in correct format',
      document: 'doc2'
    }
  ]);
  const [items, setItems] = useState([
    { value: 'item1', label: 'Item 1' },
    { value: 'item2', label: 'Item 2' },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [allocationForm] = Form.useForm();
  const [form] = Form.useForm();

  // Mock data for documents, modules, and persons
  const documents = [
    { value: 'doc1', label: 'Document 1' },
    { value: 'doc2', label: 'Document 2' },
    { value: 'doc3', label: 'Document 3' },
  ];

  const modules = [
    { value: 'Authentication', label: 'Authentication' },
    { value: 'Data Management', label: 'Data Management' },
    { value: 'User Profile', label: 'User Profile' },
    { value: 'Settings', label: 'Settings' },
  ];

  const persons = [
    { value: 'person1', label: 'John Doe' },
    { value: 'person2', label: 'Jane Smith' },
    { value: 'person3', label: 'Bob Johnson' },
  ];

  const showCreateModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const newCase = {
        ...values,
        key: Date.now().toString(),
      };
      setCases([...cases, newCase]);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = () => {
    const selectedKeys = selectedRows.map(row => row.key);
    setCases(cases.filter(item => !selectedKeys.includes(item.key)));
    setSelectedRows([]);
  };

  const handleDocumentChange = (value) => {
    setSelectedDocument(value);
  };

  const showAllocationModal = () => {
    if (selectedRows.length === 0) {
      return;
    }
    allocationForm.resetFields();
    setIsAllocationModalVisible(true);
  };

  const handleAllocationModalClose = () => {
    setIsAllocationModalVisible(false);
    allocationForm.resetFields();
    setNewItemName('');
  };

  const handleAllocation = async () => {
    try {
      const values = await allocationForm.validateFields();
      console.log('Allocating cases:', selectedRows);
      console.log('Allocation details:', values);
      setIsAllocationModalVisible(false);
      allocationForm.resetFields();
      setNewItemName('');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const addNewItem = (e) => {
    e.preventDefault();
    if (!newItemName) return;
    
    const newItem = {
      label: newItemName,
      value: `item${Date.now()}`,
    };
    
    setItems([...items, newItem]);
    setNewItemName('');
    allocationForm.setFieldsValue({ itemName: newItem.value });
  };

  const dropdownRender = (menu) => (
    <>
      {menu}
      <Divider style={{ margin: '8px 0' }} />
      <Space style={{ padding: '0 8px 4px' }}>
        <Input
          placeholder="Enter new item name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <Button type="text" icon={<PlusOutlined />} onClick={addNewItem}>
          Add
        </Button>
      </Space>
    </>
  );

  const filteredCases = selectedDocument
    ? cases.filter(item => item.document === selectedDocument)
    : cases;

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
      title: '所属目录',
      dataIndex: 'directory',
      key: 'directory',
      width: 150,
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
  ];

  const rowSelection = {
    selectedRowKeys: selectedRows.map(row => row.key),
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Create
          </Button>
        </Col>
        <Col>
          <Select
            placeholder="Select Document"
            style={{ width: 200 }}
            onChange={handleDocumentChange}
            value={selectedDocument}
            allowClear
            options={documents}
          />
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<UserSwitchOutlined />}
            onClick={showAllocationModal}
            disabled={selectedRows.length === 0}
            style={{ background: '#44bd37', borderColor: '#44bd37' }}
          >
            Allocation ({selectedRows.length})
          </Button>
        </Col>
        <Col>
          <Button
            danger
            type="primary"
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            disabled={selectedRows.length === 0}
          >
            Delete ({selectedRows.length})
          </Button>
        </Col>
      </Row>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredCases}
        loading={loading}
        scroll={{ x: 1500 }}
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          showSizeChanger: false
        }}
      />

      <Modal
        title="Create Function Test Case"
        open={isModalVisible}
        onOk={handleCreate}
        onCancel={handleModalClose}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          name="createCaseForm"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="id"
                label="ID"
                rules={[{ required: true, message: 'Please input ID!' }]}
              >
                <Input placeholder="Enter ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please input name!' }]}
              >
                <Input placeholder="Enter name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="module"
                label="所属模块"
                rules={[{ required: true, message: 'Please select module!' }]}
              >
                <Select
                  placeholder="Select module"
                  options={modules}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="document"
                label="Belongs Document"
                rules={[{ required: true, message: 'Please select document!' }]}
              >
                <Select
                  placeholder="Select document"
                  options={documents}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="测试标题"
            rules={[{ required: true, message: 'Please input title!' }]}
          >
            <Input placeholder="Enter test title" />
          </Form.Item>

          <Form.Item
            name="directory"
            label="所属目录"
            rules={[{ required: true, message: 'Please input directory!' }]}
          >
            <Input placeholder="Enter directory" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="重要级别"
            rules={[{ required: true, message: 'Please select priority!' }]}
          >
            <Select placeholder="Select priority">
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="preconditions"
            label="前置条件"
            rules={[{ required: true, message: 'Please input preconditions!' }]}
          >
            <TextArea placeholder="Enter preconditions" autoSize={{ minRows: 2 }} />
          </Form.Item>

          <Form.Item
            name="inputs"
            label="测试输入"
            rules={[{ required: true, message: 'Please input test inputs!' }]}
          >
            <TextArea placeholder="Enter test inputs" autoSize={{ minRows: 2 }} />
          </Form.Item>

          <Form.Item
            name="steps"
            label="操作步骤"
            rules={[{ required: true, message: 'Please input steps!' }]}
          >
            <TextArea placeholder="Enter operation steps" autoSize={{ minRows: 3 }} />
          </Form.Item>

          <Form.Item
            name="expectedResults"
            label="预期结果"
            rules={[{ required: true, message: 'Please input expected results!' }]}
          >
            <TextArea placeholder="Enter expected results" autoSize={{ minRows: 2 }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Allocate Cases"
        open={isAllocationModalVisible}
        onOk={handleAllocation}
        onCancel={handleAllocationModalClose}
        width={400}
      >
        <Form
          form={allocationForm}
          layout="vertical"
          name="allocationForm"
        >
          <Form.Item
            name="itemName"
            label="Item Name"
            rules={[{ required: true, message: 'Please select or create an item!' }]}
          >
            <Select
              placeholder="Select or create item"
              dropdownRender={dropdownRender}
              options={items}
            />
          </Form.Item>

          <Form.Item
            name="assignedPerson"
            label="Assigned Person"
            rules={[{ required: true, message: 'Please select an assigned person!' }]}
          >
            <Select
              placeholder="Select person"
              options={persons}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FuncCasesTable;
