import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrescriptionBlockService } from './PrescriptionBlockService';

const STORAGE_KEY = '@prescriptions_v1';

export type PrescriptionStatus = 'pending' | 'signed' | 'expired';

export interface Prescription {
  id: string;
  patientName: string;
  patientDocument: string;
  rxNumber: string;
  status: PrescriptionStatus;
  medication: string;
  dosage: string;
  instructions: string;
  date: string; // ISO date string
  createdAt: string; // ISO date-time string
  signedAt?: string; // ISO date-time string (when signed)
  blockId?: string; // Reference to the prescription block used
}

export interface NewPrescriptionInput {
  patientName: string;
  patientDocument: string;
  medication: string;
  dosage: string;
  instructions: string;
}

export interface DashboardStats {
  pending: number;
  signedToday: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generatePrescriptionId(): string {
  return `presc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

async function readAll(): Promise<Prescription[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Prescription[]) : [];
}

async function writeAll(prescriptions: Prescription[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptions));
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const PrescriptionService = {
  /**
   * Get all prescriptions, sorted by creation date (newest first)
   */
  async getAll(): Promise<Prescription[]> {
    const prescriptions = await readAll();
    return prescriptions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * Search prescriptions by patient name, rx number, or medication
   */
  async search(query: string): Promise<Prescription[]> {
    const prescriptions = await readAll();
    const q = query.toLowerCase();
    return prescriptions.filter(p =>
      p.patientName.toLowerCase().includes(q) ||
      p.rxNumber.toLowerCase().includes(q) ||
      p.medication.toLowerCase().includes(q),
    );
  },

  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const prescriptions = await readAll();
    const today = getTodayDate();
    
    return {
      pending: prescriptions.filter(p => p.status === 'pending').length,
      signedToday: prescriptions.filter(p => p.status === 'signed' && p.date === today).length,
    };
  },

  /**
   * Create a new prescription using the next available prescription from the active block
   */
  async createPrescription(input: NewPrescriptionInput): Promise<Prescription> {
    // Get the active prescription block
    const blocks = await PrescriptionBlockService.getAll();
    const activeBlock = blocks.find(b => b.isActive && b.nextIndex < b.totalRecetas);
    
    if (!activeBlock) {
      throw new Error('No hay talonario activo con recetas disponibles');
    }

    // Mark the next prescription as used and get the rx number
    const usedReceta = await PrescriptionBlockService.markNextUsed(activeBlock.id);
    
    if (!usedReceta) {
      throw new Error('No se pudo obtener la siguiente receta del talonario');
    }

    // Create the prescription
    const now = new Date().toISOString();
    const prescription: Prescription = {
      id: generatePrescriptionId(),
      patientName: input.patientName,
      patientDocument: input.patientDocument,
      rxNumber: usedReceta.serial,
      status: 'pending',
      medication: input.medication,
      dosage: input.dosage,
      instructions: input.instructions,
      date: getTodayDate(),
      createdAt: now,
      blockId: activeBlock.id,
    };

    const prescriptions = await readAll();
    prescriptions.unshift(prescription);
    await writeAll(prescriptions);

    return prescription;
  },

  /**
   * Update prescription status
   */
  async updateStatus(id: string, status: PrescriptionStatus): Promise<void> {
    const prescriptions = await readAll();
    const prescription = prescriptions.find(p => p.id === id);
    
    if (!prescription) {
      throw new Error('Prescripción no encontrada');
    }

    prescription.status = status;
    
    if (status === 'signed') {
      prescription.signedAt = new Date().toISOString();
    }

    await writeAll(prescriptions);
  },

  /**
   * Delete a prescription
   */
  async delete(id: string): Promise<void> {
    const prescriptions = await readAll();
    await writeAll(prescriptions.filter(p => p.id !== id));
  },

  /**
   * Check if there's an active prescription block with available prescriptions
   */
  async hasReceiptAvailable(): Promise<boolean> {
    const blocks = await PrescriptionBlockService.getAll();
    return blocks.some(b => b.isActive && b.nextIndex < b.totalRecetas);
  },
};
