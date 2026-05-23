// src/screens/ScreensListScreen.js (version complète avec recherche et modal)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useScreenStore from '../store/screenStore';
import useAuthStore from '../store/authStore';
import ScreenCard from '../components/ScreenCard';
import ScreenFormModal from '../components/ScreenFormModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function ScreensListScreen() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const { screens, loading, error, loadScreens, addScreen, editScreen } = useScreenStore();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingScreen, setEditingScreen] = useState(null);

  useEffect(() => {
    loadScreens();
  }, []);

  const filteredScreens = screens.filter(screen =>
    screen.name?.toLowerCase().includes(search.toLowerCase()) ||
    screen.brand?.toLowerCase().includes(search.toLowerCase()) ||
    screen.city?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditingScreen(null);
    setModalVisible(true);
  };

  const handleEdit = (screen) => {
    setEditingScreen(screen);
    setModalVisible(true);
  };

  const handleSubmit = async (data) => {
    if (editingScreen) {
      await editScreen(editingScreen.id, data);
    } else {
      await addScreen(data);
    }
    setModalVisible(false);
    setEditingScreen(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom, marque, ville..."
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filteredScreens}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ScreenCard screen={item} onEdit={handleEdit} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Aucun écran trouvé</Text>}
      />
      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={handleAdd}>
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
      <ScreenFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialData={editingScreen}
        isEditing={!!editingScreen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', margin: 12, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  list: { paddingBottom: 80 },
  empty: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#10b981', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 }
});