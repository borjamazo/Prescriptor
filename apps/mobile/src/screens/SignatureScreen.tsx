import React, { useRef, useState, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SignatureCanvas from 'react-native-signature-canvas';
import { SignatureService } from '../services/SignatureService';

export const SignatureScreen = () => {
  const navigation = useNavigation();
  const signatureRef = useRef<any>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingSignature, setExistingSignature] = useState<string | null>(null);
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    loadExistingSignature();
  }, []);

  const loadExistingSignature = async () => {
    try {
      setLoading(true);
      const signatureDataUri = await SignatureService.getSignatureDataUri();
      if (signatureDataUri) {
        setExistingSignature(signatureDataUri);
        setShowCanvas(false);
      } else {
        setShowCanvas(true);
      }
    } catch (error) {
      console.error('Error loading signature:', error);
      setShowCanvas(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureEnd = () => {
    setHasSignature(true);
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setHasSignature(false);
  };

  const handleDeleteExisting = () => {
    Alert.alert(
      'Eliminar firma',
      '¿Estás seguro de que quieres eliminar tu firma actual?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await SignatureService.deleteSignature();
              setExistingSignature(null);
              setShowCanvas(true);
              Alert.alert('✓ Firma eliminada', 'Ahora puedes crear una nueva firma');
            } catch (error) {
              console.error('Error deleting signature:', error);
              Alert.alert('Error', 'No se pudo eliminar la firma');
            }
          },
        },
      ],
    );
  };

  const handleSave = () => {
    if (!hasSignature) {
      Alert.alert('Firma requerida', 'Por favor, dibuja tu firma antes de guardar');
      return;
    }
    signatureRef.current?.readSignature();
  };

  const handleSignatureData = async (signature: string) => {
    setSaving(true);
    try {
      await SignatureService.saveSignature(signature);
      Alert.alert(
        '✓ Firma guardada',
        'Tu firma se ha guardado correctamente y se añadirá a todas las recetas.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error('Error saving signature:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const webStyle = `
    .m-signature-pad {
      box-shadow: none;
      border: none;
      margin: 0;
    }
    .m-signature-pad--body {
      border: none;
    }
    .m-signature-pad--footer {
      display: none;
    }
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
    }
  `;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5551F5" />
          <Text style={styles.loadingText}>Cargando firma...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>Firma / Rúbrica</Text>
          <Text style={styles.subtitle}>
            {existingSignature ? 'Tu firma guardada' : 'Dibuja tu firma con el dedo'}
          </Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <View style={styles.instructionRow}>
          <Ionicons name="information-circle-outline" size={20} color="#5551F5" />
          <Text style={styles.instructionText}>
            {existingSignature
              ? 'Esta firma se añade automáticamente a todas tus recetas'
              : 'Tu firma se añadirá automáticamente a todas las recetas que generes'}
          </Text>
        </View>
      </View>

      {/* Existing Signature Preview */}
      {existingSignature && !showCanvas && (
        <View style={styles.previewContainer}>
          <View style={styles.previewWrapper}>
            <Image
              source={{ uri: existingSignature }}
              style={styles.signatureImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.previewLabel}>Firma actual</Text>
        </View>
      )}

      {/* Signature Canvas */}
      {showCanvas && (
        <View style={styles.canvasContainer}>
          <View style={styles.canvasWrapper}>
            <SignatureCanvas
              ref={signatureRef}
              onEnd={handleSignatureEnd}
              onOK={handleSignatureData}
              descriptionText=""
              clearText="Limpiar"
              confirmText="Guardar"
              webStyle={webStyle}
              autoClear={false}
              imageType="image/png"
              backgroundColor="#FFFFFF"
              penColor="#000000"
              minWidth={2}
              maxWidth={4}
            />
          </View>
          <View style={styles.canvasBorder} />
        </View>
      )}

      {/* Action Buttons */}
      {existingSignature && !showCanvas ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteExisting}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Eliminar Firma</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              (!hasSignature || saving) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasSignature || saving}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {saving ? 'Guardando...' : 'Guardar Firma'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  instructionsCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#4338CA',
    lineHeight: 20,
  },
  previewContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  previewWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureImage: {
    width: '100%',
    height: '100%',
    maxHeight: 200,
  },
  previewLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  canvasContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    position: 'relative',
  },
  canvasWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  canvasBorder: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FEE2E2',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#5551F5',
    borderColor: '#5551F5',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
    borderColor: '#9CA3AF',
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
