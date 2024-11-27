import React, { Suspense } from 'react';
import { Router, Switch, Route, Redirect } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import Layout from './layout';
import Login from './pages/login';
import styles from './layout/layout.module.less';
import { history } from 'libs';
import './global.less';

moment.locale('zh-cn');

const PrivateRoute = ({ component: Component, ...rest }) => {
  const token = localStorage.getItem('token');
  // 设置token存在就跳转到组件，token不存在，就直接重定向到/login
  return (
    <Route
      {...rest}
      render={props =>
        token ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
};

const LayoutRoute = ({ component: Component, ...rest }) => (
  // LayoutRoute封装了token校验组件
  <PrivateRoute
    {...rest}
    component={props => (
      <Layout>
        <div className={styles.content}>
          <Component {...props} />
        </div>
      </Layout>
    )}
  />
);

export default function () {
  return (
    // 必须在这里再配置一下啊权限，某则，path打不开，直接跳转到404
    <ConfigProvider locale={zhCN}>
      <Router history={history}>
        <Suspense fallback={<Spin style={{margin: '20% auto', width: '100%'}}/>}>
          <Switch>
            <Route exact path="/login" component={Login} />
            {/* 用如下的方式配置路由需要有token，如果有token就渲染，没有token就重定向到/login，LayoutRoute封装了token校验 */}
            <LayoutRoute path="/home" component={React.lazy(() => import('./pages/home'))} />
            <LayoutRoute path="/system/setting" component={React.lazy(() => import('./pages/system/setting'))} />
            <LayoutRoute path="/system/login" component={React.lazy(() => import('./pages/system/login'))} />
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
            <Route component={React.lazy(() => import('./components/NotFound'))} />
          </Switch>
        </Suspense>
      </Router>
    </ConfigProvider>
  )
}
