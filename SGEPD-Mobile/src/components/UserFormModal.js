// src/components/UserFormModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const UserFormModal = ({ visible, onClose, onSubmit, initialData, isEditing }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username || '');
      setEmail(initialData.email || '');
      setPassword(''); // On ne pré-remplit pas le mot de passe pour modification
      setRole(initialData.role || 'CLIENT');
    } else {
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('CLIENT');
    }
  }, [initialData, visible]);

  const handleSubmit = () => {
    if (!username || !email || (!isEditing && !password)) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    const userData = { username, email, role };
    if (password) userData.password = password;
    onSubmit(userData);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{isEditing ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nom d'utilisateur *</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="username" autoCapitalize="none" />

            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@exemple.com" keyboardType="email-address" />

            {!isEditing && (
              <>
                <Text style={styles.label}>Mot de passe *</Text>
                <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="********" secureTextEntry />
              </>
            )}

            <Text style={styles.label}>Rôle</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={role} onValueChange={setRole}>
                <Picker.Item label="Client" value="CLIENT" />
                <Picker.Item label="Technicien" value="TECHNICIEN" />
                <Picker.Item label="Administrateur" value="ADMIN" />
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

export default UserFormModal;