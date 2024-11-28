import React, { useState, useEffect } from 'react';
import { Avatar, Card, Col, Row, Modal, Button } from 'antd';
import { LeftSquareOutlined, RightSquareOutlined, EditOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import NavForm from './NavForm';
import { http } from 'libs';
import styles from './index.module.less';

function NavIndex(props) {
  const [isEdit, setIsEdit] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState();

  useEffect(() => {
    fetchRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function fetchRecords() {
    http.get('/api/home/navigation/')
      .then(res => setRecords(res))
  }

  function handleSubmit() {
    fetchRecords();
    setRecord(null)
  }

  function handleSort(info, sort) {
    http.patch('/api/home/navigation/', {id: info.id, sort})
      .then(() => fetchRecords())
  }

  function handleDelete(item) {
    Modal.confirm({
      title: '操作确认',
      content: `确定要删除【${item.title}】？`,
      onOk: () => http.delete('/api/home/navigation/', {params: {id: item.id}})
        .then(fetchRecords)
    })
  }

  return (
    <Card
      title="便捷导航"
      className={styles.nav}
      bodyStyle={{paddingBottom: 0, minHeight: 166}}
      extra={<Button auth="admin" type="link"
                         onClick={() => setIsEdit(!isEdit)}>{isEdit ? '完成' : '编辑'}</Button>}>
      {isEdit ? (
        <Row gutter={24}>
          <Col span={6} style={{marginBottom: 24}}>
            <div
              className={styles.add}
              onClick={() => setRecord({links: [{}]})}>
              <PlusOutlined/>
              <span>新建</span>
            </div>
          </Col>
          {records.map(item => (
            <Col key={item.id} span={6} style={{marginBottom: 24}}>
              <Card hoverable actions={[
                <LeftSquareOutlined onClick={() => handleSort(item, 'up')}/>,
                <RightSquareOutlined onClick={() => handleSort(item, 'down')}/>,
                <EditOutlined onClick={() => setRecord(item)}/>
              ]}>
                <Card.Meta
                  avatar={<Avatar src={item.logo}/>}
                  title={item.title}
                  description={item.desc}/>
                <CloseOutlined className={styles.icon} onClick={() => handleDelete(item)}/>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={24}>
          {records.map(item => (
            <Col key={item.id} span={6} style={{marginBottom: 24}}>
              <Card
                hoverable
                actions={item.links.map(x => (
                  <Button 
                    key={x.url}
                    type="link" 
                    href={x.url.startsWith('http') ? x.url : `https://${x.url}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ padding: '4px 0' }}
                  >
                    {x.name}
                  </Button>
                ))}>
                <Card.Meta
                  avatar={<Avatar size="small" src={item.logo}/>}
                  title={item.title}
                  description={item.desc}/>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      {record ? <NavForm record={record} onCancel={() => setRecord(null)} onOk={handleSubmit}/> : null}
    </Card>
  )
}

export default NavIndex