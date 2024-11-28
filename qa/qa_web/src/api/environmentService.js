import http from '../libs/http';

// Get all environments
export const getEnvironments = async () => {
  try {
    return await http.get('/api/environment/environments');
  } catch (error) {
    console.error('Error fetching environments:', error);
    throw error;
  }
};

// Create a new environment
export const createEnvironment = async (environmentData) => {
  try {
    return await http.post('/api/environment/create', environmentData);
  } catch (error) {
    console.error('Error creating environment:', error);
    throw error;
  }
};

// Update an environment
export const updateEnvironment = async (environmentData) => {
  try {
    return await http.post('/api/environment/update', environmentData);
  } catch (error) {
    console.error('Error updating environment:', error);
    throw error;
  }
};

// Delete an environment
export const deleteEnvironment = async (environmentName) => {
  try {
    return await http.post('/api/environment/delete', {
      name: environmentName
    });
  } catch (error) {
    console.error('Error deleting environment:', error);
    throw error;
  }
};
