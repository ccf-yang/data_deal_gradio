import http from '../libs/http';

// API Code without Group
export const addApiCodeWithoutGroup = async (apiData) => {
  return await http.post('/api/autoapi/addapicodewithoutgroup', apiData);
};

export const getApiCode = async (params) => {
  return await http.post('/api/autoapi/getapicode', params);
};

export const updateApiCode = async (apiData) => {
  return await http.post('/api/autoapi/updateapicode', apiData);
};

export const deleteApiCode = async (params) => {
  return await http.post('/api/autoapi/deleteapicode', params);
};

// Group API Code Operations
export const addApiCodeWithGroup = async (apiData, groupName) => {
  return await http.post('/api/autoapi/addapicodewithgroup', {
    ...apiData,
    group: Array.isArray(groupName) ? groupName : [groupName]
  });
};

export const getAllGroupedApis = async () => {
  return await http.get('/api/autoapi/groupall');
};

export const getGroupApis = async (groupName) => {
  return await http.get('/api/autoapi/group', {
    params: { group_name: groupName }
  });
};

export const deleteApiFromGroup = async (apiMethod, apiPath, directory, groupName) => {
  return await http.post('/api/autoapi/deletegroupapi', {
    api_method: apiMethod,
    api_path: apiPath,
    directory: directory,
    group: groupName
  });
};

// Group Management
export const getGroups = async () => {
  return await http.get('/api/autoapi/groups');
};

export const createGroup = async (groupName) => {
  return await http.post('/api/autoapi/addgroup', {
    name: groupName
  });
};

export const deleteGroup = async (groupName) => {
  return await http.post('/api/autoapi/deletegroup', {
    name: groupName
  });
};

// Auto Test Status
export const getAllAutoTestStatus = async () => {
  try {
    return await http.get('/api/autoapi/autoteststatus');
  } catch (error) {
    console.error('Error fetching auto test status:', error);
    throw error;
  }
};
