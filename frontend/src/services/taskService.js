import API from './api';

// Fetch all tasks for a specific project
export const getProjectTasks = async (projectId) => {
  const response = await API.get(`/tasks/project/${projectId}`);
  return response.data;
};

// Create a new task (Admin only)
export const createTask = async (projectId, taskData) => {
  const response = await API.post(`/tasks/project/${projectId}`, taskData);
  return response.data;
};

// Update task status
export const updateTaskStatus = async (taskId, newStatus) => {
  const response = await API.put(`/tasks/${taskId}`, { status: newStatus });
  return response.data;
};

// Fetch all tasks for the dashboard
export const getUserTasks = async () => {
  const response = await API.get('/tasks');
  return response.data;
};