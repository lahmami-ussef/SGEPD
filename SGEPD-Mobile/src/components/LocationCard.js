import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function LocationCard({ location, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.city}>{location.nom || location.city}</Text>
      <Text>Adresse : {location.adresse || location.address}</Text>
      <Text>Zone : {location.zone || location.type || 'N/A'}</Text>
      <Text>Coords : {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}</Text>
      <Text>Statut : {location.status || 'N/A'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', margin: 10, padding: 15, borderRadius: 12, elevation: 2 },
  city: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
});