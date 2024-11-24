import axios from 'axios';
import { API_BASE_URL } from '../config';

// API Code without Group
export const addApiCodeWithoutGroup = async (apiData) => {
  const response = await axios.post(`${API_BASE_URL}/autoapi/addapicodewithoutgroup`, apiData);
  return response.data;
};

export const getApiCode = async (params) => {
  const response = await axios.post(`${API_BASE_URL}/autoapi/getapicode`, params);
  return response.data;
};

export const updateApiCode = async (apiData) => {
  const response = await axios.post(`${API_BASE_URL}/autoapi/updateapicode`, apiData);
  return response.data;
};

export const deleteApiCode = async (params) => {
  const response = await axios.post(`${API_BASE_URL}/autoapi/deleteapicode`, params);
  return response.data;
};

// Group API Code Operations
export const addApiCodeWithGroup = async (apiData, groupName) => {
  const response = await axios.post(`${API_BASE_URL}/autoapi/addapicodewithgroup`, {
    ...apiData,
    group: Array.isArray(groupName) ? groupName : [groupName]
  });
  return response.data;
};

export const getAllGroupedApis = async () => {
  const response = await axios.get(`${API_BASE_URL}/autoapi/groupall`);
  return response.data;
};

export const getGroupApis = async (groupName) => {
  const response = await axios.get(`${API_BASE_URL}/autoapi/group`, {
    params: { group_name: groupName }
  });
  return response.data;
};

export const deleteApiFromGroup = async (apiMethod, apiPath, directory, groupName) => {
  const response = await axios.post(`${API_BASE_URL}/autoapi/deletegroupapi`, {
    api_method: apiMethod,
    api_path: apiPath,
    directory: directory,
    group: groupName
  });
  return response.data;
};

// Group Management
export const getGroups = async () => {
  const response = await axios.get(`${API_BASE_URL}/autoapi/groups`);
  return response.data;
};

export const createGroup = async (groupName) => {
  const response = await axios.post(`${API_BASE_URL}/autoapi/addgroup`, {
    name: groupName
  });
  return response.data;
};

export const deleteGroup = async (groupName) => {
  const response = await axios.post(`${API_BASE_URL}/autoapi/deletegroup`, {
    name: groupName
  });
  return response.data;
};

// Auto Test Status
export const getAllAutoTestStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/autoapi/autoteststatus`);
    return response.data;
  } catch (error) {
    console.error('Error fetching auto test status:', error);
    throw error;
  }
};
