import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  googleLogin: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },
};

export const profileAPI = {
  getProfile: () => api.get('/api/profile'),
  setupProfile: (data) => api.post('/api/setup-profile', data),
};

export const chatAPI = {
  sendMessage: (message) => api.post('/api/chat', { message }),
  getHistory: () => api.get('/api/chat/history'),
};

export const hospitalAPI = {
  findNearby: (location, radius = 5000) =>
    api.post('/api/nearby-hospitals', { location, radius }),
};

export const reportAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/upload-report', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: () => api.get('/api/reports'),
};

export default api;
