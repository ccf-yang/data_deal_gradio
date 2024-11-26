import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, Divider } from 'antd';
import { PlusOutlined, FolderOutlined } from '@ant-design/icons';
import { getDirectories, createDirectory } from '../api/savedApiService';

const { Option } = Select;

const DirectoryModal = ({ open, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [directories, setDirectories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newDirectoryName, setNewDirectoryName] = useState('');

  useEffect(() => {
    if (open) {
      loadDirectories();
    }
  }, [open]);

  const loadDirectories = async () => {
    try {
      const data = await getDirectories();
      setDirectories(data);
    } catch (error) {
      console.error('Failed to load directories:', error);
    }
  };

  const handleCreateDirectory = async () => {
    if (!newDirectoryName.trim()) return;
    
    try {
      setLoading(true);
      await createDirectory(newDirectoryName);
      await loadDirectories();
      setNewDirectoryName('');
      setIsCreatingNew(false);
      form.setFieldsValue({ directory: newDirectoryName });
    } catch (error) {
      console.error('Failed to create directory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onSave(values.directory);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const dropdownRender = (menu) => (
    <div>
      {menu}
      <Divider style={{ margin: '8px 0' }} />
      {isCreatingNew ? (
        <div style={{ padding: '8px', display: 'flex', gap: '8px' }}>
          <Input
            placeholder="New directory name"
            value={newDirectoryName}
            onChange={(e) => setNewDirectoryName(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateDirectory}
            loading={loading}
          >
            Create
          </Button>
          <Button onClick={() => {
            setIsCreatingNew(false);
            setNewDirectoryName('');
          }}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={() => setIsCreatingNew(true)}
          style={{ width: '100%', textAlign: 'left', padding: '8px' }}
        >
          Create New Directory
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      title="Save API to Directory"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="directory"
          label="Select Directory"
          rules={[{ required: true, message: 'Please select or create a directory' }]}
        >
          <Select
            showSearch
            allowClear
            placeholder="Select a directory"
            dropdownRender={dropdownRender}
          >
            {directories.map((dir) => (
              <Option key={dir} value={dir}>
                <Space>
                  <FolderOutlined />
                  {dir}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DirectoryModal;
