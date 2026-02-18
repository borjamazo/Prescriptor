export type PrescriptionStatus = 'pending' | 'signed' | 'expired';

export interface Prescription {
  id: string;
  patientName: string;
  rxNumber: string;
  status: PrescriptionStatus;
  medication: string;
  dosage: string;
  date: string;
}

export interface DashboardStats {
  pending: number;
  signedToday: number;
}

const MOCK: Prescription[] = [
  { id: '1', patientName: 'Sarah Johnson',  rxNumber: 'RX001', status: 'pending',  medication: 'Amoxicillin',  dosage: '500mg - 3x daily', date: '2026-02-18' },
  { id: '2', patientName: 'Michael Chen',   rxNumber: 'RX002', status: 'signed',   medication: 'Lisinopril',   dosage: '10mg - 1x daily',  date: '2026-02-17' },
  { id: '3', patientName: 'Emily Davis',    rxNumber: 'RX003', status: 'signed',   medication: 'Metformin',    dosage: '850mg - 2x daily', date: '2026-02-16' },
  { id: '4', patientName: 'James Wilson',   rxNumber: 'RX004', status: 'expired',  medication: 'Atorvastatin', dosage: '20mg - 1x daily',  date: '2026-02-15' },
];

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
};
