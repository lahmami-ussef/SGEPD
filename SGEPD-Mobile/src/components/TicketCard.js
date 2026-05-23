import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TicketCard({ ticket, onPress }) {
  const getPriorityColor = (priority) => {
    if (priority === 'CRITICAL') return '#dc2626';
    if (priority === 'High' || priority === 'HIGH') return '#f97316';
    if (priority === 'Medium' || priority === 'MEDIUM') return '#eab308';
    return '#6b7280';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.number}>#{ticket.reference || ticket.ticketNumber}</Text>
      <Text>{ticket.description || ticket.problemType}</Text>
      <Text>Statut : {ticket.status}</Text>
      <Text style={{ color: getPriorityColor(ticket.priority) }}>Priorité : {ticket.priority}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', margin: 10, padding: 15, borderRadius: 12, elevation: 2 },
  number: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
});