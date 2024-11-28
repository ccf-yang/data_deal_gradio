import React from 'react';
import { Menu } from 'antd';
import { Breadcrumb } from 'components';
import About from './About';
import styles from './index.module.css';
import store from './store';


class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedKeys: ['about']
    }
  }

  componentDidMount() {
    store.fetchSettings()
  }

  render() {
    const {selectedKeys} = this.state;
    return (
      <div>
        <Breadcrumb>
          <Breadcrumb.Item>首页</Breadcrumb.Item>
          <Breadcrumb.Item>系统管理</Breadcrumb.Item>
          <Breadcrumb.Item>系统设置</Breadcrumb.Item>
        </Breadcrumb>
        <div className={styles.container}>
          <div className={styles.left}>
            <Menu
              mode="inline"
              selectedKeys={selectedKeys}
              style={{border: 'none'}}
              onSelect={({selectedKeys}) => this.setState({selectedKeys})}>
              <Menu.Item key="about">关于</Menu.Item>
            </Menu>
          </div>
          <div className={styles.right}>
            {selectedKeys[0] === 'about' && <About/>}
          </div>
        </div>
      </div>
    )
  }
}

export default Index
