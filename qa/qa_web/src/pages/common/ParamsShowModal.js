import React, { useState } from 'react';
import { Modal, Button, Input, message } from 'antd';
import { updateApiCode } from '../../api/groupApiService';

const ParamsShowModal = ({ visible, onClose, testcasesCode, currentApi, onReload }) => {
  const [editableCode, setEditableCode] = useState(testcasesCode);
  const [loading, setLoading] = useState(false);

  // 当 testcasesCode 改变时更新 editableCode
  React.useEffect(() => {
    setEditableCode(testcasesCode);
  }, [testcasesCode]);

  const handleUpdate = async () => {
    if (!currentApi) {
      message.error('No API selected');
      return;
    }

    try {
      setLoading(true);
      await updateApiCode({
        api_method: currentApi.method,
        api_path: currentApi.path,
        directory: currentApi.directory,
        testcases_code: editableCode
      });
      
      message.success('Test cases updated successfully');
      if (onReload) {
        onReload();
      }
      onClose();
    } catch (error) {
      console.error('Failed to update test cases:', error);
      message.error('Failed to update test cases');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Test Cases Code For ${currentApi ? `${currentApi.method} ${currentApi.path}` : 'No API Selected'}`}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="update"
          type="primary"
          loading={loading}
          onClick={handleUpdate}
          style={{ marginLeft: 8 }}
        >
          Update
        </Button>
      ]}
      width="60%"
      style={{ 
        top: '10%',
        paddingBottom: 0
      }}
    >
      <Input.TextArea
        value={editableCode}
        onChange={(e) => setEditableCode(e.target.value)}
        style={{ 
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          height: 'calc(60vh - 200px)',
          marginBottom: '16px',
          fontFamily: 'monospace',
          fontSize: '14px'
        }}
      />
    </Modal>
  );
};

export default ParamsShowModal;
