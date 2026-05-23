import { create } from 'zustand';
import { fetchTickets, createTicket, updateTicketStatus, resolveTicket, deleteTicket } from '../services/ticketService';

const useTicketStore = create((set) => ({
  tickets: [],
  loading: false,
  error: null,

  loadTickets: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchTickets();
      set({ tickets: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addTicket: async (ticketData) => {
    const newTicket = await createTicket(ticketData);
    set((state) => ({ tickets: [...state.tickets, newTicket] }));
    return newTicket;
  },

  changeStatus: async (id, action) => {
    const updated = await updateTicketStatus(id, action);
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
    }));
  },

  resolveTicket: async (id, report) => {
    const updated = await resolveTicket(id, report);
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
    }));
  },

  removeTicket: async (id) => {
    await deleteTicket(id);
    set((state) => ({ tickets: state.tickets.filter((t) => t.id !== id) }));
  },
}));

export default useTicketStore;