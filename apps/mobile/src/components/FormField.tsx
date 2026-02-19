import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  helperText?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  helperText,
  multiline = false,
  numberOfLines = 1,
}: Props) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      multiline={multiline}
      numberOfLines={multiline ? numberOfLines : undefined}
      textAlignVertical={multiline ? 'top' : 'center'}
      autoCorrect={false}
    />
    {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    color: '#111827',
    fontSize: 14,
  },
  multiline: {
    height: 108,
    paddingTop: 12,
    paddingBottom: 12,
  },
  helperText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
});
