import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const EnvironmentTable = ({ loading }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [environments, setEnvironments] = useState([]);
  const [form] = Form.useForm();

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
      const newEnvironment = {
        ...values,
        key: Date.now().toString(),
      };
      setEnvironments([...environments, newEnvironment]);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = (record) => {
    setEnvironments(environments.filter(env => env.key !== record.key));
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ color: '#1890ff', fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
    },
    {
      title: 'Secret Key',
      dataIndex: 'secretKey',
      key: 'secretKey',
      render: (text) => <span>{'*'.repeat(text.length)}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => console.log('Edit:', record)}
            style={{ background: '#1890ff', borderColor: '#1890ff' }}
          >
            Edit
          </Button>
          <Button
            danger
            type="primary"
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
        >
          Create Environment
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={environments}
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          showSizeChanger: false
        }}
      />

      <Modal
        title="Create Environment"
        open={isModalVisible}
        onOk={handleCreate}
        onCancel={handleModalClose}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          name="environmentForm"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input environment name!' }]}
          >
            <Input placeholder="Enter environment name" />
          </Form.Item>

          <Form.Item
            name="host"
            label="Host"
            rules={[{ required: true, message: 'Please input host!' }]}
          >
            <Input placeholder="Enter host" />
          </Form.Item>

          <Form.Item
            name="port"
            label="Port"
            rules={[
              { required: true, message: 'Please input port!' },
              { pattern: /^\d+$/, message: 'Port must be a number!' }
            ]}
          >
            <Input placeholder="Enter port" />
          </Form.Item>

          <Form.Item
            name="secretKey"
            label="Secret Key"
            rules={[{ required: true, message: 'Please input secret key!' }]}
          >
            <Input.Password placeholder="Enter secret key" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EnvironmentTable;
