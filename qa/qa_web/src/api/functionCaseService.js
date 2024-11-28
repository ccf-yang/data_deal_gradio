import http from '../libs/http';

export const getAllFunctionCases = async () => {
  try {
    return await http.get('/api/function_cases/cases');
  } catch (error) {
    console.error('Error fetching function cases:', error);
    throw error;
  }
};

export const createFunctionCase = async (caseData) => {
  try {
    return await http.post('/api/function_cases/create', caseData);
  } catch (error) {
    console.error('Error creating function case:', error);
    throw error;
  }
};

export const updateFunctionCase = async (id, caseData) => {
  try {
    return await http.post('/api/function_cases/update', {
      id: id,
      ...caseData
    });
  } catch (error) {
    console.error('Error updating function case:', error);
    throw error;
  }
};

export const deleteFunctionCase = async (ids) => {
  try {
    return await http.post('/api/function_cases/delete', {
      ids: Array.isArray(ids) ? ids : [ids]
    });
  } catch (error) {
    console.error('Error deleting function case:', error);
    throw error;
  }
};

export const getSelectedFunctionCases = async (ids) => {
  try {
    return await http.post('/api/function_cases/selected', {
      ids: Array.isArray(ids) ? ids : [ids]
    });
  } catch (error) {
    console.error('Error fetching selected function cases:', error);
    throw error;
  }
};
