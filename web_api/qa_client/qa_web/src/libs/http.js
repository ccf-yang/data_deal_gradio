import http from 'axios'
import history from './history'
import { X_TOKEN } from './functools';
import { message } from 'antd';

// response处理
function handleResponse(response) {
  let result;
  if (response.status === 401) {
    result = '会话过期，请重新登录';
    localStorage.removeItem('token');
    history.push('/login');
    return Promise.reject(result);
  } else if (response.status === 200) {
    if (response.data.error) {
      result = response.data.error
    } else if (response.data.hasOwnProperty('data')) {
      return Promise.resolve(response.data.data)
    } else if (response.headers['content-type'] === 'application/octet-stream') {
      return Promise.resolve(response)
    } else if (!response.config.isInternal) {
      return Promise.resolve(response.data)
    } else {
      result = '无效的数据格式'
    }
  } else {
    result = `请求失败: ${response.status} ${response.statusText}`
  }
  message.error(result);
  return Promise.reject(result)
}

// 请求拦截器
http.interceptors.request.use(request => {
  request.isInternal = request.url.startsWith('/api/');
  if (request.isInternal) {
    request.headers['X-Token'] = localStorage.getItem('token');
  }
  request.timeout = request.timeout || 30000;
  return request;
});

// 返回拦截器
http.interceptors.response.use(response => {
  return handleResponse(response)
}, error => {
  if (error.response) {
    return handleResponse(error.response)
  }
  const result = '请求异常: ' + error.message;
  message.error(result);
  return Promise.reject(result)
});

export default http;
