import { NativeModules } from 'react-native';

const { PdfSigner } = NativeModules;

const getMethod = (name: string) => {
  const fn = (PdfSigner as any)?.[name];
  if (typeof fn === 'function') return fn as (...args: any[]) => Promise<any>;
  throw new Error(
    `PdfSigner.${name} not available. Rebuild the Android app.`,
  );
};

export interface ExtractedPageInfo {
  pageIndex: number;
  prescriptionNumber: string; // e.g. "29-8448969", empty if not found
  rawText: string;
}

export const PdfReaderService = {
  /**
   * Returns the total number of pages in the PDF.
   * Pass the decrypted password, or empty string for non-protected PDFs.
   */
  async getPageCount(fileUri: string, password: string = ''): Promise<number> {
    return getMethod('getPdfPageCount')(fileUri, password);
  },

  /**
   * Decrypt a password-protected PDF and save it to cache without password.
   * Returns the path to the decrypted PDF for OCR processing.
   */
  async decryptPdfToCache(fileUri: string, password: string): Promise<string> {
    return getMethod('decryptPdfToCache')(fileUri, password);
  },

  /**
   * Simplified method to extract ONLY the prescription number from first page.
   * More robust than extractPageText.
   * Returns: { prescriptionNumber: string, success: boolean }
   */
  async extractPrescriptionNumber(
    fileUri: string,
    password: string = '',
  ): Promise<{ prescriptionNumber: string; success: boolean }> {
    return getMethod('extractPrescriptionNumber')(fileUri, password);
  },

  /**
   * Extracts text from a single page (0-based pageIndex).
   * Parses the physical "Nº de Receta" number if present on the page.
   */
  async extractPageText(
    fileUri: string,
    pageIndex: number,
    password: string = '',
  ): Promise<ExtractedPageInfo> {
    return getMethod('extractPageText')(fileUri, pageIndex, password);
  },

  /**
   * Lists all AcroForm field names in the PDF.
   * Returns an empty array for flat (non-interactive) PDFs.
   */
  async listFormFields(fileUri: string, password: string = ''): Promise<string[]> {
    return getMethod('listFormFields')(fileUri, password);
  },
};
