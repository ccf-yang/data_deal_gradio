import axios from 'axios';
import { API_BASE_URL } from '../config';

// Directory related APIs
export const getDirectories = async () => {
  const response = await axios.get(`${API_BASE_URL}/savedapi/directories/`, {
    params: { directory_type: 'savedapi' }
  });
  return response.data;
};

export const createDirectory = async (name) => {
  const response = await axios.post(`${API_BASE_URL}/savedapi/directories/`, {
    name,
    directory_type: 'savedapi'
  });
  return response.data;
};

// Saved APIs related APIs
export const getSavedApis = async () => {
  const response = await axios.get(`${API_BASE_URL}/savedapi/saved-apis/`);
  return response.data;
};

export const saveApis = async (apis, directory) => {
  const response = await axios.post(`${API_BASE_URL}/savedapi/save/`, {
    apis,
    directory
  });
  return response.data;
};

export const removeApis = async (apis, directory) => {
  const response = await axios.post(`${API_BASE_URL}/savedapi/remove/`, {
    apis,
    directory
  });
  return response.data;
};

// Convert Swagger/OpenAPI to internal format
export const convertSwagger = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_BASE_URL}/savedapi/convert/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
