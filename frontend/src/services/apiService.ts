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

export const apiService = {
  async sendChatMessage(message: string, userProfile?: any) {
    const response = await api.post('/chat', { message, user_profile: userProfile });
    return response.data;
  },

  async findNearbyHospitals(location: string, radius?: number) {
    const response = await api.post('/hospitals/nearby', { location, radius });
    return response.data;
  },

  async uploadReport(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload-report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
