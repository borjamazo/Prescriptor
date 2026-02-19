export interface WeeklyBar {
  day: string;
  count: number;
}

export interface MonthlyPoint {
  month: string;
  signed: number;
  pending: number;
}

export interface MedSegment {
  name: string;
  percentage: number;
  color: string;
}

export interface StatsData {
  thisWeek: { count: number; change: number };
  thisMonth: { count: number; change: number };
  weeklyActivity: WeeklyBar[];
  monthlyComparison: MonthlyPoint[];
  medicationDistribution: MedSegment[];
}

const mock: StatsData = {
  thisWeek: { count: 99, change: 12 },
  thisMonth: { count: 189, change: -8 },
  weeklyActivity: [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 18 },
    { day: 'Wed', count: 14 },
    { day: 'Thu', count: 22 },
    { day: 'Fri', count: 18 },
    { day: 'Sat', count: 7 },
    { day: 'Sun', count: 4 },
  ],
  monthlyComparison: [
    { month: 'Jan', signed: 85, pending: 45 },
    { month: 'Feb', signed: 100, pending: 52 },
    { month: 'Mar', signed: 82, pending: 38 },
    { month: 'Apr', signed: 120, pending: 62 },
    { month: 'May', signed: 110, pending: 48 },
    { month: 'Jun', signed: 115, pending: 40 },
  ],
  medicationDistribution: [
    { name: 'Antibiotics', percentage: 35, color: '#5551F5' },
    { name: 'Blood Pressure', percentage: 28, color: '#06B6D4' },
    { name: 'Diabetes', percentage: 22, color: '#8B5CF6' },
    { name: 'Pain Relief', percentage: 15, color: '#F43F5E' },
  ],
};

export const StatsService = {
  getStats: (): Promise<StatsData> => Promise.resolve(mock),
};
