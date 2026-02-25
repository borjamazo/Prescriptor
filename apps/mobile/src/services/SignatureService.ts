import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const SIGNATURE_KEY = '@signature_image';
const SIGNATURE_FILE = 'signature.png';

export interface SignatureData {
  base64: string;
  filePath: string;
  createdAt: string;
}

/**
 * Service to manage doctor's signature/rubric
 */
export const SignatureService = {
  /**
   * Save signature image
   * @param base64Image - Base64 encoded PNG image
   */
  async saveSignature(base64Image: string): Promise<SignatureData> {
    try {
      // Remove data:image/png;base64, prefix if present
      const cleanBase64 = base64Image.replace(/^data:image\/png;base64,/, '');
      
      // Save to file system
      const filePath = `${RNFS.DocumentDirectoryPath}/${SIGNATURE_FILE}`;
      await RNFS.writeFile(filePath, cleanBase64, 'base64');
      
      // Save metadata to AsyncStorage
      const signatureData: SignatureData = {
        base64: cleanBase64,
        filePath,
        createdAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(SIGNATURE_KEY, JSON.stringify(signatureData));
      
      console.log('Signature saved:', filePath);
      return signatureData;
    } catch (error) {
      console.error('Error saving signature:', error);
      throw new Error('No se pudo guardar la firma');
    }
  },

  /**
   * Get saved signature
   */
  async getSignature(): Promise<SignatureData | null> {
    try {
      const data = await AsyncStorage.getItem(SIGNATURE_KEY);
      if (!data) return null;
      
      const signatureData: SignatureData = JSON.parse(data);
      
      // Verify file still exists
      const exists = await RNFS.exists(signatureData.filePath);
      if (!exists) {
        // File was deleted, clear metadata
        await this.deleteSignature();
        return null;
      }
      
      return signatureData;
    } catch (error) {
      console.error('Error getting signature:', error);
      return null;
    }
  },

  /**
   * Check if signature exists
   */
  async hasSignature(): Promise<boolean> {
    const signature = await this.getSignature();
    return signature !== null;
  },

  /**
   * Delete signature
   */
  async deleteSignature(): Promise<void> {
    try {
      const signature = await this.getSignature();
      
      if (signature) {
        // Delete file
        const exists = await RNFS.exists(signature.filePath);
        if (exists) {
          await RNFS.unlink(signature.filePath);
        }
      }
      
      // Delete metadata
      await AsyncStorage.removeItem(SIGNATURE_KEY);
      
      console.log('Signature deleted');
    } catch (error) {
      console.error('Error deleting signature:', error);
      throw new Error('No se pudo eliminar la firma');
    }
  },

  /**
   * Get signature as base64 data URI
   */
  async getSignatureDataUri(): Promise<string | null> {
    const signature = await this.getSignature();
    if (!signature) return null;
    return `data:image/png;base64,${signature.base64}`;
  },

  /**
   * Get signature file path for native modules
   */
  async getSignatureFilePath(): Promise<string | null> {
    const signature = await this.getSignature();
    return signature?.filePath || null;
  },
};
