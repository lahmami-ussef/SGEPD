import * as SecureStore from 'expo-secure-store';
import { MOCK_USERS, MOCK_TOKEN } from '../mockData/mockData';
import { USE_MOCK_DATA, simulateNetworkDelay } from '../mockData/mockConfig';

export const login = async (username, password) => {
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay();
    const user = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) throw new Error('Identifiants invalides');

    // Stocker token ET user directement — pas besoin de décoder le JWT
    await SecureStore.setItemAsync('token', MOCK_TOKEN);
    await SecureStore.setItemAsync('user', JSON.stringify({
      username: user.username,
      role: user.role,
      email: user.email,
    }));
    return { user: { username: user.username, role: user.role }, token: MOCK_TOKEN };
  }

  // Mode réel (non utilisé actuellement)
  const response = await api.post('/auth/login', { username, password });
  const { token } = response.data;
  await SecureStore.setItemAsync('token', token);
  const { jwtDecode } = await import('jwt-decode');
  const decoded = jwtDecode(token);
  const userData = { username: decoded.sub, role: decoded.role };
  await SecureStore.setItemAsync('user', JSON.stringify(userData));
  return { user: userData, token };
};

export const register = async (username, email, password, role) => {
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay();
    return { success: true, message: 'Inscription réussie' };
  }
  const response = await api.post('/auth/register', { username, email, password, role });
  return response.data;
};

export const logout = async () => {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('user');
};

export const getStoredToken = async () => {
  try {
    return await SecureStore.getItemAsync('token');
  } catch {
    return null;
  }
};

// Nouvelle fonction — lit le user sans décoder le JWT
export const getStoredUser = async () => {
  try {
    const json = await SecureStore.getItemAsync('user');
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
};