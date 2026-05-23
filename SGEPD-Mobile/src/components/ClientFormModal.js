// src/components/ClientFormModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';

const ClientFormModal = ({ visible, onClose, onSubmit, initialData, isEditing }) => {
  const [raisonSociale, setRaisonSociale] = useState('');
  const [nomContact, setNomContact] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adressePostale, setAdressePostale] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (initialData) {
      setRaisonSociale(initialData.raisonSociale || '');
      setNomContact(initialData.nomContact || '');
      setEmail(initialData.email || '');
      setTelephone(initialData.telephone || '');
      setAdressePostale(initialData.adressePostale || '');
      setUserId(initialData.userId ? String(initialData.userId) : '');
    } else {
      setRaisonSociale('');
      setNomContact('');
      setEmail('');
      setTelephone('');
      setAdressePostale('');
      setUserId('');
    }
  }, [initialData, visible]);

  const handleSubmit = () => {
    if (!raisonSociale || !nomContact || !email || !telephone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    const clientData = {
      raisonSociale,
      nomContact,
      email,
      telephone,
      adressePostale,
      userId: userId ? parseInt(userId) : null
    };
    onSubmit(clientData);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{isEditing ? 'Modifier le client' : 'Ajouter un client'}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Raison sociale *</Text>
            <TextInput style={styles.input} value={raisonSociale} onChangeText={setRaisonSociale} placeholder="Nom de l'entreprise" />

            <Text style={styles.label}>Nom du contact *</Text>
            <TextInput style={styles.input} value={nomContact} onChangeText={setNomContact} placeholder="Nom du responsable" />

            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="contact@entreprise.com" keyboardType="email-address" />

            <Text style={styles.label}>Téléphone *</Text>
            <TextInput style={styles.input} value={telephone} onChangeText={setTelephone} placeholder="+212 6xx xxx xxx" keyboardType="phone-pad" />

            <Text style={styles.label}>Adresse postale</Text>
            <TextInput style={styles.input} value={adressePostale} onChangeText={setAdressePostale} placeholder="Adresse complète" />

            <Text style={styles.label}>ID utilisateur associé</Text>
            <TextInput style={styles.input} value={userId} onChangeText={setUserId} placeholder="ID (optionnel)" keyboardType="numeric" />

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
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, marginBottom: 8, gap: 12 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#9ca3af' },
  submitButton: { backgroundColor: '#10b981' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});

export default ClientFormModal;