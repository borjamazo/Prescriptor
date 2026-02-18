import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  value: number;
  label: string;
}

export const StatCard = ({ value, label }: Props) => (
  <View style={styles.container}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
  },
  value: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 30,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 4,
  },
});
