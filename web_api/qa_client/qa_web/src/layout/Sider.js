import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layout, Menu } from 'antd';
import { history } from 'libs';
import styles from './layout.module.less';
import routes from '../routes';
import logo from './logo-qa-white.png';

// 构建路径和菜单标题的映射关系
const buildOpenKeysMap = () => {
  const map = {};
  for (let item of routes) {
    if (item.child) {
      for (let sub of item.child) {
        if (sub.title) map[sub.path] = item.title;
      }
    } else if (item.title) {
      map[item.path] = 1;
    }
  }
  return map;
};

// 预先构建映射关系，避免重复计算
const OpenKeysMap = buildOpenKeysMap();

export default function Sider(props) {
  // 从localStorage获取已保存的展开状态
  const [openKeys, setOpenKeys] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('siderOpenKeys')) || [];
    } catch {
      return [];
    }
  });
  
  const [selectedKey, setSelectedKey] = useState(window.location.pathname);

  // 使用 useMemo 缓存菜单数据
  const menus = useMemo(() => {
    const handleRoute = (item) => {
      if (!item.title) return null;
      
      const menu = {
        label: item.title,
        key: item.path,
        icon: item.icon
      };

      if (item.child) {
        const children = item.child
          .map(sub => handleRoute(sub))
          .filter(Boolean);
          
        if (children.length > 0) {
          menu.children = children;
          return menu;
        }
        return null;
      }
      return menu;
    };

    return routes
      .map(item => handleRoute(item))
      .filter(Boolean);
  }, []); // 只在组件挂载时计算一次

  // 使用 useCallback 缓存事件处理函数
  const handleOpenChange = useCallback((keys) => {
    setOpenKeys(keys);
    try {
      localStorage.setItem('siderOpenKeys', JSON.stringify(keys));
    } catch (e) {
      console.error('Failed to save open keys:', e);
    }
  }, []);

  const handleSelect = useCallback(({ key }) => {
    setSelectedKey(key);
    history.push(key);
  }, []);

  // 使用 useMemo 缓存 Menu 组件的 props
  const menuProps = useMemo(() => ({
    theme: "dark",
    mode: "inline",
    items: menus,
    selectedKeys: [selectedKey],
    openKeys: !props.collapsed ? openKeys : [],
    onOpenChange: handleOpenChange,
    onSelect: handleSelect
  }), [menus, selectedKey, props.collapsed, openKeys, handleOpenChange, handleSelect]);

  return (
    <Layout.Sider width={208} collapsed={props.collapsed} className={styles.sider}>
      <div className={styles.logo}>
        <img src={logo} alt="Logo"/>
      </div>
      <div className={styles.menus} style={{height: `${document.body.clientHeight - 64}px`}}>
        <Menu {...menuProps} />
      </div>
    </Layout.Sider>
  );
}