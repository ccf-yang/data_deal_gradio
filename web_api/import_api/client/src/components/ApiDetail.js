import React, { useState } from 'react';
import './ApiDetail.css';

const ApiDetail = ({ api, onSave, isSaved }) => {
  const [activeParamTab, setActiveParamTab] = useState('query');

  if (!api) {
    return <div className="api-detail">No API selected</div>;
  }

  const method = api.method || 'GET';
  const path = api.path || '';
  
  // 将参数按类型分类
  const parameters = api.parameters || [];
  const headerParams = parameters.filter(p => p.in === 'header');
  const queryParams = parameters.filter(p => p.in === 'query');
  const pathParams = parameters.filter(p => p.in === 'path');
  
  // 处理请求体
  const requestBody = api.requestBody || {};
  const hasRequestBody = requestBody && Object.keys(requestBody).length > 0;

  // 处理响应
  const responses = api.responses || {};
  const hasResponses = Object.keys(responses).length > 0;

  const renderParameterTable = (params) => {
    if (!params || params.length === 0) return <p>No parameters</p>;

    return (
      <table className="param-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((param, index) => (
            <tr key={index}>
              <td>{param.name}</td>
              <td>{param.type || param.schema?.type || '-'}</td>
              <td>{param.required ? 'Yes' : 'No'}</td>
              <td>{param.description || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderJsonExample = (schema) => {
    const generateExample = (schema) => {
      if (!schema) return {};

      if (schema.type === 'object' && schema.properties) {
        const example = {};
        Object.entries(schema.properties).forEach(([key, prop]) => {
          example[key] = generateExample(prop);
        });
        return example;
      }

      if (schema.type === 'array' && schema.items) {
        return [generateExample(schema.items)];
      }

      return schema.example || schema.default || schema.type;
    };

    const example = generateExample(schema);
    return <pre>{JSON.stringify(example, null, 2)}</pre>;
  };

  const renderRequestBody = () => {
    if (!hasRequestBody) return <p>No request body</p>;

    let schema = null;

    // 处理不同格式的请求体
    if (requestBody.content && requestBody.content['application/json']) {
      schema = requestBody.content['application/json'].schema;
    } else if (requestBody.schema) {
      schema = requestBody.schema;
    }

    return (
      <div>
        {schema && (
          <div>
            <h4>Request Body Example:</h4>
            {renderJsonExample(schema)}
          </div>
        )}
      </div>
    );
  };

  const renderResponses = () => {
    if (!hasResponses) return <p>No response information available</p>;

    return Object.entries(responses).map(([code, response]) => {
      let schema = null;

      // 处理不同格式的响应
      if (response.content && response.content['application/json']) {
        schema = response.content['application/json'].schema;
      } else if (response.schema) {
        schema = response.schema;
      }

      return (
        <div key={code} className="response-section">
          <h4 className={`status-${code[0]}`}>Status: {code} - {response.description || ''}</h4>
          {schema && (
            <div>
              <h5>Response Example:</h5>
              {renderJsonExample(schema)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="api-detail">
      <div className="api-detail-header">
        <h2>{api.summary || `${method} ${path}`}</h2>
        {!isSaved && (
          <button onClick={() => onSave(api)} className="save-button">
            Save API
          </button>
        )}
      </div>
      <div className="api-detail-content">
        {api.description && (
          <div className="api-description">
            <h3>Description</h3>
            <p>{api.description}</p>
          </div>
        )}
        <div className="api-endpoint">
          <h3>Endpoint</h3>
          <div className="endpoint-info">
            <span className="method">{method}</span>
            <span className="path">{path}</span>
          </div>
        </div>
        <div className="section">
          <h3>Parameters</h3>
          <div className="tabs">
            {queryParams.length > 0 && (
              <button 
                className={`tab ${activeParamTab === 'query' ? 'active' : ''}`}
                onClick={() => setActiveParamTab('query')}
              >
                Query ({queryParams.length})
              </button>
            )}
            {headerParams.length > 0 && (
              <button 
                className={`tab ${activeParamTab === 'header' ? 'active' : ''}`}
                onClick={() => setActiveParamTab('header')}
              >
                Headers ({headerParams.length})
              </button>
            )}
            {pathParams.length > 0 && (
              <button 
                className={`tab ${activeParamTab === 'path' ? 'active' : ''}`}
                onClick={() => setActiveParamTab('path')}
              >
                Path ({pathParams.length})
              </button>
            )}
            {hasRequestBody && (
              <button 
                className={`tab ${activeParamTab === 'body' ? 'active' : ''}`}
                onClick={() => setActiveParamTab('body')}
              >
                Body
              </button>
            )}
          </div>
          <div className="tab-content">
            {activeParamTab === 'query' && renderParameterTable(queryParams)}
            {activeParamTab === 'header' && renderParameterTable(headerParams)}
            {activeParamTab === 'path' && renderParameterTable(pathParams)}
            {activeParamTab === 'body' && renderRequestBody()}
          </div>
        </div>
        <div className="section">
          <h3>Responses</h3>
          {renderResponses()}
        </div>
      </div>
    </div>
  );
};

export default ApiDetail;
