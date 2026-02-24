import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatusBadge } from './StatusBadge';
import { colors } from '../design-system/tokens';
import type { Prescription } from '../services/PrescriptionService';
import { isDebugMode } from '../config/debugConfig';

interface Props {
  prescription: Prescription;
  onSign?: (prescription: Prescription) => void;
  onShare?: (prescription: Prescription) => void;
  isSigning?: boolean;
  // DEBUG PROPS - Remove when debugging is complete
  onDebugRegenerate?: (prescription: Prescription) => void;
  onDebugShare?: (prescription: Prescription) => void;
  isRegenerating?: boolean;
}

export const PrescriptionCard = ({ 
  prescription, 
  onSign, 
  onShare, 
  isSigning = false,
  // DEBUG PROPS
  onDebugRegenerate,
  onDebugShare,
  isRegenerating = false,
}: Props) => {
  const { patientName, patientDocument, rxNumber, status, medication, dosage, date } = prescription;
  const dotColor = colors.status[status].dot;
  const isSigned = status === 'signed';
  const canSign = status === 'pending';
  const debugMode = isDebugMode();

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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DEBUG SECTION - Remove this entire section when debugging is complete */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {debugMode && (
        <View style={styles.debugSection}>
          <Text style={styles.debugLabel}>🔧 DEBUG MODE</Text>
          <View style={styles.debugActions}>
            {/* Regenerate PDF button */}
            {onDebugRegenerate && (
              <TouchableOpacity
                style={[styles.debugButton, styles.regenerateButton, isRegenerating && styles.debugButtonDisabled]}
                onPress={isRegenerating ? undefined : () => onDebugRegenerate(prescription)}
                activeOpacity={isRegenerating ? 1 : 0.7}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <ActivityIndicator size="small" color="#F59E0B" />
                ) : (
                  <Ionicons name="refresh-outline" size={16} color="#F59E0B" />
                )}
                <Text style={styles.regenerateButtonText}>
                  {isRegenerating ? 'Generando...' : 'Regenerar PDF'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Debug share button */}
            {onDebugShare && (
              <TouchableOpacity
                style={[styles.debugButton, styles.debugShareButton]}
                onPress={() => onDebugShare(prescription)}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={16} color="#8B5CF6" />
                <Text style={styles.debugShareButtonText}>Compartir</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* END DEBUG SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
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
  
  // ═══════════════════════════════════════════════════════════════════
  // DEBUG STYLES - Remove when debugging is complete
  // ═══════════════════════════════════════════════════════════════════
  debugSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#FEF3C7',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
  },
  debugLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  debugActions: {
    flexDirection: 'row',
    gap: 8,
  },
  debugButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  debugButtonDisabled: {
    opacity: 0.6,
  },
  regenerateButton: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  regenerateButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  debugShareButton: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  debugShareButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  // ═══════════════════════════════════════════════════════════════════
  // END DEBUG STYLES
  // ═══════════════════════════════════════════════════════════════════
});
