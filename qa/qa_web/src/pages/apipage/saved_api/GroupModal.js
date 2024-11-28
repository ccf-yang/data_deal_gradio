import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, Divider, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getGroups, createGroup } from '../../../api/groupApiService';

const { Option } = Select;

const GroupModal = ({ visible, onClose, onSave, apis }) => {
  const [form] = Form.useForm();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    if (visible) {
      loadGroups();
    }
  }, [visible]);

  const loadGroups = async () => {
    try {
      const response = await getGroups();
      const groupNames = Array.isArray(response) ? response.map(group => group.name) : [];
      setGroups(groupNames);
    } catch (error) {
      console.error('Failed to load groups:', error);
      message.error('Failed to load groups');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      message.warning('Please enter a group name');
      return;
    }
    
    try {
      setLoading(true);
      await createGroup(newGroupName);
      message.success('Group created successfully');
      await loadGroups();
      form.setFieldsValue({ group: newGroupName });
      setNewGroupName('');
    } catch (error) {
      console.error('Failed to create group:', error);
      message.error('Failed to create group');
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
      visible={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <Form.Item
          name="group"
          label="Select or Create Group"
          rules={[{ required: true, message: 'Please select or create a group' }]}
        >
          <Select
            placeholder="Select a group or create new"
            dropdownRender={menu => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Space style={{ padding: '0 8px 4px' }}>
                  <Input
                    placeholder="Enter new group name"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateGroup(e);
                      }
                    }}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateGroup}
                    loading={loading}
                  >
                    Add
                  </Button>
                </Space>
              </>
            )}
          >
            {groups.map(group => (
              <Option key={group} value={group}>
                {group}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GroupModal;
