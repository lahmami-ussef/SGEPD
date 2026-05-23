// src/screens/LocationsListScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useLocationStore from '../store/locationStore';
import useScreenStore from '../store/screenStore';
import useAuthStore from '../store/authStore';
import LocationCard from '../components/LocationCard';
import LocationFormModal from '../components/LocationFormModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function LocationsListScreen() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const { locations, loading, error, loadLocations, addLocation, editLocation } = useLocationStore();
  const { screens, loadScreens } = useScreenStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  useEffect(() => {
    loadLocations();
    loadScreens();
  }, []);

  const handleAdd = () => {
    setEditingLocation(null);
    setModalVisible(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setModalVisible(true);
  };

  const handleSubmit = async (data) => {
    if (editingLocation) {
      await editLocation(editingLocation.id, data);
    } else {
      await addLocation(data);
    }
    setModalVisible(false);
    setEditingLocation(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <LocationCard location={item} onPress={() => isAdmin && handleEdit(item)} />}
        contentContainerStyle={styles.list}
      />
      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={handleAdd}>
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
      <LocationFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialData={editingLocation}
        isEditing={!!editingLocation}
        screens={screens}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#10b981', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 }
});