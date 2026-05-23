import { MOCK_TICKETS } from '../mockData/mockData';
import { simulateNetworkDelay } from '../mockData/mockConfig';

let tickets = [...MOCK_TICKETS];
let nextId = Math.max(...tickets.map((t) => t.id)) + 1;

export const fetchTickets = async () => {
  await simulateNetworkDelay();
  return [...tickets];
};

export const createTicket = async (data) => {
  await simulateNetworkDelay();
  const newTicket = {
    ...data,
    id: nextId++,
    reference: `TKT-2025-${String(nextId).padStart(3, '0')}`,
    status: 'Open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tickets.push(newTicket);
  return newTicket;
};

export const updateTicketStatus = async (id, action) => {
  await simulateNetworkDelay();
  const index = tickets.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('Ticket introuvable');
  const statusMap = {
    start: 'InProgress',
    close: 'Closed',
    reopen: 'Open',
  };
  tickets[index] = {
    ...tickets[index],
    status: statusMap[action] || action,
    updatedAt: new Date().toISOString(),
  };
  return tickets[index];
};

export const resolveTicket = async (id, report) => {
  await simulateNetworkDelay();
  const index = tickets.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('Ticket introuvable');
  tickets[index] = {
    ...tickets[index],
    status: 'Resolved',
    interventionReport: report,
    updatedAt: new Date().toISOString(),
  };
  return tickets[index];
};

export const deleteTicket = async (id) => {
  await simulateNetworkDelay();
  tickets = tickets.filter((t) => t.id !== id);
};