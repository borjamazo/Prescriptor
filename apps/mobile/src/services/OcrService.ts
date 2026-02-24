import TextRecognition from '@react-native-ml-kit/text-recognition';
import PdfThumbnail from 'react-native-pdf-thumbnail';

/**
 * OCR Service using Google ML Kit Vision
 * Much more stable than PDFTron text extraction
 */
export const OcrService = {
  /**
   * Extract prescription number from first page of PDF using OCR
   * Returns the prescription number or empty string if not found
   */
  async extractPrescriptionNumberFromPdf(
    pdfUri: string,
  ): Promise<{ prescriptionNumber: string; success: boolean; error?: string }> {
    try {
      console.log('OcrService: Generating thumbnail from PDF first page...');
      
      // Generate image from first page of PDF
      const thumbnail = await PdfThumbnail.generate(pdfUri, 0, 100);

      console.log('OcrService: Thumbnail generated:', thumbnail.uri);

      // Perform OCR on the image
      console.log('OcrService: Performing OCR...');
      const result = await TextRecognition.recognize(thumbnail.uri);

      console.log('OcrService: OCR completed. Text length:', result.text.length);

      // Parse prescription number from OCR text
      const prescriptionNumber = this.parsePrescriptionNumber(result.text);

      return {
        prescriptionNumber,
        success: prescriptionNumber.length > 0,
      };
    } catch (error) {
      console.error('OcrService: Error extracting prescription number:', error);
      return {
        prescriptionNumber: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Parse prescription number from OCR text
   * Looks for patterns like "Nº de Receta: 29-8448969"
   */
  parsePrescriptionNumber(text: string): string {
    console.log('OcrService: Parsing prescription number from text...');

    // Common patterns for prescription numbers
    const patterns = [
      // "Nº de Receta: 29-8448969" or variations
      /N[ºo°]\s*\.?\s*de\s*Receta\s*:?\s*([A-Za-z0-9\-/]+)/i,
      /N[ºo°]\s*\.?\s*Receta\s*:?\s*([A-Za-z0-9\-/]+)/i,
      /Num(?:ero)?\s*\.?\s*(?:de\s*)?Receta\s*:?\s*([A-Za-z0-9\-/]+)/i,
      // Just "Receta: 29-8448969"
      /Receta\s*:?\s*([A-Za-z0-9\-/]+)/i,
      // Pattern like "29-8448969" (number-number format)
      /\b(\d{2}-\d{7})\b/,
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        const value = match[1].trim();
        if (value.length > 0) {
          console.log('OcrService: Found prescription number:', value);
          return value;
        }
      }
    }

    console.log('OcrService: No prescription number found');
    return '';
  },
};
