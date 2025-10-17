import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async googleAuth(token: string) {
    const response = await api.post('/auth/google', { token });
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  async updateProfile(profileData: any) {
    const response = await api.put('/profile', profileData);
    return response.data;
  },
};
