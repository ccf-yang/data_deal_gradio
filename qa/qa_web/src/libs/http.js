import http from 'axios'
import history from './history'
import { message } from 'antd';

// response处理
function handleResponse(response) {
  let result;
  // 处理401未授权情况
  if (response.status === 401) {
    const result = '会话过期，请重新登录';
    localStorage.removeItem('token');
    history.push('/login');
    return Promise.reject(result);
  }

  // console.log(response)  //任何响应都有data, status,config等信息，这个是http附带的，不算自己返回结构里面
  if (response.config.url.startsWith('/api/function') || response.config.url.startsWith('/api/savedapi') || response.config.url.startsWith('/api/autoapi') || response.config.url.startsWith('/api/environment')) {
    return response.data;
    // 这段代码是为了兼容旧版本的接口，旧版本都是用的axios,没有用Promise，直接返回data
  }

  if (response.status === 200) {
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
  }

  // 处理其他状态码
  const errorMessage = `请求失败: ${response.status} ${response.statusText}`;
  message.error(errorMessage);
  return Promise.reject(errorMessage);
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
    console.log("testa")
    return handleResponse(error.response)
  }
  const result = '请求异常: ' + error.message;
  message.error(result);
  return Promise.reject(result)
});

export default http;
