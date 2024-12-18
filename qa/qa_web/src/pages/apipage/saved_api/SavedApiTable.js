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
import axios from 'axios';
import { API_RUN_URL } from '../../../config';

const SavedApiTable = ({ 
  apis,
  loading,
  onSelect,
  onReload,
  selectedEnvironment,
  autoStates,
  onAutoTestChange,
  onDelete,
  selectedRowKeys,
  setSelectedRowKeys,
  currentPage,
  setCurrentPage
}) => {
  const [selectedApi, setSelectedApi] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isParamsModalVisible, setIsParamsModalVisible] = useState(false);
  const [paramsLoading, setParamsLoading] = useState(false);
  const [currentTestCasesCode, setCurrentTestCasesCode] = useState(null);
  const pageSize = DEFAULT_PAGE_SIZE;

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete API',
      content: `Are you sure you want to delete "${record.path}" from "${record.directory}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => onDelete(record)
    });
  };

  const handleAddCase = async (record) => {
    try {
      // 这里不返回头部，run的时候直接写头部
      // record就是一个接口的情况[{method, path, directory...}],这样传过去，兼容group
      // 把接口传给生成代码接口，获取bussinesscode 等，然后填充到下面去
      // 把最终代码返回，格式为 {bussiness_code：, common_code：, testcases_code：,body_params：}, body_params实际代表参数的json
      const requestData = {
        path: record.path,
        method: record.method.toLowerCase() // 确保方法名是小写的
      };
  
      // 使用 async/await 处理异步请求
      const response = await axios({
        method: 'post',
        url: API_RUN_URL + '/ge_api_code',
        headers: { 
          'Content-Type': 'application/json'
        },
        data: requestData
      });
  
      const apiCodeData = response;
      console.log('apiCodeData:', apiCodeData);

      
      await addApiCodeWithoutGroup({
        api_method: record.method,
        api_path: record.path,
        directory: record.directory,
        bussiness_code: apiCodeData.business_code || '',
        common_code: apiCodeData.common_code || '',
        testcases_code: apiCodeData.testcase_code || '',
        is_auto_test: record.is_auto_test || false,
        report_url: record.report_url || '',
        header_params: record.header_params || '',
        path_params: record.path_params || '',
        query_params: record.query_params || '',
        body_params: JSON.stringify(apiCodeData.body_params) || '',
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
      setIsParamsModalVisible(true);  // 先设置为可见
      
      const response = await getApiCode({
        api_method: record.method,
        api_path: record.path,
        directory: record.directory
      });
      
      let parsedParams;
      try {
        parsedParams = JSON.parse(response.body_params);
      } catch (parseError) {
        parsedParams = response.body_params;
      }
      
      setSelectedApi({...record});  // 使用展开运算符创建新对象
      setCurrentTestCasesCode(parsedParams);
    } catch (error) {
      message.error('Failed to fetch API parameters');
      setIsParamsModalVisible(false);
    }
  };

  const handleModalCancel = () => {
    setIsParamsModalVisible(false);
    setSelectedApi(null);
    setCurrentTestCasesCode(null);
  };

  const handleModalSuccess = () => {
    message.success('Parameters updated successfully');
    setIsParamsModalVisible(false);
  };

  const handleRun = async (record) => {
    console.log('Run:', record);
    try {
      const response = await getApiCode({
        api_method: record.method,
        api_path: record.path,
        directory: record.directory
      });
      // 在接口里面读取json和代码，这里只进行拼装代码就好了。
      // 将{groupname:'', apis:[response],“environment”:selectedEnvironment} 传给run接口，无报错，就返回OK
      // run接口接收api列表，然后先生成头，循环生成每个case，如果case有内容为空，testcases生成处理为skip
      // 然后异步调用命令执行，执行完成后，判断group是否空，是的话，将url地址写到report_url字段
  
      // 使用 async/await 处理异步请求
      const requestData = {
        groupname: '',
        apis: [response],
        environment: selectedEnvironment
      };
      console.log('requestData:', requestData);
      const response_run = await axios({
        method: 'post',
        url: API_RUN_URL + '/run',
        headers: { 
          'Content-Type': 'application/json'
        },
        data: requestData
      });
  
      if (response_run.code === 200) {
        message.success('Run success');
      } else {
        message.error('Run failed, try again');
      }
    } catch (error) {
      console.error('Failed to fetch API params:', error);
      message.error('请先点击Add Case!');
    }
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

  const handleAutoTestChange = (record, checked) => {
    onAutoTestChange(record, checked);
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
      // 这里antd标准写法，每一行完整数据赋值到该行对应的record里面
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
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedApi && <ApiDetailView api={selectedApi} />}
      </Modal>

      {isParamsModalVisible && (
        <ParamsShowModal
          visible={isParamsModalVisible}
          onCancel={handleModalCancel}
          onSuccess={handleModalSuccess}
          currentApi={selectedApi}
          testCasesCode={currentTestCasesCode}
        />
      )}
    </div>
  );
};

export default SavedApiTable;
