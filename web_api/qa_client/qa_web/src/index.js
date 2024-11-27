import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import './index.less';
import App from './App';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { history } from 'libs';

moment.locale('zh-cn');

ReactDOM.render(
  <Router history={history}>
    <ConfigProvider locale={zhCN} getPopupContainer={() => document.fullscreenElement || document.body}>
      <App/>
    </ConfigProvider>
  </Router>,
  document.getElementById('root')
);
