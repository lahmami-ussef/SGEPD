import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../store/authStore';
import useScreenStore from '../store/screenStore';

const ScreenCard = ({ screen, onEdit }) => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';
  const removeScreen = useScreenStore((state) => state.removeScreen);

  const getStatusColor = (status) => {
    if (status === 'Active' || status === 'ACTIF') return '#10b981';
    if (status === 'Maintenance' || status === 'EN_MAINTENANCE') return '#f59e0b';
    if (status === 'EN_PANNE') return '#ef4444';
    return '#6b7280';
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer',
      `Voulez-vous vraiment supprimer l'écran "${screen.name || screen.reference}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => removeScreen(screen.id) }
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{screen.name || screen.reference}</Text>
        {isAdmin && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(screen)} style={styles.actionBtn}>
              <Ionicons name="pencil" size={20} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text>Modèle : {screen.model || 'N/A'}</Text>
      <Text>Localisation : {screen.location || 'N/A'}</Text>
      <Text style={{ color: getStatusColor(screen.status), fontWeight: 'bold' }}>
        Statut : {screen.status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', margin: 10, padding: 15, borderRadius: 12, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 18, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 4 }
});

export default ScreenCard;