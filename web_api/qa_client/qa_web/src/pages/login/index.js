import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Modal, message } from 'antd';
import { UserOutlined, LockOutlined, GithubOutlined } from '@ant-design/icons';
import styles from './login.module.css';
import history from 'libs/history';
import { http } from 'libs';
import logo from 'layout/logo-qa-txt.png';

export default function () {
  const [form] = Form.useForm();
  const [counter, setCounter] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (localStorage.getItem('token')) {
      history.push('/home');
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (counter > 0) {
        setCounter(counter - 1)
      }
    }, 1000)
  }, [counter])

  function handleSubmit() {
    const formData = form.getFieldsValue();
    setLoading(true);
    formData['type'] = 'default';
    http.post('/api/account/login/', formData)
      .then(data => {
        doLogin(data)
      }, () => setLoading(false))
  }

  function doLogin(data) {
    localStorage.setItem('token', data['access_token']);
    localStorage.setItem('nickname', data['nickname']);
    localStorage.setItem('is_supper', data['is_supper']);
    localStorage.setItem('permissions', JSON.stringify(data['permissions']));
    if (history.location.state && history.location.state['from']) {
      history.push(history.location.state['from'])
    } else {
      history.push('/home')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div><img className={styles.logo} src={logo} alt="logo"/></div>
      </div>
      <Form form={form} className={styles.loginForm} onFinish={handleSubmit}>
        <Form.Item name="username" rules={[{required: true, message: '请输入账户'}]}>
          <Input
            size="large"
            autoComplete="off"
            placeholder="请输入账户"
            prefix={<UserOutlined/>}/>
        </Form.Item>
        <Form.Item name="password" rules={[{required: true, message: '请输入密码'}]}>
          <Input
            size="large"
            type="password"
            autoComplete="off"
            placeholder="请输入密码"
            prefix={<LockOutlined/>}/>
        </Form.Item>
        <Button block size="large" type="primary" loading={loading} onClick={handleSubmit}>登录</Button>
        {/* <div className={styles.footerZone}>
          <div className={styles.links}>
            <a className={styles.item} target="_blank" rel="noopener noreferrer"
               href="https://github.com/ccf-yang">
              <GithubOutlined style={{marginRight: 8}}/>TOM GITHUB
            </a>
          </div> */}
        {/* </div> */}
      </Form>
    </div>
  )
}
