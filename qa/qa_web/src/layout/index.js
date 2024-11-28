import React, { useState, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Layout, message } from 'antd';
import { NotFound } from 'components';
import Sider from './Sider';
import Header from './Header';
import Footer from './Footer'
import routes from '../routes';
import { isMobile } from 'libs';
import styles from './layout.module.less';

function initRoutes(Routes, routes) {
  for (let route of routes) {
    if (route.component) {
            Routes.push(<Route exact key={route.path} path={route.path} component={route.component}/>)
    } else if (route.child) {
      initRoutes(Routes, route.child)
    }
  }
}

export default function () {
  const [collapsed, setCollapsed] = useState(false)
  const [Routes, setRoutes] = useState([]);

  useEffect(() => {
    // 界面点开就会执行的一段代码，先判断手机类型判断是否折叠，然后将路由界面放入路由数组
     if (isMobile) {
      setCollapsed(true);
      message.warn('检测到您在移动设备上访问，请使用横屏模式。', 5)
    }
    const Routes = [];
    initRoutes(Routes, routes);
    setRoutes(Routes)
  }, [])

  return (
    <Layout>
      <Sider collapsed={collapsed}/>
      <Layout style={{height: '100vh'}}>
        <Header collapsed={collapsed} toggle={() => setCollapsed(!collapsed)}/>
        <Layout.Content className={styles.content} id="qa-container">
          <Switch>
            {Routes}   {/* Routes是一个数组，里面放了所有的路由，用于点击path时渲染 */}
            <Route component={NotFound}/>
          </Switch>
        </Layout.Content>
        {/* <Footer/> */}
      </Layout>
      
    </Layout>
  )
}
