import React from 'react';
import AICasesTableComponent from './AICasesTable';
import { Breadcrumb } from 'components';
function AICasesIndex() {
  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>功能测试</Breadcrumb.Item>
        <Breadcrumb.Item>AI生成用例</Breadcrumb.Item>
      </Breadcrumb>
      <AICasesTableComponent />
    </div>
  );
}

export default AICasesIndex;
