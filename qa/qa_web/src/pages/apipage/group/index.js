import React from 'react';
import GroupManagerComponent from './GroupManager';
import { Breadcrumb } from 'components';
function GroupIndex() {
  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>接口管理</Breadcrumb.Item>
        <Breadcrumb.Item>接口分组</Breadcrumb.Item>
      </Breadcrumb>
      <GroupManagerComponent />
    </div>
  );
}

export default GroupIndex;
