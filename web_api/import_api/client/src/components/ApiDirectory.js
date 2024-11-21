import React, { useState } from 'react';
import './ApiDirectory.css';

const ApiDirectory = ({ apis, onSelect, selectedApi }) => {
  const [expandedDirs, setExpandedDirs] = useState(new Set());

  // 将API按目录分组
  const groupedApis = apis.reduce((acc, api) => {
    const directory = api.directory || 'default';
    if (!acc[directory]) {
      acc[directory] = [];
    }
    acc[directory].push(api);
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

  return (
    <div className="api-directory">
      {Object.entries(groupedApis).map(([directory, dirApis]) => (
        <div key={directory} className="directory-group">
          <div 
            className="directory-header" 
            onClick={() => toggleDirectory(directory)}
          >
            <span className={`arrow ${expandedDirs.has(directory) ? 'expanded' : ''}`}>
              ▶
            </span>
            <span className="directory-name">📁 {directory}</span>
            <span className="api-count">({dirApis.length})</span>
          </div>
          
          {expandedDirs.has(directory) && (
            <div className="api-list">
              {dirApis.map((api) => (
                <div 
                  key={api.id || `${directory}-${api.name}`} 
                  className={`api-item ${selectedApi?.name === api.name ? 'selected' : ''}`}
                  onClick={() => onSelect(api)}
                >
                  <span className="api-icon">📄</span>
                  {api.name}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ApiDirectory;
