import http from '../libs/http';

// Directory related APIs
export const getDirectories = async () => {
  return await http.get('/api/savedapi/directories/', {
    params: { directory_type: 'savedapi' }
  });
};

export const createDirectory = async (name) => {
  return await http.post('/api/savedapi/directories/', {
    name,
    directory_type: 'savedapi'
  });
};

// Saved APIs related APIs
export const getSavedApis = async () => {
  return await http.get('/api/savedapi/saved-apis/');
};

export const saveApis = async (apis, directory) => {
  return await http.post('/api/savedapi/save/', {
    apis,
    directory
  });
};

export const removeApis = async (apis, directory) => {
  return await http.post('/api/savedapi/remove/', {
    apis,
    directory
  });
};

// Convert Swagger/OpenAPI to internal format
export const convertSwagger = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return await http.post('/api/savedapi/convert/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
