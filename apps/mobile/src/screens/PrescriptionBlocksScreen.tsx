import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  generateBlockId,
  PrescriptionBlock,
  PrescriptionBlockService,
} from '../services/PrescriptionBlockService';
import { PdfReaderService } from '../services/PdfReaderService';

// ─── Stat pill ────────────────────────────────────────────────────────────────

const Stat = ({
  icon,
  color,
  bg,
  label,
  value,
}: {
  icon: string;
  color: string;
  bg: string;
  label: string;
  value: number;
}) => (
  <View style={cardSt.stat}>
    <View style={[cardSt.statIcon, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text style={cardSt.statValue}>{value}</Text>
    <Text style={cardSt.statLabel}>{label}</Text>
  </View>
);

// ─── Block Card ───────────────────────────────────────────────────────────────

interface BlockCardProps {
  block: PrescriptionBlock;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  onMarkUsed: () => void;
  onSetNext: () => void;
}

const BlockCard = ({
  block,
  isExpanded,
  onToggleExpand,
  onDelete,
  onMarkUsed,
  onSetNext,
}: BlockCardProps) => {
  const pending = block.totalRecetas - block.usedCount;
  const pct = block.totalRecetas > 0 ? block.usedCount / block.totalRecetas : 0;
  const isExhausted = block.nextIndex >= block.totalRecetas;
  const nextSerial = isExhausted
    ? 'Bloque agotado'
    : PrescriptionBlockService.computeSerial(block.blockSerial, block.nextIndex);

  const importDate = new Date(block.importedAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <View style={cardSt.card}>
      {/* ── Header ── */}
      <View style={cardSt.cardHeader}>
        <View style={cardSt.pdfIconWrap}>
          <Ionicons name="document-text" size={26} color="#5551F5" />
        </View>
        <View style={cardSt.headerInfo}>
          <Text style={cardSt.filename} numberOfLines={1} ellipsizeMode="middle">
            {block.filename}
          </Text>
          <Text style={cardSt.importDate}>Importado {importDate}</Text>
        </View>
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* ── Serial number ── */}
      <View style={cardSt.serialRow}>
        <Ionicons name="barcode-outline" size={16} color="#6B7280" />
        <Text style={cardSt.serialLabel}>Serie del bloque: </Text>
        <Text style={cardSt.serialValue}>{block.blockSerial}</Text>
      </View>

      {/* ── Progress bar ── */}
      <View style={cardSt.progressSection}>
        <View style={cardSt.progressBg}>
          <View
            style={[
              cardSt.progressFill,
              {
                width: `${Math.round(pct * 100)}%` as any,
                backgroundColor: pct >= 0.9 ? '#EF4444' : '#5551F5',
              },
            ]}
          />
        </View>
        <Text style={cardSt.progressPct}>{Math.round(pct * 100)}%</Text>
      </View>

      {/* ── Stats row ── */}
      <View style={cardSt.statsRow}>
        <Stat icon="checkmark-circle" color="#059669" bg="#ECFDF5" label="Usadas" value={block.usedCount} />
        <View style={cardSt.statSep} />
        <Stat icon="time-outline" color="#D97706" bg="#FEF3C7" label="Pendientes" value={pending} />
        <View style={cardSt.statSep} />
        <Stat icon="layers-outline" color="#5551F5" bg="#EEF2FF" label="Total" value={block.totalRecetas} />
      </View>

      <View style={cardSt.divider} />

      {/* ── Next prescription ── */}
      <View style={cardSt.nextRow}>
        <View style={cardSt.nextLeft}>
          <Text style={cardSt.nextLabel}>Siguiente receta</Text>
          <Text style={[cardSt.nextSerial, isExhausted && cardSt.exhaustedText]}>
            {nextSerial}
          </Text>
        </View>
        {!isExhausted && (
          <TouchableOpacity style={cardSt.changeBtn} onPress={onSetNext} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={14} color="#5551F5" />
            <Text style={cardSt.changeBtnText}>Cambiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Mark used ── */}
      <TouchableOpacity
        style={[cardSt.markBtn, isExhausted && cardSt.markBtnDisabled]}
        onPress={isExhausted ? undefined : onMarkUsed}
        activeOpacity={isExhausted ? 1 : 0.85}
      >
        <Ionicons
          name="checkmark-done-outline"
          size={18}
          color={isExhausted ? '#9CA3AF' : '#fff'}
        />
        <Text style={[cardSt.markBtnText, isExhausted && cardSt.markBtnTextDisabled]}>
          {isExhausted ? 'Bloque agotado' : 'Registrar siguiente como usada'}
        </Text>
      </TouchableOpacity>

      {/* ── History toggle ── */}
      <TouchableOpacity style={cardSt.historyToggle} onPress={onToggleExpand} activeOpacity={0.7}>
        <Ionicons name="time-outline" size={15} color="#6B7280" />
        <Text style={cardSt.historyToggleText}>Historial ({block.history.length})</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={15}
          color="#6B7280"
        />
      </TouchableOpacity>

      {/* ── History list ── */}
      {isExpanded && (
        <View style={cardSt.historyList}>
          {block.history.length === 0 ? (
            <Text style={cardSt.historyEmpty}>Sin recetas usadas aún</Text>
          ) : (
            [...block.history].reverse().map((entry, i) => (
              <View key={`${entry.pageIndex}-${i}`} style={cardSt.historyItem}>
                <View style={cardSt.historyDot} />
                <View style={cardSt.historyItemBody}>
                  <Text style={cardSt.historySerial}>{entry.serial}</Text>
                  <Text style={cardSt.historyDate}>
                    {new Date(entry.usedAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    } as any)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
};

// ─── Set-next modal state ─────────────────────────────────────────────────────

interface SetNextState {
  blockId: string;
  blockSerial: string;
  total: number;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export const PrescriptionBlocksScreen = () => {
  const navigation = useNavigation();
  const [blocks, setBlocks] = useState<PrescriptionBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Import modal
  const [importVisible, setImportVisible] = useState(false);
  const [selFile, setSelFile] = useState<{ uri: string; name: string } | null>(null);
  const [blockSerial, setBlockSerial] = useState('');
  const [totalStr, setTotalStr] = useState('');
  const [pdfPwd, setPdfPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [detectingPages, setDetectingPages] = useState(false);

  // Set-next modal
  const [setNextState, setSetNextState] = useState<SetNextState | null>(null);
  const [nextInputVal, setNextInputVal] = useState('');

  // ── Load ────────────────────────────────────────────────────────────────────

  const loadBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PrescriptionBlockService.getAll();
      setBlocks(data);
      
      // DISABLED: Automatic Rx number detection to prevent crashes
      // Users can manually enter the prescription number
      // If needed in the future, this can be re-enabled with better error handling
      
    } catch (error) {
      console.error('Error loading blocks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  // ── Import helpers ──────────────────────────────────────────────────────────

  const resetImportForm = () => {
    setSelFile(null);
    setBlockSerial('');
    setTotalStr('');
    setPdfPwd('');
    setShowPwd(false);
  };

  const handlePickFile = async () => {
    try {
      const [result] = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        allowMultiSelection: false,
        copyTo: 'documentDirectory',
      });
      const fileUri = result.fileCopyUri ?? result.uri;
      const fileName = result.name ?? 'recetas.pdf';
      setSelFile({ uri: fileUri, name: fileName });

      // Auto-detect page count (try without password first)
      try {
        const count = await PdfReaderService.getPageCount(fileUri, '');
        if (count > 0) {
          setTotalStr(String(count));
          setDetectingPages(false);
        }
      } catch (error) {
        // PDF might be password protected, user will need to enter password
        console.log('Could not detect page count without password');
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'No se pudo seleccionar el archivo');
      }
    }
  };

  const detectPageCount = async (fileUri: string, password: string) => {
    setDetectingPages(true);
    try {
      // Solo detectar número de páginas
      const count = await PdfReaderService.getPageCount(fileUri, password);
      if (count > 0) {
        setTotalStr(String(count));
        Alert.alert(
          '✓ Detectado',
          `Se detectaron ${count} recetas en el PDF.\n\nPor favor, introduce manualmente el número de receta del bloque.`
        );
      } else {
        throw new Error('No se pudo detectar el número de páginas');
      }
    } catch (error) {
      console.error('Error detecting page count:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', `No se pudo leer el PDF. ${password ? 'Verifica la contraseña.' : 'El PDF puede estar protegido con contraseña.'}\n\nError: ${errorMessage}`);
    } finally {
      setDetectingPages(false);
    }
  };

  const handleRetryDetection = () => {
    if (!selFile) {
      return Alert.alert('Error', 'Primero selecciona un archivo PDF');
    }
    if (!pdfPwd.trim()) {
      return Alert.alert('Contraseña requerida', 'Introduce la contraseña del PDF para detectar automáticamente el número de recetas');
    }
    detectPageCount(selFile.uri, pdfPwd);
  };

  const handleImport = async () => {
    if (!selFile) {
      return Alert.alert('Campo requerido', 'Selecciona un archivo PDF');
    }
    if (!blockSerial.trim()) {
      return Alert.alert('Campo requerido', 'Introduce el número de serie del bloque');
    }
    const total = parseInt(totalStr, 10);
    if (!total || total < 1) {
      return Alert.alert('Campo requerido', 'Introduce el número total de recetas');
    }

    setImportLoading(true);
    try {
      const block: PrescriptionBlock = {
        id: generateBlockId(),
        filename: selFile.name,
        fileUri: selFile.uri,
        importedAt: new Date().toISOString(),
        blockSerial: blockSerial.trim().toUpperCase(),
        totalRecetas: total,
        usedCount: 0,
        nextIndex: 0,
        encryptedPwd: PrescriptionBlockService.encryptPwd(pdfPwd),
        history: [],
      };
      
      console.log('Attempting to add block:', block);
      await PrescriptionBlockService.add(block);
      console.log('Block added successfully');
      
      await loadBlocks();
      setImportVisible(false);
      resetImportForm();
      Alert.alert('✓ Importado', 'Bloque de recetas importado correctamente');
    } catch (error) {
      console.error('Error importing block:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', `No se pudo importar el bloque de recetas: ${errorMessage}`);
    } finally {
      setImportLoading(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = (id: string, filename: string) => {
    Alert.alert(
      'Eliminar bloque',
      `¿Eliminar "${filename}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await PrescriptionBlockService.remove(id);
            await loadBlocks();
          },
        },
      ],
    );
  };

  // ── Mark used ───────────────────────────────────────────────────────────────

  const handleMarkUsed = async (id: string) => {
    const used = await PrescriptionBlockService.markNextUsed(id);
    if (!used) return;
    await loadBlocks();
    Alert.alert('✓ Receta registrada', `Número de serie: ${used.serial}`, [{ text: 'OK' }]);
  };

  // ── Set next ────────────────────────────────────────────────────────────────

  const openSetNext = (block: PrescriptionBlock) => {
    setSetNextState({
      blockId: block.id,
      blockSerial: block.blockSerial,
      total: block.totalRecetas,
    });
    setNextInputVal(String(block.nextIndex + 1));
  };

  const handleSaveNext = async () => {
    if (!setNextState) return;
    const val = parseInt(nextInputVal, 10);
    if (isNaN(val) || val < 1 || val > setNextState.total) {
      Alert.alert('Valor inválido', `Introduce un número entre 1 y ${setNextState.total}`);
      return;
    }
    await PrescriptionBlockService.setNextIndex(setNextState.blockId, val - 1);
    setSetNextState(null);
    await loadBlocks();
  };

  // ── Toggle expand ───────────────────────────────────────────────────────────

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const nextPreviewSerial =
    setNextState && nextInputVal && !isNaN(parseInt(nextInputVal, 10))
      ? PrescriptionBlockService.computeSerial(
          setNextState.blockSerial,
          parseInt(nextInputVal, 10) - 1,
        )
      : null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bloques de Recetas</Text>
        <TouchableOpacity
          style={styles.headerActionButton}
          onPress={() => setImportVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#5551F5" />
        </TouchableOpacity>
      </View>

      {/* ── List / empty / loading ── */}
      {loading ? (
        <ActivityIndicator style={styles.loader} color="#5551F5" size="large" />
      ) : blocks.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="document-text-outline" size={48} color="#5551F5" />
          </View>
          <Text style={styles.emptyTitle}>Sin bloques de recetas</Text>
          <Text style={styles.emptySubtitle}>
            Importa tu primer PDF de recetas pulsando "Importar"
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
              isExpanded={expandedIds.has(item.id)}
              onToggleExpand={() => toggleExpand(item.id)}
              onDelete={() => handleDelete(item.id, item.filename)}
              onMarkUsed={() => handleMarkUsed(item.id)}
              onSetNext={() => openSetNext(item)}
            />
          )}
        />
      )}

      {/* ════ Import modal ════ */}
      <Modal
        visible={importVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setImportVisible(false); resetImportForm(); }}
      >
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Modal header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Importar Bloque</Text>
                <TouchableOpacity
                  onPress={() => { setImportVisible(false); resetImportForm(); }}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>
                Selecciona el PDF de recetas y configura los datos del bloque
              </Text>

              {/* ── PDF picker ── */}
              <Text style={styles.fieldLabel}>Archivo PDF *</Text>
              <TouchableOpacity
                style={styles.filePicker}
                onPress={handlePickFile}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={selFile ? 'document-text' : 'cloud-upload-outline'}
                  size={22}
                  color={selFile ? '#5551F5' : '#9CA3AF'}
                />
                <Text
                  style={[styles.filePickerText, selFile && styles.filePickerTextSelected]}
                  numberOfLines={1}
                >
                  {selFile ? selFile.name : 'Toca para seleccionar un PDF'}
                </Text>
                {selFile && (
                  <TouchableOpacity
                    onPress={() => setSelFile(null)}
                    hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                  >
                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {/* ── Block serial ── */}
              <Text style={styles.fieldLabel}>Número de receta *</Text>
              <Text style={styles.fieldHint}>
                Número de receta del bloque (introduce manualmente)
              </Text>
              <TextInput
                style={styles.textInput}
                value={blockSerial}
                onChangeText={setBlockSerial}
                placeholder="Ej: 29-8448969"
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="next"
              />

              {/* ── Total prescriptions ── */}
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Total de recetas *</Text>
                {detectingPages && (
                  <ActivityIndicator size="small" color="#5551F5" style={styles.detectSpinner} />
                )}
              </View>
              <Text style={styles.fieldHint}>
                {detectingPages
                  ? 'Detectando número de páginas…'
                  : 'Número de páginas del PDF (una página = una receta)'}
              </Text>
              <TextInput
                style={styles.textInput}
                value={totalStr}
                onChangeText={setTotalStr}
                placeholder="Ej: 25"
                keyboardType="number-pad"
                returnKeyType="next"
                editable={!detectingPages}
              />

              {/* ── PDF password ── */}
              <Text style={styles.fieldLabel}>Contraseña del PDF</Text>
              <Text style={styles.fieldHint}>
                Si el PDF está protegido, introduce la contraseña para detectar el número de páginas. Se guardará cifrada en el dispositivo.
              </Text>
              <View style={styles.pwdRow}>
                <TextInput
                  style={[styles.textInput, styles.pwdInput]}
                  value={pdfPwd}
                  onChangeText={setPdfPwd}
                  placeholder="Contraseña (opcional)"
                  secureTextEntry={!showPwd}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPwd(v => !v)}
                >
                  <Ionicons
                    name={showPwd ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              {/* ── Retry detection button ── */}
              {selFile && !totalStr && pdfPwd && (
                <TouchableOpacity
                  style={styles.retryDetectionBtn}
                  onPress={handleRetryDetection}
                  disabled={detectingPages}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh-outline" size={18} color="#5551F5" />
                  <Text style={styles.retryDetectionText}>
                    Detectar número de páginas con contraseña
                  </Text>
                </TouchableOpacity>
              )}

              {/* ── Actions ── */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => { setImportVisible(false); resetImportForm(); }}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, importLoading && styles.confirmBtnDisabled]}
                  onPress={handleImport}
                  disabled={importLoading}
                  activeOpacity={0.85}
                >
                  {importLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="cloud-download-outline" size={18} color="#fff" />
                      <Text style={styles.confirmBtnText}>Importar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* ════ Set-next modal ════ */}
      <Modal
        visible={!!setNextState}
        animationType="fade"
        transparent
        onRequestClose={() => setSetNextState(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Siguiente receta a usar</Text>
            <Text style={styles.dialogSubtitle}>
              Indica el número de receta (1 – {setNextState?.total ?? 0}):
            </Text>
            <TextInput
              style={styles.dialogInput}
              value={nextInputVal}
              onChangeText={setNextInputVal}
              keyboardType="number-pad"
              selectTextOnFocus
              autoFocus
            />
            {nextPreviewSerial && (
              <View style={styles.previewRow}>
                <Ionicons name="barcode-outline" size={15} color="#6B7280" />
                <Text style={styles.previewText}>
                  Serie: <Text style={styles.previewSerial}>{nextPreviewSerial}</Text>
                </Text>
              </View>
            )}
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.dialogCancelBtn}
                onPress={() => setSetNextState(null)}
              >
                <Text style={styles.dialogCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dialogSaveBtn} onPress={handleSaveNext}>
                <Text style={styles.dialogSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Card styles ──────────────────────────────────────────────────────────────

const cardSt = StyleSheet.create({
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 6,
  },
  serialLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  serialValue: {
    fontSize: 13,
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
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  nextLeft: {
    flex: 1,
  },
  nextLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  rxNumberText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontStyle: 'italic',
  },
  nextSerial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5551F5',
    letterSpacing: 0.5,
  },
  exhaustedText: {
    color: '#EF4444',
    fontSize: 14,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#5551F5',
  },
  changeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5551F5',
  },
  markBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 13,
    backgroundColor: '#5551F5',
    borderRadius: 14,
  },
  markBtnDisabled: {
    backgroundColor: '#F3F4F6',
  },
  markBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  markBtnTextDisabled: {
    color: '#9CA3AF',
  },
  historyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  historyToggleText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  historyList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  historyEmpty: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 10,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5551F5',
    marginTop: 5,
  },
  historyItemBody: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historySerial: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.3,
  },
  historyDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerActionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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

  // ── Import modal ──
  modal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  detectSpinner: {
    marginLeft: 8,
  },
  fieldHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: -4,
    marginBottom: 8,
    lineHeight: 16,
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  filePickerText: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
  },
  filePickerTextSelected: {
    color: '#111827',
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
    marginBottom: 18,
  },
  pwdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  pwdInput: {
    flex: 1,
    marginBottom: 0,
  },
  eyeBtn: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  retryDetectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#5551F5',
    backgroundColor: '#EEF2FF',
    marginBottom: 18,
  },
  retryDetectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5551F5',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: '#5551F5',
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },

  // ── Set-next dialog ──
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  dialogSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  dialogInput: {
    borderWidth: 1.5,
    borderColor: '#5551F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: '700',
    color: '#5551F5',
    textAlign: 'center',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  previewText: {
    fontSize: 13,
    color: '#6B7280',
  },
  previewSerial: {
    fontWeight: '700',
    color: '#5551F5',
    letterSpacing: 0.5,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
  },
  dialogCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  dialogCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  dialogSaveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#5551F5',
    alignItems: 'center',
  },
  dialogSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
