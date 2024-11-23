import axios from 'axios';
import { API_BASE_URL } from '../config';

// Group related APIs
export const getGroups = async () => {
  const response = await axios.get(`${API_BASE_URL}/savedapi/groups`);
  return response.data;
};

export const createGroup = async (name) => {
  const response = await axios.post(`${API_BASE_URL}/savedapi/groups`, { name });
  return response.data;
};

export const addApisToGroup = async (groupName, apis) => {
  const response = await axios.post(`${API_BASE_URL}/savedapi/group/add`, {
    groupName,
    apis
  });
  return response.data;
};

export const removeApisFromGroup = async (groupName, apis) => {
  const response = await axios.post(`${API_BASE_URL}/savedapi/group/remove`, {
    groupName,
    apis
  });
  return response.data;
};
