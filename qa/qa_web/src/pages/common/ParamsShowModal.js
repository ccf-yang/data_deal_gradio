import React, { useState, useEffect } from 'react';
import { Modal, message, Table, Input, Form, InputNumber } from 'antd';
import { updateApiCode } from '../../api/groupApiService';

const ParamsShowModal = ({ visible, onCancel, currentApi, testCasesCode, onSuccess }) => {
  const [editableCode, setEditableCode] = useState(testCasesCode);
  const [editingKey, setEditingKey] = useState('');
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    setEditableCode(testCasesCode);
  }, [testCasesCode]);

  useEffect(() => {
    const { columns, dataSource } = formatDataForTable(editableCode);
    setDataSource(dataSource);
  }, [editableCode]);

  const handleOk = async () => {
    try {
      // 如果当前有正在编辑的行，先保存
      if (editingKey) {
        await save(editingKey);
      }

      // 使用最新的 dataSource 重新构建 editableCode
      const endpoint = Object.keys(editableCode)[0];
      const scenarios = { ...editableCode[endpoint] };

      // 遍历 scenarios，使用 dataSource 更新值
      const updatedScenarios = Object.keys(scenarios).reduce((acc, scenarioKey) => {
        acc[scenarioKey] = scenarios[scenarioKey].map(param => {
          // 在 dataSource 中找到对应的值
          const matchedRow = dataSource.find(row => 
            row.scenario === scenarioKey && row[param.apiname] !== undefined
          );
          
          return matchedRow 
            ? { ...param, value: matchedRow[param.apiname] } 
            : param;
        });
        return acc;
      }, {});

      // 更新 editableCode 状态
      const finalEditableCode = {
        [endpoint]: updatedScenarios
      };
      setEditableCode(finalEditableCode);

      const dataToSend = typeof finalEditableCode === 'object' 
        ? JSON.stringify(finalEditableCode) 
        : finalEditableCode;

      console.log('Final Update Data:', finalEditableCode);

      await updateApiCode({
        api_method: currentApi.method,
        api_path: currentApi.path,
        directory: currentApi.directory,
        body_params: dataToSend
      });
      
      message.success('Test cases updated successfully');
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Failed to update test cases:', error);
      message.error('Failed to update test cases');
    }
  };

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);
      
      if (index > -1) {
        const item = newData[index];
        const updatedItem = { ...item, ...row };
        newData.splice(index, 1, updatedItem);
        
        // 更新 editableCode 状态，基于最新的 dataSource
        setEditableCode(prevState => {
          const endpoint = Object.keys(prevState)[0];
          const scenarios = { ...prevState[endpoint] };
          
          // 遍历所有场景，使用 dataSource 更新值
          const updatedScenarios = Object.keys(scenarios).reduce((acc, scenarioKey) => {
            acc[scenarioKey] = scenarios[scenarioKey].map(param => {
              // 找到对应场景和参数名的行
              const matchedRow = newData.find(row => 
                row.scenario === scenarioKey && row[param.apiname] !== undefined
              );
              
              return matchedRow 
                ? { ...param, value: matchedRow[param.apiname] } 
                : param;
            });
            return acc;
          }, {});

          return {
            [endpoint]: {
              ...scenarios,
              ...updatedScenarios
            }
          };
        });

        setDataSource(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setDataSource(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const formatDataForTable = (data) => {
    if (!data) return { columns: [], dataSource: [] };
    
    try {
      const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
      
      const endpoint = Object.keys(jsonData)[0];
      const scenarios = jsonData[endpoint];
      
      if (!scenarios) {
        return { columns: [], dataSource: [] };
      }

      const paramNames = new Set();
      Object.values(scenarios).forEach(scenarioData => {
        if (Array.isArray(scenarioData)) {
          scenarioData.forEach(param => {
            if (param && param.apiname) {
              paramNames.add(param.apiname);
            }
          });
        }
      });

      const columns = [
        {
          title: '场景',
          dataIndex: 'scenario',
          key: 'scenario',
          width: 150,
          fixed: 'left'
        },
        ...Array.from(paramNames).map(paramName => ({
          title: paramName,
          dataIndex: paramName,
          key: paramName,
          width: 150,
          editable: true,
          render: (text, record) => {
            const editable = isEditing(record);
            return editable ? (
              <EditableCell
                editing={editable}
                dataIndex={paramName}
                title={paramName}
                inputType="text"
                record={record}
                index={record.key}
              >
                {text}
              </EditableCell>
            ) : (
              text
            );
          }
        })),
        {
          title: '操作',
          dataIndex: 'operation',
          width: 150,
          fixed: 'right',
          render: (_, record) => {
            const editable = isEditing(record);
            return editable ? (
              <span>
                <a onClick={() => save(record.key)} style={{ marginRight: 8 }}>
                  保存
                </a>
                <a onClick={cancel}>取消</a>
              </span>
            ) : (
              <a disabled={editingKey !== ''} onClick={() => edit(record)}>
                编辑
              </a>
            );
          }
        }
      ];

      const dataSource = Object.entries(scenarios).map(([scenarioName, paramsList]) => {
        const row = { key: scenarioName, scenario: scenarioName };
        if (Array.isArray(paramsList)) {
          paramsList.forEach(param => {
            if (param && param.apiname) {
              row[param.apiname] = param.value;
            }
          });
        }
        return row;
      });

      return { columns, dataSource };
    } catch (error) {
      return { columns: [], dataSource: [] };
    }
  };

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === 'number' ? (
      <InputNumber 
        style={{ width: '100%' }} 
        onKeyDown={(e) => e.stopPropagation()}
      />
    ) : (
      <Input 
        style={{ width: '100%' }} 
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
      />
    );

    useEffect(() => {
      if (editing) {
        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
      }
    }, [editing, record, dataIndex, form]);

    return (
      <td {...restProps}>
        {editing ? (
          <Form form={form}>
            <Form.Item
              name={dataIndex}
              style={{ margin: 0 }}
              rules={[
                {
                  required: false,
                  message: `Please Input ${title}!`,
                },
              ]}
            >
              {inputNode}
            </Form.Item>
          </Form>
        ) : (
          children
        )}
      </td>
    );
  };

  const { columns } = formatDataForTable(editableCode);

  const finalColumns = columns.length > 0 ? columns : [
    {
      title: '场景',
      dataIndex: 'scenario',
      key: 'scenario'
    }
  ];

  return (
    <Modal
      title="测试用例参数"
      visible={visible}  
      open={visible}     
      onOk={handleOk}
      onCancel={onCancel}
      width={1000}
      style={{ top: 20 }}
      destroyOnClose
      forceRender
    >
      <Table
        components={{
          body: {
            cell: EditableCell
          }
        }}
        columns={finalColumns}
        dataSource={dataSource}
        scroll={{ x: 'max-content', y: 400 }}
        pagination={false}
        bordered
      />
    </Modal>
  );
};

export default ParamsShowModal;
