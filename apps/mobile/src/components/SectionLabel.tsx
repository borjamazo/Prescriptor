import React from 'react';
import { StyleSheet, Text } from 'react-native';

interface Props {
  title: string;
}

export const SectionLabel = ({ title }: Props) => (
  <Text style={styles.label}>{title}</Text>
);

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
});
