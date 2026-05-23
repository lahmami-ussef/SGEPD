import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import useAuthStore from '../store/authStore';
import useScreenStore from '../store/screenStore';
import useTicketStore from '../store/ticketStore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const { screens, loading: screensLoading, error: screensError, loadScreens } = useScreenStore();
  const { tickets, loading: ticketsLoading, error: ticketsError, loadTickets } = useTicketStore();

  useEffect(() => {
    loadScreens();
    loadTickets();
  }, []);

  const onRefresh = () => {
    loadScreens();
    loadTickets();
  };

  if (screensLoading || ticketsLoading) return <LoadingSpinner />;
  if (screensError || ticketsError) return <ErrorMessage message={screensError || ticketsError} />;

  const totalScreens = screens?.length || 0;
  const activeScreens = screens?.filter(s => s.status === 'Active' || s.status === 'ACTIF').length || 0;
  const offlineScreens = screens?.filter(s => s.status === 'Maintenance' || s.status === 'EN_MAINTENANCE' || s.status === 'EN_PANNE').length || 0;
  const totalTickets = tickets?.length || 0;
  const openTickets = tickets?.filter(t => t.status === 'Open' || (t.status !== 'Resolved' && t.status !== 'RESOLVED' && t.status !== 'Closed' && t.status !== 'CLOSED')).length || 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={screensLoading || ticketsLoading} onRefresh={onRefresh} />}
    >
      <Text style={styles.welcome}>Bonjour, {user?.username} ({user?.role})</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Écrans</Text>
        <Text style={styles.cardValue}>{totalScreens}</Text>
        <Text>Actifs : {activeScreens}</Text>
        <Text>En panne : {offlineScreens}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tickets</Text>
        <Text style={styles.cardValue}>{totalTickets}</Text>
        <Text>Ouverts : {openTickets}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9fafb' },
  welcome: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 16, color: '#6b7280' },
  cardValue: { fontSize: 32, fontWeight: 'bold', color: '#10b981', marginVertical: 8 },
});