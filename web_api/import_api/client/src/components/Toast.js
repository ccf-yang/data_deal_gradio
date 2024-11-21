import React from 'react';
import './Toast.css';

const Toast = ({ message, type, visible }) => {
  return (
    <div className={`toast ${type} ${visible ? 'visible' : ''}`}>
      {type === 'success' && <i className="fas fa-check-circle"></i>}
      {type === 'error' && <i className="fas fa-times-circle"></i>}
      <span>{message}</span>
    </div>
  );
};

export default Toast;
