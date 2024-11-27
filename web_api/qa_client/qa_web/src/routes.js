import React from 'react';
import {
  DesktopOutlined,
  SettingOutlined
} from '@ant-design/icons';

import HomeIndex from './pages/home';
import SystemSetting from './pages/system/setting';
import SystemLogin from './pages/system/login';

export default [
  // 这里定义siderbar菜单，格式为  {icon: <DesktopOutlined/>, title: 'xx', path: '/home', component: HomeIndex}
  // 定义子菜单格式为： { icon:  title: 'xx', child: [ title, path, component ] }
  // {
  //   icon: <SettingOutlined/>, title: '批量执行', child: [
  //     {title: '执行任务', path: '/exec/task',     component: SystemSetting},
  //     {title: '模板管理', path: '/exec/template', component: SystemSetting},
  //     {title: '文件分发', path: '/exec/transfer', component: SystemSetting},
  //   ]
  // },
  // 这里定义的会在siderbar显示,子菜单会递归展示,
  {icon: <DesktopOutlined/>, title: '工作台', path: '/home', component: HomeIndex},
  // {icon: <SettingOutlined/>, title: '系统设置', path: '/system/setting', component: SystemSetting},
  //   {
  //   icon: <SettingOutlined/>, title: '批量执行', child: [
  //     {title: '执行任务', path: '/system/',     component: SystemSetting},
  //     {title: '模板管理', path: '/system/setting', component: SystemSetting},
  //     {title: '文件分发', path: '/system/setting', component: SystemSetting},
  //   ]
  // },
  {
    icon: <SettingOutlined/>, title: '系统管理', auth: "system.account.view|system.role.view|system.setting.view", child: [
      {title: '登录日志', auth: 'system.login.view', path: '/system/login', component: SystemLogin},
      {title: '系统设置', auth: 'system.setting.view', path: '/system/setting', component: SystemSetting},
    ]
  },

];