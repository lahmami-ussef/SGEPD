import { create } from 'zustand';
import { login as apiLogin, logout as apiLogout, getStoredUser } from '../services/authService';

const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,

  login: async (username, password) => {
    const { user } = await apiLogin(username, password);
    set({ user, isLoading: false });
    return true;
  },

  logout: async () => {
    await apiLogout();
    set({ user: null });
  },

  // Chargement au démarrage — lit le user stocké, pas de JWT decode
  loadStoredUser: async () => {
    try {
      const user = await getStoredUser();
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));

export default useAuthStore;