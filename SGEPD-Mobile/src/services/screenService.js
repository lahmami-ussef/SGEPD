import { MOCK_SCREENS } from '../mockData/mockData';
import { simulateNetworkDelay } from '../mockData/mockConfig';

// Base mutable en mémoire — les modifs persistent pendant la session
let screens = [...MOCK_SCREENS];
let nextId = Math.max(...screens.map((s) => s.id)) + 1;

export const fetchScreens = async () => {
  await simulateNetworkDelay();
  return [...screens];
};

export const createScreen = async (data) => {
  await simulateNetworkDelay();
  const newScreen = {
    ...data,
    id: nextId++,
    reference: `SCR-${String(nextId).padStart(3, '0')}`,
    status: data.status || 'Active',
    createdAt: new Date().toISOString(),
  };
  screens.push(newScreen);
  return newScreen;
};

export const updateScreen = async (id, data) => {
  await simulateNetworkDelay();
  const index = screens.findIndex((s) => s.id === id);
  if (index === -1) throw new Error('Écran introuvable');
  screens[index] = { ...screens[index], ...data };
  return screens[index];
};

export const deleteScreen = async (id) => {
  await simulateNetworkDelay();
  screens = screens.filter((s) => s.id !== id);
};