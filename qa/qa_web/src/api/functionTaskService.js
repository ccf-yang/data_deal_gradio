import http from '../libs/http';

// Create a new function task
export const createFunctionTask = async (taskData) => {
  try {
    return await http.post('/api/function_task/create', {
      name: taskData.name,
      assignedPerson: taskData.assignedPerson,
      cases: taskData.cases,
      status: taskData.status,
      deadline: taskData.deadline
    });
  } catch (error) {
    console.error('Error creating function task:', error);
    throw error;
  }
};

// Get all function tasks
export const getAllFunctionTasks = async () => {
  try {
    return await http.get('/api/function_task/tasks');
  } catch (error) {
    console.error('Error getting all function tasks:', error);
    throw error;
  }
};

// Get selected function tasks by IDs
export const getSelectedFunctionTasks = async (ids) => {
  try {
    return await http.post('/api/function_task/getselected', {
      ids: ids
    });
  } catch (error) {
    console.error('Error getting selected function tasks:', error);
    throw error;
  }
};

// Delete function tasks by IDs
export const deleteFunctionTasks = async (ids) => {
  try {
    return await http.post('/api/function_task/delete', {
      ids: ids
    });
  } catch (error) {
    console.error('Error deleting function tasks:', error);
    throw error;
  }
};

// Update a function task
export const updateFunctionTask = async (taskData) => {
  try {
    return await http.post('/api/function_task/update', {
      id: taskData.id,
      name: taskData.name,
      assignedPerson: taskData.assignedPerson,
      cases: taskData.cases,
      status: taskData.status,
      deadline: taskData.deadline
    });
  } catch (error) {
    console.error('Error updating function task:', error);
    throw error;
  }
};
