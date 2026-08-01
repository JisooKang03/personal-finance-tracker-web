import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5035/api',
});

// Automatically attach the JWT token to every request, if one exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server ever responds with 401 (expired/invalid token), clear it and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;