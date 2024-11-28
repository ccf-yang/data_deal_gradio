import React from 'react';
import FunctionTaskTableComponent from './FunctionTaskTable';
import { Breadcrumb } from 'components';
function FunctionTaskIndex() {
  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>功能测试</Breadcrumb.Item>
        <Breadcrumb.Item>执行任务</Breadcrumb.Item>
      </Breadcrumb>
      <FunctionTaskTableComponent />
    </div>
  );
}

export default FunctionTaskIndex;
