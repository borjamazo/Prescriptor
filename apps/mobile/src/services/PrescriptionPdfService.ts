import { NativeModules } from 'react-native';
import { PrescriptionBlockService } from './PrescriptionBlockService';
import { Prescription } from './PrescriptionService';
import { getPrescriptionLayout } from '../config/prescriptionLayout';

const { PdfSigner } = NativeModules;

export interface CreatePrescriptionPdfParams {
  prescription: Prescription;
  blockId: string;
}

export interface PdfFieldInfo {
  name: string;
  type: string;
  value: string;
}

/**
 * Service to create and sign prescription PDFs
 */
export const PrescriptionPdfService = {
  /**
   * Lists all form fields in a prescription block PDF.
   * Useful for debugging and understanding the PDF structure.
   */
  async listPrescriptionFields(blockId: string): Promise<PdfFieldInfo[]> {
    const blocks = await PrescriptionBlockService.getAll();
    const block = blocks.find(b => b.id === blockId);

    if (!block) {
      throw new Error('Prescription block not found');
    }

    const password = block.encryptedPwd
      ? PrescriptionBlockService.decryptPwd(block.encryptedPwd)
      : '';

    try {
      const fields = await PdfSigner.listFormFields(block.fileUri, password);
      console.log('Form fields found:', fields);
      return fields;
    } catch (error) {
      console.error('Error listing form fields:', error);
      return [];
    }
  },
  /**
   * Creates a prescription PDF from the prescription block and signs it digitally.
   * 
   * Process:
   * 1. Get the prescription block data
   * 2. Extract the specific page from the block PDF
   * 3. Add patient data, medication, and dosage to the page (top or bottom position)
   * 4. Sign the PDF digitally with PAdES
   * 5. Save to downloads
   * 
   * @param params - Prescription and block ID
   * @returns URI of the signed PDF
   */
  async createAndSignPrescription(params: CreatePrescriptionPdfParams): Promise<string> {
    const { prescription, blockId } = params;

    // Get the prescription block
    const blocks = await PrescriptionBlockService.getAll();
    const block = blocks.find(b => b.id === blockId);

    if (!block) {
      throw new Error('Prescription block not found');
    }

    // Find the page index and prescription index for this prescription
    const usedReceta = block.history.find(h => h.serial === prescription.rxNumber);
    if (!usedReceta) {
      throw new Error('Prescription not found in block history');
    }

    const pageIndex = usedReceta.pageIndex;
    const prescriptionIndex = block.history.indexOf(usedReceta);

    // Decrypt password if needed
    const password = block.encryptedPwd
      ? PrescriptionBlockService.decryptPwd(block.encryptedPwd)
      : '';

    try {
      // Step 1: Create prescription PDF with patient data
      console.log('Creating prescription PDF...');
      console.log(`Page: ${pageIndex}, Prescription index: ${prescriptionIndex}, Position: ${prescriptionIndex % 2 === 0 ? 'TOP' : 'BOTTOM'}`);
      
      const prescriptionPdfUri = await PdfSigner.createPrescriptionPdf(
        block.fileUri,
        pageIndex,
        password,
        prescriptionIndex,  // Pass prescription index to determine top/bottom position
        prescription.patientName,
        prescription.patientDocument,
        prescription.medication,
        prescription.dosage,
        prescription.instructions,
      );

      console.log('Prescription PDF created:', prescriptionPdfUri);

      // Step 2: Sign the PDF digitally with PAdES
      console.log('Signing prescription PDF...');
      const signedPdfUri = await PdfSigner.signPdf(prescriptionPdfUri);

      console.log('Prescription PDF signed:', signedPdfUri);

      return signedPdfUri;
    } catch (error) {
      console.error('Error creating/signing prescription PDF:', error);
      throw error;
    }
  },

  /**
   * Share a signed prescription PDF
   */
  async sharePrescription(pdfUri: string): Promise<void> {
    try {
      await PdfSigner.sharePdf(pdfUri);
    } catch (error) {
      console.error('Error sharing prescription:', error);
      throw error;
    }
  },

  /**
   * Open a signed prescription PDF
   */
  async openPrescription(pdfUri: string): Promise<void> {
    try {
      await PdfSigner.openPdf(pdfUri);
    } catch (error) {
      console.error('Error opening prescription:', error);
      throw error;
    }
  },
};
