import React from 'react';
import { Layout } from 'antd';
import { CopyrightOutlined } from '@ant-design/icons';
import styles from './layout.module.less';


export default function () {
  return (
    <Layout.Footer style={{padding: 0}}>
      <div className={styles.footer}>
        <div className={styles.links}>
          <a className={styles.item} title="官网" href="https://test.paigod.work/box" target="_blank"
             rel="noopener noreferrer">官网</a>
        </div>
        <div style={{color: 'rgba(0, 0, 0, .45)'}}>
          Copyright <CopyrightOutlined/> {new Date().getFullYear()} By QA
        </div>
      </div>
    </Layout.Footer>
  )
}
