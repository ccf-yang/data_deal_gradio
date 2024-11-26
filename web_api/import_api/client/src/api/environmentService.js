import axios from 'axios';
import { API_BASE_URL } from '../config';

// Get all environments
export const getEnvironments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/environment/environments`);
    return response.data;  // Return the raw response which contains environments array
  } catch (error) {
    console.error('Error fetching environments:', error);
    throw error;
  }
};

// Create a new environment
export const createEnvironment = async (environmentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/environment/create`, environmentData);
    return response.data;  // Return the raw response
  } catch (error) {
    console.error('Error creating environment:', error);
    throw error;
  }
};

// Update an environment
export const updateEnvironment = async (environmentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/environment/update`, environmentData);
    return response.data;  // Return the raw response
  } catch (error) {
    console.error('Error updating environment:', error);
    throw error;
  }
};

// Delete an environment
export const deleteEnvironment = async (environmentName) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/environment/delete`, {
      name: environmentName
    });
    return response.data;  // Return the raw response
  } catch (error) {
    console.error('Error deleting environment:', error);
    throw error;
  }
};
