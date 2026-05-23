import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import useTicketStore from '../store/ticketStore';
import useScreenStore from '../store/screenStore';
import useAuthStore from '../store/authStore';

export default function CreateTicketScreen({ navigation }) {
  const screens = useScreenStore((state) => state.screens) || [];
  const loadScreens = useScreenStore((state) => state.loadScreens);
  const addTicket = useTicketStore((state) => state.addTicket);
  const user = useAuthStore((state) => state.user);

  const [screenId, setScreenId] = useState('');
  const [problemType, setProblemType] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  useEffect(() => {
    loadScreens();
  }, [loadScreens]);

  const handleSubmit = async () => {
    if (!screenId || !problemType || !description) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    try {
      await addTicket({
        screenId: Number(screenId),
        problemType,
        description,
        priority,
        createdByUserId: 1
      });
      Alert.alert('Succès', 'Ticket créé');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de créer le ticket');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Écran</Text>
      <Picker selectedValue={screenId} onValueChange={setScreenId}>
        <Picker.Item label="Sélectionnez un écran" value="" />
        {Array.isArray(screens) && screens.map(s => (
          <Picker.Item key={s.id} label={s.name || s.reference} value={s.id.toString()} />
        ))}
      </Picker>
      <Text>Type de problème</Text>
      <TextInput style={styles.input} value={problemType} onChangeText={setProblemType} />
      <Text>Description</Text>
      <TextInput style={[styles.input, { height: 80 }]} multiline value={description} onChangeText={setDescription} />
      <Text>Priorité</Text>
      <Picker selectedValue={priority} onValueChange={setPriority}>
        <Picker.Item label="Basse" value="LOW" />
        <Picker.Item label="Moyenne" value="MEDIUM" />
        <Picker.Item label="Haute" value="HIGH" />
        <Picker.Item label="Critique" value="CRITICAL" />
      </Picker>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Créer le ticket</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginVertical: 8 },
  button: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: 'white', fontWeight: 'bold' }
});