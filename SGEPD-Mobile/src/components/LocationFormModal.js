// src/components/LocationFormModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const LocationFormModal = ({ visible, onClose, onSubmit, initialData, isEditing, screens = [] }) => {
  const [screenId, setScreenId] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => {
    if (initialData) {
      setScreenId(initialData.screenId ? String(initialData.screenId) : '');
      setCity(initialData.city || '');
      setAddress(initialData.address || '');
      setCountry(initialData.country || '');
      setLatitude(initialData.latitude ? String(initialData.latitude) : '');
      setLongitude(initialData.longitude ? String(initialData.longitude) : '');
      setPostalCode(initialData.postalCode || '');
      setRegion(initialData.region || '');
    } else {
      setScreenId('');
      setCity('');
      setAddress('');
      setCountry('');
      setLatitude('');
      setLongitude('');
      setPostalCode('');
      setRegion('');
    }
  }, [initialData, visible]);

  const handleSubmit = () => {
    if (!screenId || !city || !address || !country || !latitude || !longitude) {
      alert('Veuillez remplir tous les champs obligatoires (écran, ville, adresse, pays, latitude, longitude)');
      return;
    }
    const locationData = {
      screenId: parseInt(screenId),
      city,
      address,
      country,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      postalCode,
      region
    };
    onSubmit(locationData);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{isEditing ? 'Modifier la localisation' : 'Ajouter une localisation'}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Écran associé *</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={screenId} onValueChange={setScreenId}>
                <Picker.Item label="Sélectionnez un écran" value="" />
                {screens.map(s => (
                  <Picker.Item key={s.id} label={s.name} value={s.id.toString()} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Ville *</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Casablanca" />

            <Text style={styles.label}>Adresse *</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="12 Rue de la Mer" />

            <Text style={styles.label}>Pays *</Text>
            <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="Maroc" />

            <Text style={styles.label}>Latitude *</Text>
            <TextInput style={styles.input} value={latitude} onChangeText={setLatitude} placeholder="33.5731" keyboardType="numeric" />

            <Text style={styles.label}>Longitude *</Text>
            <TextInput style={styles.input} value={longitude} onChangeText={setLongitude} placeholder="-7.5898" keyboardType="numeric" />

            <Text style={styles.label}>Code postal</Text>
            <TextInput style={styles.input} value={postalCode} onChangeText={setPostalCode} placeholder="20000" />

            <Text style={styles.label}>Région</Text>
            <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="Casablanca-Settat" />

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

export default LocationFormModal;