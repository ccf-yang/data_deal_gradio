import React from 'react';
import { Card, Descriptions, Tag, Typography, Table, Tabs, Space } from 'antd';
import { MethodTag } from './MethodTag';
import { CodeOutlined, TableOutlined } from '@ant-design/icons';
import './ApiDetailView.css';

const { Title, Paragraph, Text } = Typography;

const ApiDetailView = ({ api }) => {
  if (!api) return null;

  // For debugging - remove in production
  console.log('API Data:', api);

  const endpoint = api.selectedEndpoint || api;
  const method = (endpoint.method || 'GET').toUpperCase();
  const path = endpoint.path || '';

  const renderJsonContent = (content) => {
    if (!content) return null;
    try {
      const formattedJson = typeof content === 'string' ? JSON.parse(content) : content;
      return (
        <pre style={{ 
          background: '#f6f8fa', 
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          overflow: 'auto',
          maxHeight: '400px',
          margin: '0'
        }}>
          {JSON.stringify(formattedJson, null, 2)}
        </pre>
      );
    } catch (e) {
      return <Text type="secondary">Invalid JSON format</Text>;
    }
  };

  const renderParameters = (parameters, type) => {
    if (!parameters || parameters.length === 0) {
      return <Text type="secondary">No {type} parameters</Text>;
    }

    const filteredParams = parameters.filter(param => param.in === type);
    
    if (filteredParams.length === 0) {
      return <Text type="secondary">No {type} parameters</Text>;
    }

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <Text strong>{text}</Text>,
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        width: 120,
      },
      {
        title: 'Required',
        dataIndex: 'required',
        key: 'required',
        width: 100,
        render: (required) => (
          <Tag color={required ? 'red' : 'default'}>
            {required ? 'Required' : 'Optional'}
          </Tag>
        ),
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'Value',
        dataIndex: 'value',
        key: 'value',
        render: (value) => value ? <Tag color="blue">{value}</Tag> : null,
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={filteredParams.map((param, index) => ({
          ...param,
          key: index,
        }))}
        pagination={false}
        size="small"
        bordered
      />
    );
  };

  const renderRequestBody = () => {
    const requestBody = endpoint.requestBody || endpoint.body;
    if (!requestBody?.content?.['application/json']?.schema) {
      return <Text type="secondary">No request body</Text>;
    }

    const schema = requestBody.content['application/json'].schema;
    const properties = schema.properties || {};
    const required = schema.required || [];

    const columns = [
      {
        title: 'Field',
        dataIndex: 'field',
        key: 'field',
        render: (text) => <Text strong>{text}</Text>,
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        width: 120,
        render: (type) => <Tag color="blue">{type}</Tag>,
      },
      {
        title: 'Required',
        dataIndex: 'required',
        key: 'required',
        width: 100,
        render: (isRequired) => (
          <Tag color={isRequired ? 'red' : 'default'}>
            {isRequired ? 'Required' : 'Optional'}
          </Tag>
        ),
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
      },
    ];

    const dataSource = Object.entries(properties).map(([field, details]) => ({
      key: field,
      field,
      type: details.type,
      required: required.includes(field),
      description: details.description || '-',
    }));

    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        bordered
        style={{ background: '#fff' }}
      />
    );
  };

  const renderResponses = () => {
    const responseData = endpoint.response || endpoint.responses;
    if (!responseData) return <Text type="secondary">No response information available</Text>;

    // If it's a response object with status codes
    if (typeof responseData === 'object' && !Array.isArray(responseData)) {
      return Object.entries(responseData).map(([status, response]) => {
        const schema = response?.content?.['application/json']?.schema;
        if (!schema) return null;

        const properties = schema.properties || {};
        const required = schema.required || [];

        const columns = [
          {
            title: 'Field',
            dataIndex: 'field',
            key: 'field',
            render: (text) => <Text strong>{text}</Text>,
          },
          {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (type) => <Tag color="blue">{type}</Tag>,
          },
          {
            title: 'Required',
            dataIndex: 'required',
            key: 'required',
            width: 100,
            render: (isRequired) => (
              <Tag color={isRequired ? 'red' : 'default'}>
                {isRequired ? 'Required' : 'Optional'}
              </Tag>
            ),
          },
          {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
          },
        ];

        const dataSource = Object.entries(properties).map(([field, details]) => ({
          key: field,
          field,
          type: details.type,
          required: required.includes(field),
          description: details.description || '-',
        }));

        return (
          <Card 
            key={status}
            size="small" 
            title={
              <Space>
                <Tag color={status.startsWith('2') ? 'success' : status.startsWith('4') ? 'error' : 'warning'}>
                  {status}
                </Tag>
                <Text>{response.description}</Text>
              </Space>
            }
            style={{ marginBottom: 16 }}
            bordered
          >
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              size="small"
              bordered
              style={{ background: '#fff' }}
            />
          </Card>
        );
      });
    }

    // If it's a direct response object
    return (
      <Card size="small" bordered={false} style={{ background: '#f6f8fa' }}>
        {renderJsonContent(responseData)}
      </Card>
    );
  };

  const items = [
    {
      key: 'params',
      label: (
        <span>
          <TableOutlined /> Parameters
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <Title level={5}>Query Parameters</Title>
            {renderParameters(endpoint.parameters, 'query')}
          </div>
          <div>
            <Title level={5}>Headers</Title>
            {renderParameters(endpoint.parameters, 'header')}
          </div>
          <div>
            <Title level={5}>Path Parameters</Title>
            {renderParameters(endpoint.parameters, 'path')}
          </div>
        </div>
      ),
    },
    {
      key: 'body',
      label: (
        <span>
          <CodeOutlined /> Request Body
        </span>
      ),
      children: renderRequestBody(),
    },
    {
      key: 'response',
      label: (
        <span>
          <CodeOutlined /> Response
        </span>
      ),
      children: renderResponses(),
    },
  ];

  return (
    <div className="api-detail">
      <Card>
        <Title level={3} style={{ marginBottom: 24 }}>
          <MethodTag method={method} /> {path}
        </Title>

        {endpoint.description && (
          <Paragraph style={{ marginBottom: 24 }}>{endpoint.description}</Paragraph>
        )}

        <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
          {endpoint.consumes && (
            <Descriptions.Item label="Content-Type">
              {endpoint.consumes.map(type => (
                <Tag key={type}>{type}</Tag>
              ))}
            </Descriptions.Item>
          )}
          {endpoint.produces && (
            <Descriptions.Item label="Accepts">
              {endpoint.produces.map(type => (
                <Tag key={type}>{type}</Tag>
              ))}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Tabs 
          items={items}
          type="card"
          style={{ 
            background: '#fafafa',
            padding: '16px',
            borderRadius: '8px'
          }}
        />
      </Card>
    </div>
  );
};

export default ApiDetailView;
