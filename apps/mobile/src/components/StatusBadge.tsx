import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { PrescriptionStatus } from '../services/PrescriptionService';

interface Config {
  label: string;
  icon: string;
  iconColor: string;
  badgeStyle: object;
  textStyle: object;
}

const STATUS: Record<PrescriptionStatus, Config> = {
  pending: {
    label: 'Pending',
    icon: 'time-outline',
    iconColor: '#D97706',
    badgeStyle: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
    textStyle: { color: '#D97706' },
  },
  signed: {
    label: 'Signed',
    icon: 'checkmark-circle-outline',
    iconColor: '#059669',
    badgeStyle: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
    textStyle: { color: '#059669' },
  },
  expired: {
    label: 'Expired',
    icon: 'alert-circle-outline',
    iconColor: '#EF4444',
    badgeStyle: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
    textStyle: { color: '#EF4444' },
  },
};

interface Props {
  status: PrescriptionStatus;
}

export const StatusBadge = ({ status }: Props) => {
  const { label, icon, iconColor, badgeStyle, textStyle } = STATUS[status];
  return (
    <View style={[styles.badge, badgeStyle]}>
      <Ionicons name={icon} size={12} color={iconColor} />
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
