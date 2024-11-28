import React from 'react';
import FuncCasesTableComponent from './FuncCasesTable';
import { Breadcrumb } from 'components';
function FuncCasesIndex() {
  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>功能测试</Breadcrumb.Item>
        <Breadcrumb.Item>用例仓库</Breadcrumb.Item>
      </Breadcrumb>
      <FuncCasesTableComponent />
    </div>
  );
}

export default FuncCasesIndex;
