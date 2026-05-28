import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 30000, // ✅ 30s au lieu de 10s (cold start Spring Boot)
});

let showToast = null;

export const setToastHandler = (handler) => {
  showToast = handler;
};

export const attachAuth = () => {}; // gardé pour compatibilité

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.debug('[api] attaching token to request:', !!token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Network Error = requête envoyée mais pas de réponse reçue
    // Peut arriver même si le serveur a bien traité la requête (201)
    if (!error.response) {
      console.warn('[api] Network Error — la requête a peut-être abouti côté serveur');
      // Ne pas afficher de toast pour laisser le composant gérer
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (showToast) showToast('Votre session a expiré. Veuillez vous reconnecter.', 'warning');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 403) {
      if (showToast) showToast('Accès refusé: permissions insuffisantes', 'error');
    }

    if (error.response?.status === 404) {
      if (showToast) showToast('Ressource non trouvée', 'error');
    }

    if (error.response?.status >= 500) {
      if (showToast) showToast('Erreur serveur. Veuillez réessayer plus tard.', 'error');
    }

    return Promise.reject(error);
  }
);

export default api;