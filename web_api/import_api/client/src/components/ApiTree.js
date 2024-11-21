import React from 'react';
import './ApiTree.css';

const ApiTree = ({ apis, onSelect, selectedApi }) => {
  if (!apis || apis.length === 0) {
    return <div className="api-list">No APIs available</div>;
  }

  const renderApiItem = (api) => {
    const method = (api.method || 'GET').toUpperCase();
    const path = api.path || '';
    
    const isSelected = selectedApi && 
      selectedApi.path === api.path && 
      selectedApi.method === api.method;
    
    const methodClass = `method ${method.toLowerCase()}`;
    
    return (
      <div 
        key={`${method}-${path}`}
        className={`api-item ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(api)}
      >
        <span className={methodClass}>{method}</span>
        <span className="path">{path}</span>
      </div>
    );
  };

  return (
    <div className="api-list">
      {apis.map(renderApiItem)}
    </div>
  );
};

export default ApiTree;
