import axios from 'axios';
import { API_BASE_URL } from '../config';

const FUNCTION_CASES_URL = `${API_BASE_URL}/function_cases`;

export const getAllFunctionCases = async () => {
  try {
    const response = await axios.get(`${FUNCTION_CASES_URL}/cases`);
    return response.data;
  } catch (error) {
    console.error('Error fetching function cases:', error);
    throw error;
  }
};

export const createFunctionCase = async (caseData) => {
  try {
    const response = await axios.post(`${FUNCTION_CASES_URL}/create`, caseData);
    return response.data;
  } catch (error) {
    console.error('Error creating function case:', error);
    throw error;
  }
};

export const updateFunctionCase = async (id, caseData) => {
  try {
    const response = await axios.post(`${FUNCTION_CASES_URL}/update`, {
      id: id,
      ...caseData
    });
    return response.data;
  } catch (error) {
    console.error('Error updating function case:', error);
    throw error;
  }
};

export const deleteFunctionCase = async (ids) => {
  try {
    const response = await axios.post(`${FUNCTION_CASES_URL}/delete`, {
      ids: Array.isArray(ids) ? ids : [ids]
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting function case:', error);
    throw error;
  }
};

export const getSelectedFunctionCases = async (ids) => {
  try {
    const response = await axios.post(`${FUNCTION_CASES_URL}/selected/`, {
      ids: Array.isArray(ids) ? ids : [ids]
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching selected function cases:', error);
    throw error;
  }
};
