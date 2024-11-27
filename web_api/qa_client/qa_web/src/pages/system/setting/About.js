
import React from 'react';
import styles from './index.module.css';
import { Descriptions, Spin } from 'antd';
import { observer } from 'mobx-react'
import { http } from 'libs';


@observer
class About extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fetching: true,
      info: {}
    }
  }

  componentDidMount() {
    http.get('/api/setting/about/')
      .then(res => this.setState({info: res}))
      .finally(() => this.setState({fetching: false}))
  }


  render() {
    const {info, fetching} = this.state;
    return (
      <Spin spinning={fetching}>
        <div className={styles.title}>关于</div>
        <Descriptions column={1}>
          <Descriptions.Item label="操作系统">{info['system_version']}</Descriptions.Item>
          <Descriptions.Item label="Python版本">{info['python_version']}</Descriptions.Item>
          <Descriptions.Item label="Django版本">{info['django_version']}</Descriptions.Item>
        </Descriptions>
      </Spin>
    )
  }
}

export default About
