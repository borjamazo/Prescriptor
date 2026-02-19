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
  date: string;
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

const MOCK: Prescription[] = [
  { id: '1', patientName: 'Sarah Johnson',  patientDocument: 'DNI 12345678', rxNumber: 'RX001', status: 'pending',  medication: 'Amoxicillin',  dosage: '500mg - 3x daily', instructions: 'Tomar con alimentos durante 7 días.',     date: '2026-02-18' },
  { id: '2', patientName: 'Michael Chen',   patientDocument: 'DNI 87654321', rxNumber: 'RX002', status: 'signed',   medication: 'Lisinopril',   dosage: '10mg - 1x daily',  instructions: 'Tomar por la mañana en ayunas.',          date: '2026-02-17' },
  { id: '3', patientName: 'Emily Davis',    patientDocument: 'DNI 11223344', rxNumber: 'RX003', status: 'signed',   medication: 'Metformin',    dosage: '850mg - 2x daily', instructions: 'Tomar con las comidas principales.',      date: '2026-02-16' },
  { id: '4', patientName: 'James Wilson',   patientDocument: 'DNI 99887766', rxNumber: 'RX004', status: 'expired',  medication: 'Atorvastatin', dosage: '20mg - 1x daily',  instructions: 'Tomar antes de dormir. Evitar pomelo.',   date: '2026-02-15' },
];

let nextId = MOCK.length + 1;

const today = new Date().toISOString().slice(0, 10);

export const PrescriptionService = {
  getAll(): Promise<Prescription[]> {
    return Promise.resolve([...MOCK]);
  },
  search(query: string): Promise<Prescription[]> {
    const q = query.toLowerCase();
    return Promise.resolve(
      MOCK.filter(p =>
        p.patientName.toLowerCase().includes(q) ||
        p.rxNumber.toLowerCase().includes(q) ||
        p.medication.toLowerCase().includes(q),
      ),
    );
  },
  getStats(): Promise<DashboardStats> {
    return Promise.resolve({
      pending:     MOCK.filter(p => p.status === 'pending').length,
      signedToday: MOCK.filter(p => p.status === 'signed' && p.date === today).length,
    });
  },
  createPrescription(input: NewPrescriptionInput): Promise<Prescription> {
    const id = String(nextId++);
    const rxNumber = `RX${id.padStart(3, '0')}`;
    const prescription: Prescription = {
      id,
      patientName: input.patientName,
      patientDocument: input.patientDocument,
      rxNumber,
      status: 'pending',
      medication: input.medication,
      dosage: input.dosage,
      instructions: input.instructions,
      date: today,
    };
    MOCK.unshift(prescription);
    return Promise.resolve({ ...prescription });
  },
  hasReceiptAvailable(): Promise<boolean> {
    return Promise.resolve(false);
  },
};
