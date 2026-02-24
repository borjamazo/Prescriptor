import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { PrescriptionCard } from '../components/PrescriptionCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { SearchBar } from '../components/SearchBar';
import { StatCard } from '../components/StatCard';
import {
  DashboardStats,
  Prescription,
  PrescriptionService,
} from '../services/PrescriptionService';
import { useAuth } from '../contexts/AuthContext';

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { userProfile } = useAuth();
  const [search, setSearch] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ pending: 0, signedToday: 0 });

  // Obtener nombre del usuario
  const getUserName = () => {
    if (!userProfile) return 'Doctor';
    if (userProfile.full_name) return userProfile.full_name;
    return userProfile.email.split('@')[0];
  };

  // Cargar datos cuando la pantalla está en foco
  const loadData = useCallback(async () => {
    try {
      const [prescriptionsData, statsData] = await Promise.all([
        PrescriptionService.getAll(),
        PrescriptionService.getStats(),
      ]);
      setPrescriptions(prescriptionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filtered = search
    ? prescriptions.filter(
        p =>
          p.patientName.toLowerCase().includes(search.toLowerCase()) ||
          p.rxNumber.toLowerCase().includes(search.toLowerCase()) ||
          p.medication.toLowerCase().includes(search.toLowerCase()),
      )
    : prescriptions;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header card ── */}
        <View style={styles.headerCard}>
          <Text style={styles.welcomeTitle}>Bienvenido, {getUserName()}</Text>
          <Text style={styles.dateText}>{formatDate(new Date())}</Text>
          <View style={styles.statsRow}>
            <StatCard value={stats.pending} label="Pending" />
            <StatCard value={stats.signedToday} label="Signed Today" />
          </View>
        </View>

        {/* ── Search ── */}
        <View style={styles.searchContainer}>
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

        {/* ── New Prescription ── */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Nueva Prescripción"
            icon="+"
            onPress={() => (navigation as any).navigate('PrescriptionCreate')}
          />
        </View>

        {/* ── Prescription list ── */}
        <Text style={styles.sectionTitle}>Recent Prescriptions</Text>
        {filtered.map(p => (
          <PrescriptionCard key={p.id} prescription={p} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: '#5551F5',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  welcomeTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 24,
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchContainer: {
    marginBottom: 12,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
});
