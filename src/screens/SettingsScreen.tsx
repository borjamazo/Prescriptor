import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export const SettingsScreen = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Salir', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.text}>Pantalla de configuración</Text>
        <View style={styles.spacer} />
        <Button title="Cerrar sesión" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111111',
  },
  text: {
    fontSize: 14,
    color: '#666666',
  },
  spacer: {
    height: 24,
  },
});
