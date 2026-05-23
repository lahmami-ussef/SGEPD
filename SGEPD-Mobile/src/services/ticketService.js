import api from '../api';
import { USE_MOCK_DATA, simulateNetworkDelay } from '../mockData/mockConfig';
import { MOCK_TICKETS } from '../mockData/mockData';

let mockTickets = [...MOCK_TICKETS];
let nextMockId = Math.max(...MOCK_TICKETS.map(t => t.id)) + 1;

export const fetchTickets = async () => {
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay();
    return mockTickets;
  }
  const response = await api.get('/tickets');
  return response.data;
};

export const createTicket = async (ticketData) => {
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay();
    const newTicket = {
      id: nextMockId++,
      reference: `TKT-2025-${String(nextMockId).padStart(3, '0')}`,
      ...ticketData,
      status: ticketData.status || 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockTickets.push(newTicket);
    return newTicket;
  }
  const response = await api.post('/tickets', ticketData);
  return response.data;
};

export const updateTicketStatus = async (id, action) => {
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay();
    const index = mockTickets.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Ticket not found');
    
    // Simulate different status actions
    let newStatus = mockTickets[index].status;
    if (action === 'assign') newStatus = 'InProgress';
    else if (action === 'close') newStatus = 'Closed';
    else if (action === 'reopen') newStatus = 'Open';
    
    const updated = { 
      ...mockTickets[index], 
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    mockTickets[index] = updated;
    return updated;
  }
  const response = await api.put(`/tickets/${id}/${action}`, {});
  return response.data;
};

export const resolveTicket = async (id, interventionReport) => {
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay();
    const index = mockTickets.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Ticket not found');
    const updated = {
      ...mockTickets[index],
      status: 'Resolved',
      interventionReport,
      updatedAt: new Date().toISOString()
    };
    mockTickets[index] = updated;
    return updated;
  }
  const response = await api.put(`/tickets/${id}/resolve`, { interventionReport });
  return response.data;
};