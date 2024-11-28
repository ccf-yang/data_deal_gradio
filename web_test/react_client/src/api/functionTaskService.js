import axios from 'axios';
import { API_BASE_URL } from '../config';

const FUNCTION_TASK_BASE_URL = `${API_BASE_URL}/function_task`;

// Create a new function task
export const createFunctionTask = async (taskData) => {
  try {
    const response = await axios.post(`${FUNCTION_TASK_BASE_URL}/create`, {
      name: taskData.name,
      assignedPerson: taskData.assignedPerson,
      cases: taskData.cases,
      status: taskData.status,
      deadline: taskData.deadline
    });
    return response.data;
  } catch (error) {
    console.error('Error creating function task:', error);
    throw error;
  }
};

// Get all function tasks
export const getAllFunctionTasks = async () => {
  try {
    const response = await axios.get(`${FUNCTION_TASK_BASE_URL}/tasks`);
    return response.data;
  } catch (error) {
    console.error('Error getting all function tasks:', error);
    throw error;
  }
};

// Get selected function tasks by IDs
export const getSelectedFunctionTasks = async (ids) => {
  try {
    const response = await axios.post(`${FUNCTION_TASK_BASE_URL}/getselected`, {
      ids: ids
    });
    return response.data;
  } catch (error) {
    console.error('Error getting selected function tasks:', error);
    throw error;
  }
};

// Delete function tasks by IDs
export const deleteFunctionTasks = async (ids) => {
  try {
    const response = await axios.post(`${FUNCTION_TASK_BASE_URL}/delete`, {
      ids: ids
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting function tasks:', error);
    throw error;
  }
};

// Update a function task
export const updateFunctionTask = async (taskData) => {
  try {
    const response = await axios.post(`${FUNCTION_TASK_BASE_URL}/update`, {
      id: taskData.id,
      name: taskData.name,
      assignedPerson: taskData.assignedPerson,
      cases: taskData.cases,
      status: taskData.status,
      deadline: taskData.deadline
    });
    return response.data;
  } catch (error) {
    console.error('Error updating function task:', error);
    throw error;
  }
};
