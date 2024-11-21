import React, { useState } from 'react';
import './ApiDirectory.css';

const ApiDirectory = ({ apis, onSelect, selectedApi }) => {
  const [expandedDirs, setExpandedDirs] = useState(new Set());

  // 将API按目录分组
  const groupedApis = apis.reduce((acc, api) => {
    const paths = (api.directory || 'default').split('/').filter(Boolean);
    let current = acc;
    
    // Create nested directory structure
    paths.forEach((path, index) => {
      if (!current[path]) {
        current[path] = {
          isDirectory: true,
          items: {},
          path: paths.slice(0, index + 1).join('/')
        };
      }
      current = current[path].items;
    });
    
    // Add the API to the deepest level
    const apiKey = api.name;
    current[apiKey] = {
      isDirectory: false,
      api: api
    };
    
    return acc;
  }, {});

  const toggleDirectory = (directory) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(directory)) {
      newExpanded.delete(directory);
    } else {
      newExpanded.add(directory);
    }
    setExpandedDirs(newExpanded);
  };

  const renderTree = (items, level = 0) => {
    return Object.entries(items).map(([key, value]) => {
      if (value.isDirectory) {
        const isExpanded = expandedDirs.has(value.path);
        return (
          <div key={value.path} className="directory-group" style={{ marginLeft: `${level * 20}px` }}>
            <div 
              className="directory-header" 
              onClick={() => toggleDirectory(value.path)}
            >
              <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>
                ▶
              </span>
              <span className="directory-name">📁 {key}</span>
              <span className="api-count">
                ({Object.values(value.items).filter(item => !item.isDirectory).length})
              </span>
            </div>
            
            {isExpanded && (
              <div className="api-list">
                {renderTree(value.items, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div 
            key={value.api.id || value.api.name}
            className={`api-item ${selectedApi?.name === value.api.name ? 'selected' : ''}`}
            onClick={() => onSelect(value.api)}
            style={{ marginLeft: `${level * 20}px` }}
          >
            <span className="api-icon">📄</span>
            {value.api.name}
          </div>
        );
      }
    });
  };

  return (
    <div className="api-directory">
      {renderTree(groupedApis)}
    </div>
  );
};

export default ApiDirectory;
