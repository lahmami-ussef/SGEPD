import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Pour émulateur Android : 10.0.2.2
// Pour vrai périphérique : IP de votre machine sur le réseau local
const API_BASE_URL = 'http://10.0.2.2:8090/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;