/**
 * DEBUG SERVICE FOR PRESCRIPTION POSITIONING
 * 
 * This service provides debugging tools for testing prescription PDF positioning.
 * It allows regenerating PDFs without signing to quickly test coordinate adjustments.
 * 
 * TO REMOVE: Delete this entire file when debugging is complete.
 */

import { NativeModules } from 'react-native';
import { PrescriptionBlockService } from './PrescriptionBlockService';
import { Prescription } from './PrescriptionService';

const { PdfSigner } = NativeModules;

export interface DebugPdfResult {
  pdfUri: string;
  prescriptionIndex: number;
  position: 'top' | 'bottom';
}

/**
 * Debug service for testing prescription positioning.
 * All methods in this service are for debugging only.
 */
export const PrescriptionDebugService = {
  /**
   * Regenerates a prescription PDF without signing.
   * Useful for quickly testing coordinate positioning.
   * 
   * @param prescription - The prescription to regenerate
   * @param blockId - The prescription block ID
   * @returns PDF URI and position info
   */
  async regeneratePdf(prescription: Prescription, blockId: string): Promise<DebugPdfResult> {
    if (!prescription.blockId) {
      throw new Error('Prescription has no block ID');
    }

    // Get the prescription block
    const blocks = await PrescriptionBlockService.getAll();
    const block = blocks.find(b => b.id === blockId);

    if (!block) {
      throw new Error('Prescription block not found');
    }

    // Find the page index and prescription index
    const usedReceta = block.history.find(h => h.serial === prescription.rxNumber);
    if (!usedReceta) {
      throw new Error('Prescription not found in block history');
    }

    const pageIndex = usedReceta.pageIndex;
    const prescriptionIndex = block.history.indexOf(usedReceta);
    const position = prescriptionIndex % 2 === 0 ? 'top' : 'bottom';

    // Decrypt password if needed
    const password = block.encryptedPwd
      ? PrescriptionBlockService.decryptPwd(block.encryptedPwd)
      : '';

    console.log('[DEBUG] Regenerating PDF...');
    console.log(`[DEBUG] Page: ${pageIndex}, Index: ${prescriptionIndex}, Position: ${position}`);

    try {
      // Get signature if available
      const { SignatureService } = await import('./SignatureService');
      const signaturePath = await SignatureService.getSignatureFilePath();
      
      // Create prescription PDF without signing
      const pdfUri = await PdfSigner.createPrescriptionPdf(
        block.fileUri,
        pageIndex,
        password,
        prescriptionIndex,
        prescription.patientName,
        prescription.patientDocument,
        prescription.patientBirthDate || '',
        prescription.medication,
        prescription.dosage,
        prescription.instructions,
        signaturePath,
      );

      console.log('[DEBUG] PDF regenerated:', pdfUri);

      return {
        pdfUri,
        prescriptionIndex,
        position,
      };
    } catch (error) {
      console.error('[DEBUG] Error regenerating PDF:', error);
      throw error;
    }
  },

  /**
   * Shares a PDF directly (for debugging).
   * 
   * @param pdfUri - URI of the PDF to share
   */
  async sharePdf(pdfUri: string): Promise<void> {
    try {
      console.log('[DEBUG] Sharing PDF:', pdfUri);
      await PdfSigner.sharePdf(pdfUri);
    } catch (error) {
      console.error('[DEBUG] Error sharing PDF:', error);
      throw error;
    }
  },

  /**
   * Opens a PDF for viewing (for debugging).
   * 
   * @param pdfUri - URI of the PDF to open
   */
  async openPdf(pdfUri: string): Promise<void> {
    try {
      console.log('[DEBUG] Opening PDF:', pdfUri);
      await PdfSigner.openPdf(pdfUri);
    } catch (error) {
      console.error('[DEBUG] Error opening PDF:', error);
      throw error;
    }
  },

  /**
   * Gets debug info about a prescription.
   * 
   * @param prescription - The prescription
   * @param blockId - The block ID
   * @returns Debug information
   */
  async getDebugInfo(prescription: Prescription, blockId: string): Promise<{
    pageIndex: number;
    prescriptionIndex: number;
    position: 'top' | 'bottom';
    blockSerial: string;
    totalPrescriptions: number;
  }> {
    const blocks = await PrescriptionBlockService.getAll();
    const block = blocks.find(b => b.id === blockId);

    if (!block) {
      throw new Error('Block not found');
    }

    const usedReceta = block.history.find(h => h.serial === prescription.rxNumber);
    if (!usedReceta) {
      throw new Error('Prescription not found in block history');
    }

    const pageIndex = usedReceta.pageIndex;
    const prescriptionIndex = block.history.indexOf(usedReceta);
    const position = prescriptionIndex % 2 === 0 ? 'top' : 'bottom';

    return {
      pageIndex,
      prescriptionIndex,
      position,
      blockSerial: block.blockSerial,
      totalPrescriptions: block.history.length,
    };
  },
};
