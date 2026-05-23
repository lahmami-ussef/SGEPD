import { MOCK_CLIENTS } from '../mockData/mockData';
import { simulateNetworkDelay } from '../mockData/mockConfig';

let clients = [...MOCK_CLIENTS];
let nextId = Math.max(...clients.map((c) => c.id)) + 1;

export const fetchClients = async () => {
  await simulateNetworkDelay();
  return [...clients];
};

export const createClient = async (data) => {
  await simulateNetworkDelay();
  const newClient = {
    ...data,
    id: nextId++,
    status: data.status || 'Active',
    createdAt: new Date().toISOString(),
  };
  clients.push(newClient);
  return newClient;
};

export const updateClient = async (id, data) => {
  await simulateNetworkDelay();
  const index = clients.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Client introuvable');
  clients[index] = { ...clients[index], ...data };
  return clients[index];
};

export const deleteClient = async (id) => {
  await simulateNetworkDelay();
  clients = clients.filter((c) => c.id !== id);
};