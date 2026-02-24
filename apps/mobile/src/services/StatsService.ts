import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupabaseSyncService } from './SupabaseSyncService';

const STORAGE_KEY = '@prescriptions_v1';

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

interface Prescription {
  id: string;
  status: 'pending' | 'signed' | 'expired';
  date: string;
  createdAt: string;
  medication: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  return new Date(d.setDate(diff));
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getDayName(date: Date): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

function getMonthName(date: Date): string {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
}

async function readPrescriptions(): Promise<Prescription[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Prescription[]) : [];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const StatsService = {
  async getStats(): Promise<StatsData> {
    const prescriptions = await readPrescriptions();
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    
    // This week stats
    const weekStart = getWeekStart(now);
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const thisWeekPrescriptions = prescriptions.filter(p => {
      const pDate = new Date(p.createdAt);
      return pDate >= weekStart;
    });
    
    const lastWeekPrescriptions = prescriptions.filter(p => {
      const pDate = new Date(p.createdAt);
      return pDate >= lastWeekStart && pDate < weekStart;
    });
    
    const thisWeekCount = thisWeekPrescriptions.length;
    const lastWeekCount = lastWeekPrescriptions.length;
    const weekChange = lastWeekCount > 0 
      ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
      : 0;
    
    // This month stats
    const monthStart = getMonthStart(now);
    const lastMonthStart = new Date(monthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    
    const thisMonthPrescriptions = prescriptions.filter(p => {
      const pDate = new Date(p.createdAt);
      return pDate >= monthStart;
    });
    
    const lastMonthPrescriptions = prescriptions.filter(p => {
      const pDate = new Date(p.createdAt);
      return pDate >= lastMonthStart && pDate < monthStart;
    });
    
    const thisMonthCount = thisMonthPrescriptions.length;
    const lastMonthCount = lastMonthPrescriptions.length;
    const monthChange = lastMonthCount > 0
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
      : 0;
    
    // Weekly activity (last 7 days)
    const weeklyActivity: WeeklyBar[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().slice(0, 10);
      const count = prescriptions.filter(p => p.date === dayStr).length;
      weeklyActivity.push({
        day: getDayName(date),
        count,
      });
    }
    
    // Monthly comparison (last 6 months)
    const monthlyComparison: MonthlyPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthStart = getMonthStart(date);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthPrescriptions = prescriptions.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate >= monthStart && pDate < monthEnd;
      });
      
      monthlyComparison.push({
        month: getMonthName(date),
        signed: monthPrescriptions.filter(p => p.status === 'signed').length,
        pending: monthPrescriptions.filter(p => p.status === 'pending').length,
      });
    }
    
    // Get Supabase stats for additional context
    const supabaseStats = await SupabaseSyncService.getUserStats();
    if (supabaseStats) {
      console.log('Supabase stats:', supabaseStats);
    }
    
    // Medication distribution (top medications)
    const medicationCounts = new Map<string, number>();
    prescriptions.forEach(p => {
      const count = medicationCounts.get(p.medication) || 0;
      medicationCounts.set(p.medication, count + 1);
    });
    
    const sortedMeds = Array.from(medicationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
    
    const totalMeds = sortedMeds.reduce((sum, [, count]) => sum + count, 0);
    
    const colors = ['#5551F5', '#06B6D4', '#8B5CF6', '#F43F5E'];
    const medicationDistribution: MedSegment[] = sortedMeds.map(([name, count], i) => ({
      name,
      percentage: totalMeds > 0 ? Math.round((count / totalMeds) * 100) : 0,
      color: colors[i],
    }));
    
    // If no data, return empty stats
    if (prescriptions.length === 0) {
      return {
        thisWeek: { count: 0, change: 0 },
        thisMonth: { count: 0, change: 0 },
        weeklyActivity: weeklyActivity.map(w => ({ ...w, count: 0 })),
        monthlyComparison: monthlyComparison.map(m => ({ ...m, signed: 0, pending: 0 })),
        medicationDistribution: [],
      };
    }
    
    return {
      thisWeek: { count: thisWeekCount, change: weekChange },
      thisMonth: { count: thisMonthCount, change: monthChange },
      weeklyActivity,
      monthlyComparison,
      medicationDistribution,
    };
  },
};
