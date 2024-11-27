import React, { useState } from 'react';
import { Table, Button, Space, Modal, Switch, Tooltip, message } from 'antd';
import { 
  EyeOutlined, 
  DeleteOutlined, 
  PlayCircleOutlined, 
  FileAddOutlined,
  BarChartOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { MethodTag } from '../../common/MethodTag';
import ApiDetailView from '../../common/ApiDetailView';
import ParamsShowModal from '../../common/ParamsShowModal';
import { DEFAULT_PAGE_SIZE } from '../../../config';
import {
  deleteApiCode,
  addApiCodeWithoutGroup,
  getApiCode,
  updateApiCode
} from '../../../api/groupApiService';
import { removeApis } from '../../../api/savedApiService';

const SavedApiTable = ({ 
  apis,
  loading,
  onSelect,
  onReload,
  selectedEnvironment,
  autoStates,
  onAutoTestChange,
  selectedRowKeys,
  setSelectedRowKeys,
  currentPage,
  setCurrentPage
}) => {
  const [selectedApi, setSelectedApi] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isParamsModalVisible, setIsParamsModalVisible] = useState(false);
  const [paramsLoading, setParamsLoading] = useState(false);
  const [currentTestCasesCode, setCurrentTestCasesCode] = useState('');
  const pageSize = DEFAULT_PAGE_SIZE;

  const handleDelete = async (record) => {
    Modal.confirm({
      title: 'Delete API',
      content: `Are you sure you want to delete "${record.path}" from "${record.directory}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await removeApis([record], record.directory);

          try {
            const apiCode = await getApiCode({
              api_method: record.method,
              api_path: record.path,
              directory: record.directory
            });

            if (apiCode) {
              await deleteApiCode({
                api_method: record.method,
                api_path: record.path,
                directory: record.directory
              });
            }
          } catch (error) {
            console.log('No API code found to delete');
          }

          message.success('API deleted successfully');
          if (onReload) {
            onReload();
          }
        } catch (error) {
          console.error('Delete error:', error);
          message.error(`Failed to delete API: ${error.message}`);
        }
      },
    });
  };

  const handleAddCase = async (record) => {
    try {
      await addApiCodeWithoutGroup({
        api_method: record.method,
        api_path: record.path,
        directory: record.directory,
        bussiness_code: record.bussiness_code || '',
        common_code: record.common_code || '',
        testcases_code: record.testcases_code || '',
        is_auto_test: record.is_auto_test || false,
        report_url: record.report_url || '',
        header_params: record.header_params || '',
        path_params: record.path_params || '',
        query_params: record.query_params || '',
        body_params: record.body_params || '',
        response_params: record.response_params || ''
      });
      message.success('Case added successfully');
      if (onReload) {
        onReload();
      }
    } catch (error) {
      console.error('Failed to add case:', error);
      if (error.response?.data?.error?.includes('UNIQUE constraint failed')) {
        message.warning('This API case already exists');
      } else {
        message.error('Failed to add case');
      }
    }
  };

  const handleParamShow = async (record) => {
    try {
      setParamsLoading(true);
      const response = await getApiCode({
        api_method: record.method,
        api_path: record.path,
        directory: record.directory
      });
      setCurrentTestCasesCode(response.testcases_code);
      setIsParamsModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch API params:', error);
      message.error('请先点击Add Case!');
    } finally {
      setParamsLoading(false);
    }
  };

  const handleRun = (record) => {
    console.log('Run:', record);
  };

  const handleReport = async (record) => {
    try {
      const response = await getApiCode({
        api_method: record.method,
        api_path: record.path,
        directory: record.directory
      });

      if (response && response.report_url) {
        window.open(response.report_url, '_blank');
      } else {
        message.info('Report is not ready, please wait for a while');
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      message.error('Failed to fetch report');
    }
  };

  const handleAutoTestChange = async (record, checked) => {
    try {
      await updateApiCode({
        api_method: record.method,
        api_path: record.path,
        directory: record.directory,
        is_auto_test: checked
      });

      if (onAutoTestChange) {
        onAutoTestChange(record, checked);
      }
    } catch (error) {
      console.error('Failed to update auto test status:', error);
      message.error('Failed to update auto test status');
    }
  };

  const showApiDetail = (record) => {
    setSelectedApi(record);
    setIsModalVisible(true);
    if (onSelect) {
      onSelect(record);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedApi(null);
  };

  const handleParamsModalClose = () => {
    setIsParamsModalVisible(false);
    setCurrentTestCasesCode(null);
  };

  const columns = [
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (method) => <MethodTag method={method} />,
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
      width: 300,
    },
    {
      title: 'Directory',
      dataIndex: 'directory',
      key: 'directory',
      width: 150,
    },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      width: 500,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EyeOutlined />}
            onClick={() => showApiDetail(record)}
            size="small"
            style={{ background: '#1890ff', borderColor: '#1890ff' }}
          >
            Details
          </Button>
          <Tooltip title="将接口生成接口用例">
            <Button
              type="default"
              icon={<FileAddOutlined />}
              onClick={() => handleAddCase(record)}
              size="small"
              style={{ color: '#52c41a', borderColor: '#52c41a' }}
            >
              Add Case
            </Button>
          </Tooltip>
          <Tooltip title="查看testcases自动化参数">
            <Button
              type="default"
              icon={<CodeOutlined />}
              onClick={() => handleParamShow(record)}
              loading={paramsLoading}
              size="small"
              style={{ color: '#722ed1', borderColor: '#722ed1' }}
            >
              Param Show
            </Button>
          </Tooltip>
          <Tooltip title="异步执行，请点击Report查看结果">
            <Button
              type="default"
              icon={<PlayCircleOutlined />}
              onClick={() => handleRun(record)}
              size="small"
              style={{ color: '#13c2c2', borderColor: '#13c2c2' }}
            >
              Run
            </Button>
          </Tooltip>
          <Tooltip title="查询报告需要run之后等待一会">
            <Button
              type="default"
              icon={<BarChartOutlined />}
              onClick={() => handleReport(record)}
              size="small"
              style={{ color: '#fa8c16', borderColor: '#fa8c16' }}
            >
              Report
            </Button>
          </Tooltip>
          <Button
            danger
            type="primary"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            size="small"
          >
            Delete
          </Button>
          <Tooltip title="是否完成自动化测试">
            <Switch
              size="middle"
              checked={autoStates[record.key]}
              onChange={(checked) => handleAutoTestChange(record, checked)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={apis}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          onChange: (page) => setCurrentPage(page),
        }}
        scroll={{ x: 1500 }}
      />

      <Modal
        title="API Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedApi && <ApiDetailView api={selectedApi} />}
      </Modal>

      <ParamsShowModal
        visible={isParamsModalVisible}
        onClose={handleParamsModalClose}
        testcasesCode={currentTestCasesCode}
      />
    </div>
  );
};

export default SavedApiTable;
