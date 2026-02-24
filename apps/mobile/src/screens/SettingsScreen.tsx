import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SectionLabel } from '../components/SectionLabel';
import { SettingsRow } from '../components/SettingsRow';
import { useAuth } from '../contexts/AuthContext';
import {
  APP_VERSION,
  DoctorProfile,
  ProfileService,
  UserPreferences,
} from '../services/ProfileService';

// ─── Profile Card ─────────────────────────────────────────────────

const ProfileCard = ({ profile }: { profile: DoctorProfile }) => (
  <View style={styles.profileCard}>
    <View style={styles.profileTop}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{profile.initials}</Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileEmail}>{profile.email}</Text>
        {profile.phone && (
          <Text style={styles.profilePhone}>{profile.phone}</Text>
        )}
      </View>
    </View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────

export const SettingsScreen = () => {
  const { logout, userProfile, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences>({
    notifications: true,
    twoFactorAuth: false,
    autoSave: true,
  });

  useEffect(() => {
    loadProfile();
    ProfileService.getPreferences().then(setPrefs);
  }, [userProfile]);

  const loadProfile = async () => {
    const data = await ProfileService.getProfile();
    setProfile(data);
  };

  const updatePref = (key: keyof UserPreferences, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    ProfileService.savePreferences(updated);
  };

  const navigation = useNavigation();

  const handleLogout = () => {
    logout();
  };

  const handleEditProfile = () => {
    (navigation as any).navigate('Account');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile */}
        {profile && <ProfileCard profile={profile} />}

        {/* Account Information */}
        <SectionLabel title="INFORMACIÓN DE CUENTA" />
        <View style={styles.card}>
          <SettingsRow
            type="chevron"
            icon="person-outline"
            iconBg="#EEF2FF"
            iconColor="#5551F5"
            label="Mi Perfil"
            subtitle="Ver y editar información personal"
            onPress={handleEditProfile}
          />
          <SettingsRow
            type="text"
            icon="location-outline"
            iconBg="#FEF3C7"
            iconColor="#D97706"
            label="Ubicación"
            subtitle={
              profile?.city && profile?.country
                ? `${profile.city}, ${profile.country}`
                : profile?.country || profile?.city || 'No configurado'
            }
            showSeparator={false}
          />
        </View>

        {/* Configuration */}
        <SectionLabel title="CONFIGURACIÓN" />
        <View style={styles.card}>
          <SettingsRow
            type="chevron"
            icon="settings-outline"
            iconBg="#F1F5F9"
            iconColor="#64748B"
            label="Configuración de Recetas"
            subtitle="Gestionar PDFs y números de serie"
            showSeparator={false}
            onPress={() => (navigation as any).navigate('PrescriptionBlocks')}
          />
        </View>

        {/* Preferences */}
        <SectionLabel title="PREFERENCIAS" />
        <View style={styles.card}>
          <SettingsRow
            type="toggle"
            icon="notifications-outline"
            iconBg="#ECFDF5"
            iconColor="#059669"
            label="Notificaciones"
            subtitle="Alertas push y email"
            value={prefs.notifications}
            onValueChange={v => updatePref('notifications', v)}
          />
          <SettingsRow
            type="toggle"
            icon="shield-outline"
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
            label="Autenticación de Dos Factores"
            subtitle="Capa extra de seguridad"
            value={prefs.twoFactorAuth}
            onValueChange={v => updatePref('twoFactorAuth', v)}
          />
          <SettingsRow
            type="toggle"
            icon="document-text-outline"
            iconBg="#EFF6FF"
            iconColor="#3B82F6"
            label="Guardado Automático"
            subtitle="Guardar borradores automáticamente"
            value={prefs.autoSave}
            onValueChange={v => updatePref('autoSave', v)}
            showSeparator={false}
          />
        </View>

        {/* Support */}
        <SectionLabel title="SOPORTE" />
        <View style={styles.card}>
          <SettingsRow
            type="chevron"
            icon="help-circle-outline"
            iconBg="#FFFBEB"
            iconColor="#D97706"
            label="Centro de Ayuda"
            subtitle="FAQs y tutoriales"
            onPress={() => (navigation as any).navigate('HelpCenter')}
          />
          <SettingsRow
            type="chevron"
            icon="document-outline"
            iconBg="#EFF6FF"
            iconColor="#3B82F6"
            label="Términos de Servicio"
            subtitle="Información legal"
            showSeparator={false}
            onPress={() => (navigation as any).navigate('TermsOfService')}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>{APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────

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

  // Profile card
  profileCard: {
    backgroundColor: '#5551F5',
    borderRadius: 24,
    padding: 20,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  profilePhone: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 13,
    marginTop: 2,
  },

  // Section card wrapper
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },

  // Version
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 16,
  },
});
