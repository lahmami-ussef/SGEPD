import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8090/api', // On passe par la Gateway sur le port 8090 en IPv4
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
