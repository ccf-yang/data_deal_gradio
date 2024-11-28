import React from 'react';
import ImportApiManagerComponent from './ImportApiManager';
import { Breadcrumb } from 'components';

function ImportApiIndex() {
  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>接口管理</Breadcrumb.Item>
        <Breadcrumb.Item>接口导入</Breadcrumb.Item>
      </Breadcrumb>
      <ImportApiManagerComponent />
    </div>
  );
}

export default ImportApiIndex;
