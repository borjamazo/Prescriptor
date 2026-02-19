import DocumentPicker from 'react-native-document-picker';
import { NativeModules } from 'react-native';

const { PdfSigner } = NativeModules;

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

const mockRecords: SigningRecord[] = [
  {
    id: '1',
    fileName: 'prescription_johnson.pdf',
    signedAt: 'Feb 18, 2026 · 14:32',
    outputPath: '/cache/signed_prescription_johnson.pdf',
  },
  {
    id: '2',
    fileName: 'rx_chen_amoxicillin.pdf',
    signedAt: 'Feb 17, 2026 · 09:15',
    outputPath: '/cache/signed_rx_chen_amoxicillin.pdf',
  },
  {
    id: '3',
    fileName: 'prescription_davis.pdf',
    signedAt: 'Feb 16, 2026 · 16:48',
    outputPath: '/cache/signed_prescription_davis.pdf',
  },
];

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

  getRecentSignings: (): Promise<SigningRecord[]> =>
    Promise.resolve(mockRecords),
};
