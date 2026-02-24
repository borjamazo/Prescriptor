import DocumentPicker from 'react-native-document-picker';
import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { PdfSigner } = NativeModules;
const STORAGE_KEY = '@signing_records_v1';

const getPdfSignerMethod = (names: string[]) => {
  for (const name of names) {
    const fn = (PdfSigner as any)?.[name];
    if (typeof fn === 'function') {
      return fn;
    }
  }
  throw new Error(
    'PdfSigner native module not available. Rebuild the Android app.',
  );
};

export interface PickedDocument {
  uri: string;
  name: string | null;
  size: number | null;
}

export interface SigningRecord {
  id: string;
  fileName: string;
  signedAt: string;
  outputPath: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateRecordId(): string {
  return `sign_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function readRecords(): Promise<SigningRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as SigningRecord[]) : [];
}

async function writeRecords(records: SigningRecord[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const SigningService = {
  pickDocument: async (): Promise<PickedDocument | null> => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
      });
      return {
        uri: result.fileCopyUri || result.uri,
        name: result.name,
        size: result.size ?? null,
      };
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        return null;
      }
      throw err;
    }
  },

  signDocument: async (inputPath: string): Promise<string> => {
    const signPdf = getPdfSignerMethod(['signPdf']);
    return signPdf(inputPath);
  },

  shareDocument: async (path: string): Promise<void> => {
    const sharePdf = getPdfSignerMethod(['sharePdf', 'sharePDF']);
    await sharePdf(path);
  },

  openDocument: async (path: string): Promise<void> => {
    const openPdf = getPdfSignerMethod(['openPdf', 'openPDF']);
    await openPdf(path);
  },

  /**
   * Save a signing record
   */
  async saveRecord(fileName: string, outputPath: string): Promise<void> {
    const records = await readRecords();
    const now = new Date();
    const signedAt = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const record: SigningRecord = {
      id: generateRecordId(),
      fileName,
      signedAt,
      outputPath,
    };
    
    records.unshift(record);
    await writeRecords(records);
  },

  /**
   * Get recent signing records
   */
  async getRecentSignings(): Promise<SigningRecord[]> {
    return readRecords();
  },

  /**
   * Delete a signing record
   */
  async deleteRecord(id: string): Promise<void> {
    const records = await readRecords();
    await writeRecords(records.filter(r => r.id !== id));
  },
};
