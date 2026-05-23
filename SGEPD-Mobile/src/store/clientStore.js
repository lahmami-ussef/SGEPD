import { create } from 'zustand';
import { fetchClients, createClient, updateClient, deleteClient } from '../services/clientService';

const useClientStore = create((set, get) => ({
  clients: [],
  loading: false,
  error: null,

  loadClients: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchClients();
      set({ clients: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addClient: async (clientData) => {
    const newClient = await createClient(clientData);
    set((state) => ({ clients: [...state.clients, newClient] }));
    return newClient;
  },

  editClient: async (id, clientData) => {
    const updated = await updateClient(id, clientData);
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  removeClient: async (id) => {
    await deleteClient(id);
    set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }));
  },
}));

export default useClientStore;