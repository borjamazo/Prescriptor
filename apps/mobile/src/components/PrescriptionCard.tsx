import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatusBadge } from './StatusBadge';
import { colors } from '../design-system/tokens';
import type { Prescription } from '../services/PrescriptionService';

interface Props {
  prescription: Prescription;
  onSign?: (prescription: Prescription) => void;
  onShare?: (prescription: Prescription) => void;
  isSigning?: boolean;
}

export const PrescriptionCard = ({ prescription, onSign, onShare, isSigning = false }: Props) => {
  const { patientName, patientDocument, rxNumber, status, medication, dosage, date } = prescription;
  const dotColor = colors.status[status].dot;
  const isSigned = status === 'signed';
  const canSign = status === 'pending';

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
        <View style={styles.headerRight}>
          <StatusBadge status={status} />
        </View>
      </View>

      {/* Medication */}
      <View style={styles.medicationRow}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.medication}>{medication}</Text>
      </View>
      <Text style={styles.dosage}>{dosage}</Text>
      <Text style={styles.date}>{date}</Text>

      {/* Action buttons */}
      <View style={styles.actions}>
        {/* Sign button - only visible if pending */}
        {canSign && onSign && (
          <TouchableOpacity
            style={[styles.actionButton, styles.signButton, isSigning && styles.signButtonDisabled]}
            onPress={isSigning ? undefined : () => onSign(prescription)}
            activeOpacity={isSigning ? 1 : 0.7}
            disabled={isSigning}
          >
            {isSigning ? (
              <ActivityIndicator size="small" color="#5551F5" />
            ) : (
              <Ionicons name="create-outline" size={18} color="#5551F5" />
            )}
            <Text style={styles.signButtonText}>{isSigning ? 'Firmando...' : 'Firmar'}</Text>
          </TouchableOpacity>
        )}

        {/* Share button - only enabled if signed */}
        {onShare && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.shareButton,
              !isSigned && styles.shareButtonDisabled,
            ]}
            onPress={isSigned ? () => onShare(prescription) : undefined}
            activeOpacity={isSigned ? 0.7 : 1}
            disabled={!isSigned}
          >
            <Ionicons
              name="share-social-outline"
              size={18}
              color={isSigned ? '#10B981' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.shareButtonText,
                !isSigned && styles.shareButtonTextDisabled,
              ]}
            >
              Compartir
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
  headerRight: {
    marginLeft: 8,
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
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  signButton: {
    borderColor: '#5551F5',
    backgroundColor: '#EEF2FF',
  },
  signButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5551F5',
  },
  signButtonDisabled: {
    opacity: 0.6,
  },
  shareButton: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  shareButtonDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  shareButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
