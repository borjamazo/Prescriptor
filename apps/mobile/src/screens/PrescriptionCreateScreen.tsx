import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextInputField } from '../components/TextInputField';
import {
  NewPrescriptionInput,
  PrescriptionService,
} from '../services/PrescriptionService';

// ── Preview row ────────────────────────────────────────────────────────────────
const PreviewRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.previewRow}>
    <Text style={styles.previewLabel}>{label}</Text>
    <Text style={styles.previewValue} numberOfLines={1}>{value || '—'}</Text>
  </View>
);

// ── Screen ─────────────────────────────────────────────────────────────────────
export const PrescriptionCreateScreen = () => {
  const navigation = useNavigation();

  const [patientName, setPatientName]       = useState('');
  const [patientDocument, setPatientDocument] = useState('');
  const [patientBirthDate, setPatientBirthDate] = useState('');
  const [medication, setMedication]         = useState('');
  const [dosage, setDosage]                 = useState('');
  const [instructions, setInstructions]     = useState('');
  const [hasReceipt, setHasReceipt]         = useState(false);
  const [loading, setLoading]               = useState(false);

  // Check if there's an active prescription block when screen is focused
  useFocusEffect(
    useCallback(() => {
      PrescriptionService.hasReceiptAvailable().then(setHasReceipt);
    }, [])
  );

  const isFormValid =
    patientName.trim().length > 0 &&
    medication.trim().length > 0 &&
    dosage.trim().length > 0;

  const handleCreate = async () => {
    if (!isFormValid) {
      Alert.alert('Campos requeridos', 'Nombre del paciente, medicamento y duración son obligatorios.');
      return;
    }
    setLoading(true);
    try {
      const input: NewPrescriptionInput = {
        patientName: patientName.trim(),
        patientDocument: patientDocument.trim(),
        patientBirthDate: patientBirthDate.trim(),
        medication: medication.trim(),
        dosage: dosage.trim(),
        instructions: instructions.trim(),
      };
      const prescription = await PrescriptionService.createPrescription(input);
      Alert.alert(
        '✓ Prescripción creada',
        `Número de receta: ${prescription.rxNumber}\nPaciente: ${prescription.patientName}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error('Error creating prescription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Back button ── */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={18} color="#374151" />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>

        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <View style={styles.headerIconWrapper}>
            <Ionicons name="document-text-outline" size={22} color="#5551F5" />
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>Nueva Prescripción</Text>
            <Text style={styles.subtitle}>Crea una nueva prescripción</Text>
          </View>
        </View>

        {/* ── Warning: no receipt ── */}
        {!hasReceipt && (
          <View style={styles.warningCard}>
            <View style={styles.warningTitleRow}>
              <Ionicons name="warning-outline" size={18} color="#D97706" />
              <Text style={styles.warningTitle}>Sin Talonario Activo</Text>
            </View>
            <Text style={styles.warningBody}>
              Necesitas importar un talonario de recetas y activarlo para crear prescripciones
            </Text>
            <TouchableOpacity
              style={styles.warningButton}
              onPress={() => (navigation as any).navigate('PrescriptionBlocks')}
            >
              <Text style={styles.warningButtonText}>Ir a Talonarios</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Form ── */}
        <View style={styles.card}>
          <TextInputField
            label="Nombre del Paciente"
            value={patientName}
            onChangeText={setPatientName}
            placeholder="Nombre completo del paciente"
            leftIcon="person-outline"
            autoCapitalize="words"
          />
          <TextInputField
            label="Fecha de Nacimiento"
            value={patientBirthDate}
            onChangeText={setPatientBirthDate}
            placeholder="DD/MM/AAAA"
            leftIcon="calendar-outline"
            keyboardType="numeric"
          />
          <TextInputField
            label="Documento del Paciente"
            value={patientDocument}
            onChangeText={setPatientDocument}
            placeholder="Ej: DNI 12345678"
            leftIcon="card-outline"
            autoCapitalize="characters"
          />
          <TextInputField
            label="Medicamento"
            value={medication}
            onChangeText={setMedication}
            placeholder="Nombre del medicamento"
            leftIcon="medkit-outline"
            autoCapitalize="words"
          />
          <FormField
            label="Duración"
            value={dosage}
            onChangeText={setDosage}
            placeholder="Ej., 7 días, 2 semanas, 1 mes"
            helperText="Especifica la duración del tratamiento"
          />
          <FormField
            label="Posología (Instrucciones)"
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Ej., Tomar con comida por 7 días. Evitar alcohol."
            helperText="Instrucciones detalladas para el paciente"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* ── Preview ── */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Vista Previa</Text>
          <View style={styles.previewDivider} />
          <PreviewRow label="Paciente:"      value={patientName} />
          <PreviewRow label="Fecha Nac.:"    value={patientBirthDate} />
          <PreviewRow label="Medicamento:"   value={medication} />
          <PreviewRow label="Duración:"      value={dosage} />
          <View style={styles.previewInstructionsBlock}>
            <Text style={styles.previewLabel}>Instrucciones:</Text>
            <Text style={styles.previewInstructionsValue}>
              {instructions || '—'}
            </Text>
          </View>
        </View>

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <PrimaryButton
            title="Crear Prescripción"
            onPress={handleCreate}
            loading={loading}
            disabled={!isFormValid || loading}
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // Back
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  backText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  headerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBlock: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },

  // Warning
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
    marginBottom: 16,
  },
  warningTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  warningBody: {
    fontSize: 13,
    color: '#92400E',
    marginBottom: 12,
    lineHeight: 18,
  },
  warningButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#D97706',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  warningButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
  },

  // Form card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  // Preview card
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  previewValue: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  previewInstructionsBlock: {
    marginBottom: 4,
  },
  previewInstructionsValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  // Actions
  actions: {
    gap: 12,
  },
  cancelButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
