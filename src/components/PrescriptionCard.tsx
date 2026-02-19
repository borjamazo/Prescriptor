import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from './StatusBadge';
import { colors } from '../design-system/tokens';
import type { Prescription } from '../services/PrescriptionService';

interface Props {
  prescription: Prescription;
}

export const PrescriptionCard = ({ prescription }: Props) => {
  const { patientName, patientDocument, rxNumber, status, medication, dosage, date } = prescription;
  const dotColor = colors.status[status].dot;

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.patientName}>{patientName}</Text>
          {patientDocument ? (
            <Text style={styles.patientDocument}>{patientDocument}</Text>
          ) : null}
          <Text style={styles.rxNumber}>{rxNumber}</Text>
        </View>
        <StatusBadge status={status} />
      </View>

      {/* Medication */}
      <View style={styles.medicationRow}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.medication}>{medication}</Text>
      </View>
      <Text style={styles.dosage}>{dosage}</Text>
      <Text style={styles.date}>{date}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  patientName: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 16,
  },
  patientDocument: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 1,
  },
  rxNumber: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 1,
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  medication: {
    color: '#1F2937',
    fontWeight: '600',
    fontSize: 14,
  },
  dosage: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 16,
  },
  date: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 16,
    marginTop: 2,
  },
});
