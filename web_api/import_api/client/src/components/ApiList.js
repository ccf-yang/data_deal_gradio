import React from 'react';
import './ApiList.css';

const ApiList = ({ apis, onSelect, selectedApi }) => {
  const getMethodColor = (method) => {
    const colors = {
      get: '#61affe',
      post: '#49cc90',
      put: '#fca130',
      delete: '#f93e3e',
      patch: '#50e3c2',
      options: '#0d5aa7',
      head: '#9012fe',
    };
    return colors[method?.toLowerCase()] || '#999999';
  };

  return (
    <div className="api-list-container">
      {apis.map((api) => (
        <div
          key={api.id || api.name}
          className={`api-list-item ${selectedApi?.name === api.name ? 'selected' : ''}`}
          onClick={() => onSelect(api)}
          title={api.description || ''} 
        >
          <div className="api-method-path">
            <span 
              className="api-method"
              style={{ backgroundColor: getMethodColor(api.method) }}
            >
              {api.method?.toUpperCase() || 'GET'}
            </span>
            <span className="api-path">{api.path || api.name}</span>
          </div>
        </div>
      ))}
      {apis.length === 0 && (
        <div className="no-apis">
          No APIs imported yet. Import an API using the controls above.
        </div>
      )}
    </div>
  );
};

export default ApiList;
