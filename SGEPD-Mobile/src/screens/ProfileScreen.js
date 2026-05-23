import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import useAuthStore from '../store/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Nom d'utilisateur</Text>
        <Text style={styles.value}>{user?.username}</Text>
        <Text style={styles.label}>Rôle</Text>
        <Text style={styles.value}>{user?.role}</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9fafb' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 20, elevation: 2 },
  label: { fontSize: 14, color: '#6b7280', marginTop: 10 },
  value: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  logoutButton: { backgroundColor: '#ef4444', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  logoutText: { color: 'white', fontWeight: 'bold' },
});