import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, margin: 10 },
  text: { color: '#b91c1c', fontSize: 14, textAlign: 'center' },
});