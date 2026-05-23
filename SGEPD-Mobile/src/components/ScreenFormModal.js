// src/components/ScreenFormModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ScreenFormModal = ({ visible, onClose, onSubmit, initialData, isEditing }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [size, setSize] = useState('');
  const [resolution, setResolution] = useState('');
  const [os, setOs] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('ACTIF');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setBrand(initialData.brand || '');
      setModel(initialData.model || '');
      setSize(initialData.size || '');
      setResolution(initialData.resolution || '');
      setOs(initialData.os || '');
      setCity(initialData.city || '');
      setAddress(initialData.address || '');
      setStatus(initialData.status || 'ACTIF');
    } else {
      // Reset form
      setName('');
      setBrand('');
      setModel('');
      setSize('');
      setResolution('');
      setOs('');
      setCity('');
      setAddress('');
      setStatus('ACTIF');
    }
  }, [initialData, visible]);

  const handleSubmit = () => {
    if (!name || !brand || !city) {
      alert('Veuillez remplir au moins le nom, la marque et la ville');
      return;
    }
    const screenData = {
      name, brand, model, size, resolution, os, city, address, status
    };
    onSubmit(screenData);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Modifier l\'écran' : 'Ajouter un écran'}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nom de l'écran" />

            <Text style={styles.label}>Marque *</Text>
            <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="Samsung, LG, etc." />

            <Text style={styles.label}>Modèle</Text>
            <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="Modèle" />

            <Text style={styles.label}>Taille</Text>
            <TextInput style={styles.input} value={size} onChangeText={setSize} placeholder="55 pouces" />

            <Text style={styles.label}>Résolution</Text>
            <TextInput style={styles.input} value={resolution} onChangeText={setResolution} placeholder="3840x2160" />

            <Text style={styles.label}>Système d'exploitation</Text>
            <TextInput style={styles.input} value={os} onChangeText={setOs} placeholder="Android, Tizen, etc." />

            <Text style={styles.label}>Ville *</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Casablanca" />

            <Text style={styles.label}>Adresse</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Adresse complète" />

            <Text style={styles.label}>Statut</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={status} onValueChange={setStatus}>
                <Picker.Item label="Actif" value="ACTIF" />
                <Picker.Item label="En panne" value="EN_PANNE" />
                <Picker.Item label="En maintenance" value="EN_MAINTENANCE" />
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
                <Text style={styles.buttonText}>{isEditing ? 'Modifier' : 'Ajouter'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#10b981' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 4, color: '#374151' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#f9fafb' },
  pickerContainer: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, marginTop: 4, backgroundColor: '#f9fafb' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, marginBottom: 8, gap: 12 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#9ca3af' },
  submitButton: { backgroundColor: '#10b981' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});

export default ScreenFormModal;