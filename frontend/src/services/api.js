//instead of manually typing the backend URL and adding the JWT token to every single request, we can configure Axios to do this automatically using an "Interceptor".

import axios from 'axios';

// Create an Axios instance pointing to your backend
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Intercept every request BEFORE it leaves the frontend
API.interceptors.request.use((req) => {
  // Check if we have a token saved in localStorage
  const token = localStorage.getItem('token');
  
  // If we do, attach it to the Authorization header
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  
  return req;
});

export default API;