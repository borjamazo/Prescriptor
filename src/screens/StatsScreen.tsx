import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const StatsScreen = () => (
  <SafeAreaView style={styles.container} edges={['bottom']}>
    <View style={styles.content}>
      <Text style={styles.title}>Estadísticas</Text>
      <Text style={styles.text}>Historial de documentos firmados</Text>
    </View>
  </SafeAreaView>
);

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
});
