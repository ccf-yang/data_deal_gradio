import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Dropdown, Menu, Avatar } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import styles from './layout.module.less';
import http from '../libs/http';
import history from '../libs/history';
import avatar from './avatar.png';

export default function (props) {
  function handleLogout() {
    // First make the logout API call
    http.get('/api/account/logout/')
      .then(() => {
        // Clear all authentication related data
        localStorage.removeItem('token');
        localStorage.removeItem('nickname');
        localStorage.removeItem('permissions');
        // Any other auth-related items should be cleared here
        
        // Redirect to login page
        history.push('/login');
      })
      .catch(error => {
        // Even if the API call fails, we should still clean up local storage and redirect
        localStorage.clear();
        history.push('/login');
      });
  }

  const UserMenu = (
    <Menu>
      <Menu.Item>
        <Link to="/system/setting">
          <UserOutlined style={{marginRight: 10}}/>系统设置
        </Link>
      </Menu.Item>
      <Menu.Divider/>
      <Menu.Item onClick={handleLogout}>
        <LogoutOutlined style={{marginRight: 10}}/>退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout.Header className={styles.header}>
      <div className={styles.trigger} onClick={props.toggle}>
        {props.collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
      </div>

      <div className={styles.right}>
        <Dropdown overlay={UserMenu} placement="bottomRight">
          <span className={styles.action}>
            <Avatar size="small" src={avatar} style={{marginRight: 8}}/>
            {localStorage.getItem('nickname')}
          </span>
        </Dropdown>
      </div>
    </Layout.Header>
  )
}