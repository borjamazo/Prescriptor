import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  PrescriptionBlock,
  PrescriptionBlockService,
} from '../services/PrescriptionBlockService';

// ─── Block Card (Simplified - Read Only) ──────────────────────────────────────

interface BlockCardProps {
  block: PrescriptionBlock;
  onSelect: () => void;
}

const BlockCard = ({ block, onSelect }: BlockCardProps) => {
  const pending = block.totalRecetas - block.usedCount;
  const pct = block.totalRecetas > 0 ? block.usedCount / block.totalRecetas : 0;
  const nextSerial = PrescriptionBlockService.computeSerial(block.blockSerial, block.nextIndex);
  const firstSerial = PrescriptionBlockService.computeSerial(block.blockSerial, 0);
  const lastSerial = PrescriptionBlockService.computeSerial(block.blockSerial, block.totalRecetas - 1);

  const importDate = new Date(block.importedAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={[styles.card, block.isActive && styles.cardActive]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {/* Active badge */}
      {block.isActive && (
        <View style={styles.activeBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#10B981" />
          <Text style={styles.activeBadgeText}>Talonario activo</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.pdfIconWrap}>
          <Ionicons name="document-text" size={26} color="#5551F5" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.filename} numberOfLines={1} ellipsizeMode="middle">
            {block.filename}
          </Text>
          <Text style={styles.importDate}>Importado {importDate}</Text>
        </View>
        {block.isActive && (
          <View style={styles.activeIcon}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          </View>
        )}
      </View>

      {/* Prescription range */}
      <View style={styles.serialRow}>
        <Ionicons name="barcode-outline" size={16} color="#6B7280" />
        <View style={styles.serialContent}>
          <Text style={styles.serialLabel}>Recetas del talonario</Text>
          <Text style={styles.serialValue}>
            {firstSerial} → {lastSerial}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.round(pct * 100)}%` as any,
                backgroundColor: pct >= 0.9 ? '#EF4444' : '#5551F5',
              },
            ]}
          />
        </View>
        <Text style={styles.progressPct}>{Math.round(pct * 100)}%</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{block.usedCount}</Text>
          <Text style={styles.statLabel}>Usadas</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{pending}</Text>
          <Text style={styles.statLabel}>Disponibles</Text>
        </View>
        <View style={styles.statSep} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{block.totalRecetas}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Next prescription */}
      <View style={styles.nextRow}>
        <View style={styles.nextLeft}>
          <Text style={styles.nextLabel}>Siguiente receta</Text>
          <Text style={styles.nextSerial}>{nextSerial}</Text>
        </View>
      </View>

      {/* Select hint */}
      <View style={styles.selectHint}>
        <Ionicons name="hand-left-outline" size={16} color="#6B7280" />
        <Text style={styles.selectHintText}>
          {block.isActive ? 'Talonario activo' : 'Toca para activar'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export const ActiveBlocksScreen = () => {
  const [blocks, setBlocks] = useState<PrescriptionBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PrescriptionBlockService.getAll();
      // Filter only blocks with available prescriptions
      const availableBlocks = data.filter(b => b.nextIndex < b.totalRecetas);
      setBlocks(availableBlocks);
    } catch (error) {
      console.error('Error loading blocks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBlocks();
    }, [loadBlocks])
  );

  const handleSelectBlock = async (blockId: string) => {
    try {
      await PrescriptionBlockService.setActive(blockId);
      await loadBlocks();
    } catch (error) {
      console.error('Error activating block:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Talonarios Activos</Text>
      </View>

      {/* List / empty / loading */}
      {loading ? (
        <ActivityIndicator style={styles.loader} color="#5551F5" size="large" />
      ) : blocks.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="document-text-outline" size={48} color="#5551F5" />
          </View>
          <Text style={styles.emptyTitle}>Sin talonarios disponibles</Text>
          <Text style={styles.emptySubtitle}>
            Todos los talonarios están agotados. Importa un nuevo talonario desde Configuración.
          </Text>
        </View>
      ) : (
        <FlatList
          data={blocks}
          keyExtractor={b => b.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <BlockCard
              block={item}
              onSelect={() => handleSelectBlock(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  loader: {
    marginTop: 60,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardActive: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  pdfIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  activeIcon: {
    marginLeft: 8,
  },
  filename: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  importDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  serialRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 8,
  },
  serialContent: {
    flex: 1,
  },
  serialLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  serialValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.5,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressPct: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statSep: {
    width: 1,
    height: 48,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nextLeft: {
    flex: 1,
  },
  nextLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  nextSerial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5551F5',
    letterSpacing: 0.5,
  },
  selectHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
  },
  selectHintText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});
