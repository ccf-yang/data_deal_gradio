import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getEnvironments, createEnvironment, updateEnvironment, deleteEnvironment } from '../api/environmentService';

const EnvironmentTable = ({ loading: parentLoading }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [environments, setEnvironments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState(null);
  const [form] = Form.useForm();

  // Fetch environments on component mount
  useEffect(() => {
    fetchEnvironments();
  }, []);

  const fetchEnvironments = async () => {
    try {
      setLoading(true);
      const response = await getEnvironments();
      if (response.environments) {
        setEnvironments(response.environments.map(env => ({
          ...env,
          key: env.name // Use name as key since it's unique
        })));
      }
    } catch (error) {
      console.error('Failed to fetch environments:', error);
      message.error('Failed to fetch environments');
    } finally {
      setLoading(false);
    }
  };

  const showCreateModal = () => {
    setEditingEnvironment(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditingEnvironment(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingEnvironment(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingEnvironment) {
        // Update existing environment
        await updateEnvironment({
          ...values,
          name: editingEnvironment.name // Always use the original name when updating
        });
        message.success('Environment updated successfully');
      } else {
        // Create new environment
        await createEnvironment(values);
        message.success('Environment created successfully');
      }

      // Close modal and reset form
      setIsModalVisible(false);
      form.resetFields();
      
      // Fetch updated data
      const response = await getEnvironments();
      if (response.environments) {
        setEnvironments(response.environments.map(env => ({
          ...env,
          key: env.name
        })));
      }
    } catch (error) {
      console.error('Operation failed:', error);
      message.error(editingEnvironment ? 'Failed to update environment' : 'Failed to create environment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      setLoading(true);
      await deleteEnvironment(record.name);
      message.success('Environment deleted successfully');
      
      // Fetch updated data
      const response = await getEnvironments();
      if (response.environments) {
        setEnvironments(response.environments.map(env => ({
          ...env,
          key: env.name
        })));
      }
    } catch (error) {
      console.error('Failed to delete environment:', error);
      message.error('Failed to delete environment');
    } finally {
      setLoading(false);
    }
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
      dataIndex: 'secret_key',
      key: 'secret_key',
      render: (text) => text ? <span>{'*'.repeat(8)}</span> : '',
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
            onClick={() => showEditModal(record)}
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
        loading={loading || parentLoading}
        size="middle"
        pagination={false}
        style={{ flex: 1 }}
      />
      <Modal
        title={editingEnvironment ? "Edit Environment" : "Create Environment"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleModalClose}
        confirmLoading={loading}
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
            <Input 
              placeholder="Environment name" 
              disabled={!!editingEnvironment} // Disable name field when editing
            />
          </Form.Item>
          <Form.Item
            name="host"
            label="Host"
            rules={[{ required: true, message: 'Please input host!' }]}
          >
            <Input placeholder="Host address" />
          </Form.Item>
          <Form.Item
            name="port"
            label="Port"
            rules={[{ required: true, message: 'Please input port!' }]}
          >
            <Input placeholder="Port number" />
          </Form.Item>
          <Form.Item
            name="secret_key"
            label="Secret Key"
            rules={[{ required: true, message: 'Please input secret key!' }]}
          >
            <Input.Password placeholder="Secret key" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EnvironmentTable;
