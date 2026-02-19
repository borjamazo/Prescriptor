import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionLabel } from '../components/SectionLabel';
import { SignedDocumentCard } from '../components/SignedDocumentCard';
import type { PickedDocument, SigningRecord } from '../services/SigningService';
import { SigningService } from '../services/SigningService';

// ─── Helpers ──────────────────────────────────────────────────────

const formatSize = (bytes: number | null): string => {
  if (!bytes) {
    return '';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const extractFilename = (uri: string): string =>
  decodeURIComponent(uri.split('/').pop() || uri);

// ─── Document Zone ────────────────────────────────────────────────

interface DocumentZoneProps {
  document: PickedDocument | null;
  onSelect: () => void;
  onRemove: () => void;
}

const DocumentZone = ({ document: doc, onSelect, onRemove }: DocumentZoneProps) => {
  if (!doc) {
    return (
      <TouchableOpacity
        style={styles.dropZone}
        onPress={onSelect}
        activeOpacity={0.75}
      >
        <View style={styles.dropZoneIcon}>
          <Ionicons name="document-text-outline" size={32} color="#5551F5" />
        </View>
        <Text style={styles.dropZoneTitle}>Select a PDF document</Text>
        <Text style={styles.dropZoneSubtitle}>
          Tap to browse your files
        </Text>
        <View style={styles.dropZoneBadge}>
          <Ionicons name="folder-open-outline" size={14} color="#5551F5" />
          <Text style={styles.dropZoneBadgeText}>Browse Files</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const displayName = doc.name || extractFilename(doc.uri);

  return (
    <View style={styles.fileCard}>
      <View style={styles.fileRow}>
        <View style={styles.fileIconWrap}>
          <Ionicons name="document-text" size={24} color="#EF4444" />
        </View>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={2}>
            {displayName}
          </Text>
          {doc.size ? (
            <Text style={styles.fileSize}>{formatSize(doc.size)}</Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={22} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Success Card ─────────────────────────────────────────────────

interface SuccessCardProps {
  signedPath: string;
  onOpen: () => void;
  onShare: () => void;
}

const SuccessCard = ({ signedPath, onOpen, onShare }: SuccessCardProps) => (
  <View style={styles.successCard}>
    <View style={styles.successTop}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={26} color="#059669" />
      </View>
      <Text style={styles.successTitle}>Document signed successfully!</Text>
      <Text style={styles.successPath} numberOfLines={2}>
        {extractFilename(signedPath)}
      </Text>
    </View>
    <View style={styles.successActions}>
      <TouchableOpacity
        style={[styles.successBtn, styles.successBtnPrimary]}
        onPress={onOpen}
        activeOpacity={0.8}
      >
        <Ionicons name="eye-outline" size={16} color="#ffffff" />
        <Text style={styles.successBtnPrimaryText}>Open PDF</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.successBtn, styles.successBtnOutline]}
        onPress={onShare}
        activeOpacity={0.8}
      >
        <Ionicons name="share-outline" size={16} color="#5551F5" />
        <Text style={styles.successBtnOutlineText}>Share PDF</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────

export const SignScreen = () => {
  const [document, setDocument] = useState<PickedDocument | null>(null);
  const [signedPath, setSignedPath] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [recentSignings, setRecentSignings] = useState<SigningRecord[]>([]);

  useEffect(() => {
    SigningService.getRecentSignings().then(setRecentSignings);
  }, []);

  const handleSelectDocument = async () => {
    setSignedPath(null);
    try {
      const picked = await SigningService.pickDocument();
      if (picked) {
        setDocument(picked);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to select PDF';
      Alert.alert('Error', msg);
    }
  };

  const handleRemoveDocument = () => {
    setDocument(null);
    setSignedPath(null);
  };

  const handleSign = async () => {
    if (!document) {
      return;
    }
    setBusy(true);
    try {
      const output = await SigningService.signDocument(document.uri);
      setSignedPath(output);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to sign PDF';
      Alert.alert('Signing failed', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleOpen = async (path: string) => {
    try {
      await SigningService.openDocument(path);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to open PDF';
      Alert.alert('Error', msg);
    }
  };

  const handleShare = async (path: string) => {
    try {
      await SigningService.shareDocument(path);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to share PDF';
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Sign Document</Text>
            <Text style={styles.headerSubtitle}>PAdES digital signature</Text>
          </View>
          <View style={styles.headerIconWrap}>
            <Ionicons name="create-outline" size={22} color="#5551F5" />
          </View>
        </View>

        {/* Document selection */}
        <SectionLabel title="DOCUMENT" />
        <DocumentZone
          document={document}
          onSelect={handleSelectDocument}
          onRemove={handleRemoveDocument}
        />

        {/* Sign button */}
        <View style={styles.signButtonWrap}>
          <PrimaryButton
            title="Sign Document"
            onPress={handleSign}
            loading={busy}
            disabled={!document || !!signedPath}
          />
        </View>

        {/* Success result */}
        {signedPath && (
          <SuccessCard
            signedPath={signedPath}
            onOpen={() => handleOpen(signedPath)}
            onShare={() => handleShare(signedPath)}
          />
        )}

        {/* Recent signings */}
        {recentSignings.length > 0 && (
          <>
            <SectionLabel title="RECENT SIGNINGS" />
            {recentSignings.map(record => (
              <SignedDocumentCard
                key={record.id}
                record={record}
                onOpen={() => handleOpen(record.outputPath)}
                onShare={() => handleShare(record.outputPath)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────

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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Drop zone (empty)
  dropZone: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    backgroundColor: '#FAFBFF',
    gap: 8,
  },
  dropZoneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dropZoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  dropZoneSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  dropZoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
  },
  dropZoneBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5551F5',
  },

  // File card (selected)
  fileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  fileIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  removeBtn: {
    padding: 4,
  },

  // Sign button
  signButtonWrap: {
    marginTop: 16,
    marginBottom: 4,
  },

  // Success card
  successCard: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  successTop: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
  },
  successPath: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  successActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  successBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  successBtnPrimary: {
    backgroundColor: '#5551F5',
  },
  successBtnPrimaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  successBtnOutline: {
    borderWidth: 1.5,
    borderColor: '#5551F5',
  },
  successBtnOutlineText: {
    color: '#5551F5',
    fontWeight: '600',
    fontSize: 14,
  },
});
