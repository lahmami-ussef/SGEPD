// src/screens/ClientsListScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useClientStore from '../store/clientStore';
import useAuthStore from '../store/authStore';
import ClientCard from '../components/ClientCard';
import ClientFormModal from '../components/ClientFormModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function ClientsListScreen() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const { clients, loading, error, loadClients, addClient, editClient } = useClientStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const handleAdd = () => {
    setEditingClient(null);
    setModalVisible(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setModalVisible(true);
  };

  const handleSubmit = async (data) => {
    if (editingClient) {
      await editClient(editingClient.id, data);
    } else {
      await addClient(data);
    }
    setModalVisible(false);
    setEditingClient(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ClientCard client={item} onPress={() => isAdmin && handleEdit(item)} />}
        contentContainerStyle={styles.list}
      />
      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={handleAdd}>
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
      <ClientFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialData={editingClient}
        isEditing={!!editingClient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#10b981', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 }
});