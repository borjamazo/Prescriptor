import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ProfileService, type DoctorProfile } from '../services/ProfileService';
import { updateUserProfile } from '../services/SupabaseService';
import { useAuth } from '../contexts/AuthContext';

export const AccountScreen = () => {
  const navigation = useNavigation();
  const { refreshProfile } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<DoctorProfile>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await ProfileService.getProfile();
      setProfile(data);
      setEditedProfile(data || {});
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      await updateUserProfile({
        full_name: editedProfile.name,
        phone: editedProfile.phone,
        country: editedProfile.country,
        city: editedProfile.city,
        date_of_birth: editedProfile.date_of_birth,
      });
      
      // Recargar perfil local y en el contexto
      await loadProfile();
      await refreshProfile();
      
      setEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setEditing(false);
  };

  const handleBack = () => {
    if (editing) {
      Alert.alert(
        'Descartar cambios',
        '¿Estás seguro de que quieres descartar los cambios?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5551F5" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.initials}</Text>
            </View>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {!editing ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="create-outline" size={20} color="#5551F5" />
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <InfoField
            label="Nombre completo"
            value={editing ? editedProfile.name : profile.name}
            icon="person-outline"
            editing={editing}
            onChangeText={(text) => setEditedProfile({ ...editedProfile, name: text })}
          />

          <InfoField
            label="Email"
            value={profile.email}
            icon="mail-outline"
            editing={false}
          />

          <InfoField
            label="Teléfono"
            value={editing ? editedProfile.phone : profile.phone}
            icon="call-outline"
            editing={editing}
            onChangeText={(text) => setEditedProfile({ ...editedProfile, phone: text })}
            placeholder="Ej: +34 600 000 000"
          />

          <InfoField
            label="País"
            value={editing ? editedProfile.country : profile.country}
            icon="globe-outline"
            editing={editing}
            onChangeText={(text) => setEditedProfile({ ...editedProfile, country: text })}
            placeholder="Ej: España"
          />

          <InfoField
            label="Ciudad"
            value={editing ? editedProfile.city : profile.city}
            icon="location-outline"
            editing={editing}
            onChangeText={(text) => setEditedProfile({ ...editedProfile, city: text })}
            placeholder="Ej: Madrid"
          />

          <InfoField
            label="Fecha de nacimiento"
            value={editing ? editedProfile.date_of_birth : profile.date_of_birth}
            icon="calendar-outline"
            editing={editing}
            onChangeText={(text) => setEditedProfile({ ...editedProfile, date_of_birth: text })}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Cuenta</Text>

          <InfoField
            label="Miembro desde"
            value={new Date(profile.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            icon="time-outline"
            editing={false}
          />

          {profile.last_sign_in_at && (
            <InfoField
              label="Último acceso"
              value={new Date(profile.last_sign_in_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              icon="log-in-outline"
              editing={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface InfoFieldProps {
  label: string;
  value: string | null;
  icon: string;
  editing: boolean;
  onChangeText?: (text: string) => void;
  placeholder?: string;
}

const InfoField = ({ label, value, icon, editing, onChangeText, placeholder }: InfoFieldProps) => (
  <View style={styles.infoField}>
    <View style={styles.infoFieldHeader}>
      <Ionicons name={icon as any} size={20} color="#6B7280" />
      <Text style={styles.infoFieldLabel}>{label}</Text>
    </View>
    {editing && onChangeText ? (
      <TextInput
        style={styles.infoFieldInput}
        value={value || ''}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
      />
    ) : (
      <Text style={styles.infoFieldValue}>{value || '—'}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#5551F5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#5551F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
  },
  actions: {
    padding: 16,
    backgroundColor: '#fff',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5551F5',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5551F5',
    marginLeft: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#5551F5',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginTop: 16,
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  infoField: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoFieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8,
  },
  infoFieldValue: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 28,
  },
  infoFieldInput: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 28,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
  },
});
