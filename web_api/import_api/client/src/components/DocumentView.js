import React, { useState, useEffect } from 'react';
import './DocumentView.css';

const DocumentView = ({ apis, onSelectApi, selectedApi }) => {
  const [collapsedDocs, setCollapsedDocs] = useState({});

  useEffect(() => {
    if (apis?.length > 0) {
      const initialCollapsedState = {};
      apis.forEach(api => {
        if (api.directory) {
          initialCollapsedState[api.directory] = true; // Set to true to collapse by default
        }
      });
      setCollapsedDocs(initialCollapsedState);
    }
  }, [apis]);

  if (!Array.isArray(apis) || !apis.length) {
    return <div className="no-documents">No APIs available</div>;
  }

  const groupedApis = apis.reduce((acc, api) => {
    const directory = api.directory || 'test';
    if (!acc[directory]) {
      acc[directory] = [];
    }
    acc[directory].push(api);
    return acc;
  }, {});

  const documentNames = Object.keys(groupedApis).sort();

  const toggleDocument = (docName) => {
    setCollapsedDocs(prev => ({
      ...prev,
      [docName]: !prev[docName]
    }));
  };

  const getMethodColor = (method) => ({
    get: '#61affe',
    post: '#49cc90',
    put: '#fca130',
    delete: '#f93e3e',
    patch: '#50e3c2'
  }[method?.toLowerCase()] || '#999999');
  
  return (
    <div className="document-view">
      {documentNames.map((docName) => (
        <div key={docName} className="document-section">
          <div 
            className={`document-header ${collapsedDocs[docName] ? 'collapsed' : ''}`}
            onClick={() => toggleDocument(docName)}
          >
            <h3>
              <span className="folder-icon">▼</span>
              {docName}
              <span className="api-count">({groupedApis[docName].length})</span>
            </h3>
          </div>
          <div className={`api-list ${collapsedDocs[docName] ? 'collapsed' : ''}`}>
            {groupedApis[docName].map((api) => (
              <div
                key={`${api.path}-${api.method}`}
                className={`api-item ${selectedApi === api ? 'selected' : ''}`}
                onClick={() => onSelectApi(api)}
              >
                <span 
                  className={`method ${api.method.toLowerCase()}`}
                  style={{
                    backgroundColor: `${getMethodColor(api.method)}15`,
                    color: getMethodColor(api.method)
                  }}
                >
                  {api.method}
                </span>
                <span className="path">{api.path}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentView;
