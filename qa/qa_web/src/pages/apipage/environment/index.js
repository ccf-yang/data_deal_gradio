import React from 'react';
import EnvironmentTableComponent from './EnvironmentTable';
import { Breadcrumb } from 'components';
function EnvironmentIndex() {
  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>接口管理</Breadcrumb.Item>
        <Breadcrumb.Item>接口环境</Breadcrumb.Item>
      </Breadcrumb>
      <EnvironmentTableComponent />
    </div>
  );
}

export default EnvironmentIndex;
