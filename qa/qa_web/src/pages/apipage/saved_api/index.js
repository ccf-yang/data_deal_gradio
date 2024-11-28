import React from 'react';
import SavedApiManagerComponent from './SavedApiManager';
import { Breadcrumb } from 'components';
function SavedApiIndex() {
  return (
    <div>
      <Breadcrumb>  
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>接口管理</Breadcrumb.Item>
        <Breadcrumb.Item>接口仓库</Breadcrumb.Item>
      </Breadcrumb>
      <SavedApiManagerComponent />
    </div>
  );
}

export default SavedApiIndex;
