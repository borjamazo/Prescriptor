import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { BiometricService } from '../services/BiometricService';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const { login, enableBiometrics, biometricsEnabled } = useAuth();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    setShowBiometricPrompt(true);
  };

  const handleBiometricChoice = async (enable: boolean) => {
    if (enable) {
      const success = await BiometricService.enableBiometrics();
      if (success) enableBiometrics();
    }
    login();
  };

  const handleBiometricLogin = async () => {
    const success = await BiometricService.authenticate();
    if (success) login();
    else Alert.alert('Error', 'Autenticación biométrica fallida');
  };

  if (showBiometricPrompt) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>¿Activar acceso con huella?</Text>
        <View style={styles.buttonRow}>
          <Button title="Sí" onPress={() => handleBiometricChoice(true)} />
          <View style={styles.spacer} />
          <Button title="No" onPress={() => handleBiometricChoice(false)} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Entrar" onPress={handleLogin} />
      {biometricsEnabled && (
        <>
          <View style={styles.spacer} />
          <Button title="Entrar con huella" onPress={handleBiometricLogin} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  spacer: {
    width: 16,
    height: 16,
  },
});
