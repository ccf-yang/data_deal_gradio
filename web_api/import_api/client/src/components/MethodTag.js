import React from 'react';
import { Tag } from 'antd';

const methodColors = {
  GET: '#87d068',
  POST: '#108ee9',
  PUT: '#2db7f5',
  DELETE: '#f50',
  PATCH: '#722ed1',
  HEAD: '#666',
  OPTIONS: '#666',
};

export const MethodTag = ({ method }) => {
  const color = methodColors[method.toUpperCase()] || '#666';
  
  return (
    <Tag color={color} style={{ minWidth: '60px', textAlign: 'center' }}>
      {method.toUpperCase()}
    </Tag>
  );
};
