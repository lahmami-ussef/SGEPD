import { create } from 'zustand';
import { fetchScreens, createScreen, updateScreen, deleteScreen } from '../services/screenService';

const useScreenStore = create((set, get) => ({
  screens: [],
  loading: false,
  error: null,

  loadScreens: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchScreens();
      set({ screens: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addScreen: async (screen) => {
    const newScreen = await createScreen(screen);
    set((state) => ({ screens: [...state.screens, newScreen] }));
    return newScreen;
  },

  editScreen: async (id, screen) => {
    const updated = await updateScreen(id, screen);
    set((state) => ({
      screens: state.screens.map(s => s.id === id ? { ...s, ...updated } : s)
    }));
    return updated;
  },

  removeScreen: async (id) => {
    await deleteScreen(id);
    set((state) => ({ screens: state.screens.filter(s => s.id !== id) }));
  }
}));

export default useScreenStore;