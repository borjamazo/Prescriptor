import React from 'react';
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

// ── Sección placeholder ────────────────────────────────────────────────────────
const PlaceholderSection = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <View style={styles.placeholderCard}>
    <View style={styles.placeholderIconWrapper}>
      <Ionicons name={icon} size={22} color="#5551F5" />
    </View>
    <View style={styles.placeholderTextBlock}>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderDesc}>{description}</Text>
    </View>
    <View style={styles.devBadgeSmall}>
      <Text style={styles.devBadgeSmallText}>Próximamente</Text>
    </View>
  </View>
);

// ── Screen ─────────────────────────────────────────────────────────────────────
export const HelpCenterScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={18} color="#374151" />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerIconWrapper}>
            <Ionicons name="help-circle-outline" size={22} color="#D97706" />
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>Centro de Ayuda</Text>
            <Text style={styles.subtitle}>FAQs y tutoriales</Text>
          </View>
        </View>

        {/* Banner en desarrollo */}
        <View style={styles.devBanner}>
          <Ionicons name="construct-outline" size={20} color="#5551F5" />
          <View style={styles.devBannerTextBlock}>
            <Text style={styles.devBannerTitle}>Sección en Desarrollo</Text>
            <Text style={styles.devBannerBody}>
              Estamos preparando una completa base de conocimiento. Estará disponible en la próxima versión.
            </Text>
          </View>
        </View>

        {/* Secciones placeholder */}
        <Text style={styles.sectionTitle}>Próximas secciones</Text>

        <PlaceholderSection
          icon="book-outline"
          title="Preguntas frecuentes"
          description="Respuestas a las dudas más comunes sobre el uso de la aplicación."
        />
        <PlaceholderSection
          icon="play-circle-outline"
          title="Tutoriales en vídeo"
          description="Guías paso a paso para sacar el máximo partido a Prescriptor."
        />
        <PlaceholderSection
          icon="document-text-outline"
          title="Guías de uso"
          description="Documentación detallada sobre cada funcionalidad de la app."
        />
        <PlaceholderSection
          icon="chatbubble-ellipses-outline"
          title="Soporte en vivo"
          description="Chat directo con el equipo de soporte técnico."
        />
        <PlaceholderSection
          icon="mail-outline"
          title="Contactar soporte"
          description="Envía tu consulta y te responderemos en menos de 24 horas."
        />

        {/* Card contacto temporal */}
        <View style={styles.contactCard}>
          <Ionicons name="information-circle-outline" size={18} color="#374151" />
          <Text style={styles.contactText}>
            Mientras tanto, puedes contactar con el equipo en{' '}
            <Text style={styles.contactEmail}>soporte@prescriptor.app</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
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

  // Back
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  backText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  headerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBlock: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },

  // Dev banner
  devBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    padding: 16,
    marginBottom: 24,
  },
  devBannerTextBlock: {
    flex: 1,
  },
  devBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3730A3',
    marginBottom: 4,
  },
  devBannerBody: {
    fontSize: 13,
    color: '#4338CA',
    lineHeight: 18,
  },

  // Section title
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Placeholder card
  placeholderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  placeholderIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTextBlock: {
    flex: 1,
  },
  placeholderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  placeholderDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  devBadgeSmall: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  devBadgeSmallText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Contact card
  contactCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    marginTop: 8,
  },
  contactText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  contactEmail: {
    color: '#5551F5',
    fontWeight: '600',
  },
});
