import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ClientCard({ client, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{client.nom || client.raisonSociale}</Text>
      <Text>Email : {client.email || 'N/A'}</Text>
      <Text>Tél : {client.phone || client.telephone || 'N/A'}</Text>
      <Text>Type : {client.type || 'N/A'}</Text>
      <Text>Statut : {client.status || 'N/A'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', margin: 10, padding: 15, borderRadius: 12, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
});