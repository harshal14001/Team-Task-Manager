import API from './api';

// Fetch all projects (Backend automatically filters based on user role)
export const getProjects = async () => {
  const response = await API.get('/projects');
  return response.data;
};

// Create a new project (Admin only)
export const createProject = async (projectData) => {
  const response = await API.post('/projects', projectData);
  return response.data;
};
// Update a project (e.g., adding members)
export const updateProject = async (projectId, projectData) => {
  const response = await API.put(`/projects/${projectId}`, projectData);
  return response.data;
};