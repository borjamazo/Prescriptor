import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { SigningRecord } from '../services/SigningService';

interface Props {
  record: SigningRecord;
  onOpen?: () => void;
  onShare?: () => void;
}

export const SignedDocumentCard = ({ record, onOpen, onShare }: Props) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name="document-text" size={22} color="#5551F5" />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {record.fileName}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="checkmark-circle" size={13} color="#059669" />
          <Text style={styles.meta}>{record.signedAt}</Text>
        </View>
      </View>
    </View>

    <View style={styles.actions}>
      <TouchableOpacity style={styles.actionBtn} onPress={onOpen} activeOpacity={0.7}>
        <Ionicons name="eye-outline" size={15} color="#5551F5" />
        <Text style={styles.actionText}>Abrir</Text>
      </TouchableOpacity>
      <View style={styles.actionDivider} />
      <TouchableOpacity style={styles.actionBtn} onPress={onShare} activeOpacity={0.7}>
        <Ionicons name="share-outline" size={15} color="#5551F5" />
        <Text style={styles.actionText}>Compartir</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontSize: 12,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  actionDivider: {
    width: 1,
    backgroundColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5551F5',
  },
});
