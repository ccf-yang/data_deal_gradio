import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const { Option } = Select;

const GroupModal = ({ open, onClose, onSave, apis }) => {
  const [form] = Form.useForm();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    if (open) {
      loadGroups();
    }
  }, [open]);

  const loadGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/groups`);
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/groups`, {
        name: newGroupName
      });
      await loadGroups();
      form.setFieldsValue({ group: newGroupName });
      setNewGroupName('');
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      await onSave(values.group);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Failed to save to group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add APIs to Group"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          name="group"
          label="Select Group"
          rules={[{ required: true, message: 'Please select or create a group' }]}
        >
          <Select
            placeholder="Select a group"
            dropdownRender={menu => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Space style={{ padding: '0 8px 4px' }}>
                  <Input
                    placeholder="Enter new group name"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    onKeyDown={e => e.stopPropagation()}
                  />
                  <Button type="text" icon={<PlusOutlined />} onClick={handleCreateGroup}>
                    Create
                  </Button>
                </Space>
              </>
            )}
          >
            {groups.map(group => (
              <Option key={group.name} value={group.name}>
                {group.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
            Save to Group
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GroupModal;
