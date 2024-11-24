import React from 'react';
import { Modal } from 'antd';

const ParamsShowModal = ({ visible, onClose, testcasesCode }) => {
  return (
    <Modal
      title="Test Cases Code"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <pre style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '4px',
        maxHeight: '600px',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word'
      }}>
        {testcasesCode || 'No test cases available'}
      </pre>
    </Modal>
  );
};

export default ParamsShowModal;
