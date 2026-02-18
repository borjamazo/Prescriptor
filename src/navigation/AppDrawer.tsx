import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { HomeScreen } from '../screens/HomeScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Button, Alert } from 'react-native';

const Stack = createNativeStackNavigator();

export const AppStack = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Salir', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', onPress: logout },
    ]);
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          headerRight: () => <Button title="Salir" onPress={handleLogout} />,
        }}
      />
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Cuenta' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configuración' }} />
    </Stack.Navigator>
  );
};
