import API from './api';

export const getAllUsers = async () => {
  const response = await API.get('/users');
  return response.data;
};