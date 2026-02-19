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

// ── Componentes reutilizables ──────────────────────────────────────────────────

const SectionCard = ({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionNumberBadge}>
        <Text style={styles.sectionNumber}>{number}</Text>
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const BodyText = ({ children }: { children: string }) => (
  <Text style={styles.bodyText}>{children}</Text>
);

const BulletItem = ({ text }: { text: string }) => (
  <View style={styles.bulletRow}>
    <View style={styles.bulletDot} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const BulletList = ({ items }: { items: string[] }) => (
  <View style={styles.bulletList}>
    {items.map((item, i) => (
      <BulletItem key={i} text={item} />
    ))}
  </View>
);

// ── Screen ─────────────────────────────────────────────────────────────────────

export const TermsOfServiceScreen = () => {
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
            <Ionicons name="document-text-outline" size={22} color="#3B82F6" />
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>Política de Uso y{'\n'}Condiciones Generales</Text>
            <Text style={styles.subtitle}>Aplicación móvil Prescriptor</Text>
          </View>
        </View>

        {/* Metadata */}
        <View style={styles.metaCard}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.metaLabel}>Última actualización</Text>
            <Text style={styles.metaValue}>19 de febrero de 2026</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="phone-portrait-outline" size={14} color="#6B7280" />
            <Text style={styles.metaLabel}>Aplicación</Text>
            <Text style={styles.metaValue}>Prescriptor</Text>
          </View>
        </View>

        {/* ── Sección 1 ── */}
        <SectionCard number="1" title="Aceptación expresa">
          <BodyText>
            El acceso, descarga, instalación o uso de la aplicación móvil Prescriptor (en adelante, "la Aplicación")
            implica la aceptación expresa, plena e incondicional de las presentes Condiciones Generales.
          </BodyText>
          <BodyText>
            Si el usuario no está conforme con cualquiera de los términos aquí establecidos, deberá abstenerse
            de utilizar la Aplicación.
          </BodyText>
        </SectionCard>

        {/* ── Sección 2 ── */}
        <SectionCard number="2" title="Naturaleza del Servicio">
          <BodyText>
            La Aplicación constituye exclusivamente una herramienta tecnológica de edición documental destinada
            a facilitar la generación de documentos de prescripción médica en formato digital.
          </BodyText>
          <Text style={styles.subLabel}>La Aplicación:</Text>
          <BulletList items={[
            'No presta servicios médicos.',
            'No realiza diagnóstico.',
            'No realiza validación farmacológica.',
            'No verifica compatibilidades medicamentosas.',
            'No evalúa dosis.',
            'No supervisa actos clínicos.',
            'No sustituye el criterio profesional del facultativo.',
            'No garantiza el cumplimiento normativo sanitario.',
            'No certifica la validez legal de documentos generados.',
          ]} />
          <BodyText>
            La Aplicación no es un producto sanitario ni un sistema de historia clínica electrónica.
          </BodyText>
        </SectionCard>

        {/* ── Sección 3 ── */}
        <SectionCard number="3" title="Almacenamiento de Datos – Modelo 100% Local">
          <BodyText>
            La Aplicación opera bajo un modelo de almacenamiento exclusivamente local.
          </BodyText>
          <Text style={styles.subLabel}>Se establece expresamente que:</Text>
          <BulletList items={[
            'No se almacenan datos en servidores externos.',
            'No se transmiten datos médicos a terceros.',
            'No se realizan copias en la nube.',
            'No se accede remotamente a la información del usuario.',
            'No se monitoriza el contenido generado.',
            'No se procesan datos en infraestructura del desarrollador.',
            'No se comparten datos con terceros.',
            'No se realiza tratamiento automatizado fuera del dispositivo.',
          ]} />
          <BodyText>
            Todos los datos introducidos por el usuario se almacenan únicamente en el dispositivo del propio
            usuario y permanecen bajo su control exclusivo.
          </BodyText>
          <BodyText>
            El titular y desarrollador del software no tiene acceso técnico, físico ni remoto a dicha información.
          </BodyText>
        </SectionCard>

        {/* ── Sección 4 ── */}
        <SectionCard number="4" title="Responsabilidad Exclusiva del Usuario">
          <Text style={styles.subLabel}>El usuario declara y acepta que:</Text>
          <BulletList items={[
            'Es el único responsable del contenido generado.',
            'Es el único responsable de la veracidad de los datos introducidos.',
            'Es el único responsable del uso clínico de las prescripciones.',
            'Es el único responsable del uso de certificados digitales.',
            'Es el único responsable del cumplimiento normativo aplicable.',
            'Es el único responsable del envío, almacenamiento o compartición de documentos generados.',
            'Es el único responsable de la protección de datos personales incluidos en las prescripciones.',
            'Es el único responsable de la custodia de su dispositivo.',
            'Es el único responsable del uso profesional o no profesional de la Aplicación.',
          ]} />
          <BodyText>
            El usuario asume íntegramente cualquier consecuencia jurídica, administrativa, civil, penal o
            disciplinaria derivada del uso de la Aplicación.
          </BodyText>
        </SectionCard>

        {/* ── Sección 5 ── */}
        <SectionCard number="5" title="Exclusión Total de Responsabilidad">
          <BodyText>
            En la máxima medida permitida por la legislación aplicable, el titular y desarrollador del software
            quedan expresamente exonerados de cualquier tipo de responsabilidad, incluyendo, sin carácter limitativo:
          </BodyText>
          <BulletList items={[
            'Responsabilidad médica y profesional.',
            'Responsabilidad sanitaria y por mala praxis.',
            'Responsabilidad civil, penal y administrativa.',
            'Responsabilidad disciplinaria colegial.',
            'Responsabilidad por errores en prescripciones o dosis incorrectas.',
            'Responsabilidad por interacciones medicamentosas.',
            'Responsabilidad por uso indebido de certificados digitales.',
            'Responsabilidad por invalidez de firma electrónica.',
            'Responsabilidad por pérdida de datos o brechas de seguridad.',
            'Responsabilidad por accesos no autorizados derivados de negligencia del usuario.',
            'Responsabilidad por daños directos, indirectos o lucro cesante.',
            'Responsabilidad por daños reputacionales o reclamaciones de terceros.',
            'Responsabilidad por sanciones regulatorias.',
            'Responsabilidad por incumplimiento de RGPD o normativa sanitaria.',
          ]} />
          <BodyText>
            La Aplicación se proporciona "tal cual" y "según disponibilidad", sin garantías de ningún tipo,
            expresas o implícitas.
          </BodyText>
        </SectionCard>

        {/* ── Sección 6 ── */}
        <SectionCard number="6" title="Cláusula de Indemnidad">
          <BodyText>
            El usuario se obliga a mantener indemne y a exonerar al titular y desarrollador del software
            frente a cualquier reclamación, procedimiento, sanción, multa, demanda o responsabilidad que
            pudiera derivarse directa o indirectamente del uso de la Aplicación.
          </BodyText>
          <BodyText>
            Esto incluye honorarios legales, costas judiciales y cualquier gasto asociado.
          </BodyText>
        </SectionCard>

        {/* ── Sección 7 ── */}
        <SectionCard number="7" title="Firma Electrónica y Certificados Digitales">
          <BodyText>
            La Aplicación puede permitir la utilización de certificados digitales instalados en el dispositivo.
          </BodyText>
          <Text style={styles.subLabel}>El desarrollador:</Text>
          <BulletList items={[
            'No valida la autenticidad del certificado.',
            'No verifica su vigencia.',
            'No garantiza su validez jurídica.',
            'No garantiza la aceptación del documento firmado por terceros.',
            'No certifica la integridad legal del PDF firmado.',
          ]} />
          <BodyText>
            La validez legal de cualquier firma es responsabilidad exclusiva del usuario.
          </BodyText>
        </SectionCard>

        {/* ── Sección 8 ── */}
        <SectionCard number="8" title="Seguridad y Dispositivo">
          <BodyText>
            La seguridad depende exclusivamente del dispositivo y configuración del usuario.
          </BodyText>
          <Text style={styles.subLabel}>El desarrollador no garantiza:</Text>
          <BulletList items={[
            'Protección frente a malware.',
            'Protección frente a accesos no autorizados.',
            'Recuperación de datos.',
            'Copias de seguridad.',
            'Integridad ante manipulación del sistema operativo.',
            'Protección ante dispositivos rooteados o con jailbreak.',
          ]} />
          <BodyText>
            El uso en dispositivos modificados anula cualquier expectativa razonable de seguridad.
          </BodyText>
        </SectionCard>

        {/* ── Sección 9 ── */}
        <SectionCard number="9" title="Ausencia de Relación Profesional">
          <BodyText>El uso de la Aplicación no genera:</BodyText>
          <BulletList items={[
            'Relación médico-paciente.',
            'Relación contractual sanitaria.',
            'Relación de asesoramiento legal.',
            'Relación de prestación de servicios médicos.',
            'Relación de custodia documental.',
          ]} />
        </SectionCard>

        {/* ── Sección 10 ── */}
        <SectionCard number="10" title="Limitación Económica de Responsabilidad">
          <BodyText>
            En el supuesto excepcional de que se declarara responsabilidad del desarrollador, esta quedará
            limitada, en todo caso, al importe efectivamente abonado por el usuario por la licencia de uso
            en los últimos 12 meses, o en caso de aplicación gratuita, a cero euros.
          </BodyText>
        </SectionCard>

        {/* ── Sección 11 ── */}
        <SectionCard number="11" title="Modificaciones">
          <BodyText>
            El titular podrá modificar estas condiciones en cualquier momento.
          </BodyText>
          <BodyText>
            El uso continuado tras su actualización implica aceptación expresa.
          </BodyText>
        </SectionCard>

        {/* ── Sección 12 ── */}
        <SectionCard number="12" title="Propiedad Intelectual">
          <BodyText>
            Todos los derechos sobre la Aplicación, su código fuente, arquitectura, diseño y funcionalidades
            pertenecen en exclusiva a su titular.
          </BodyText>
          <BodyText>
            Queda prohibida la ingeniería inversa, descompilación o redistribución sin autorización expresa.
          </BodyText>
        </SectionCard>

        {/* ── Sección 13 ── */}
        <SectionCard number="13" title="Legislación y Jurisdicción">
          <BodyText>
            Las presentes condiciones se rigen por la legislación española.
          </BodyText>
          <BodyText>
            Para cualquier controversia, las partes se someten expresamente a los Juzgados y Tribunales
            del domicilio del titular del software, con renuncia expresa a cualquier otro fuero que pudiera
            corresponder.
          </BodyText>
        </SectionCard>

        {/* Footer */}
        <View style={styles.footerCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#059669" />
          <Text style={styles.footerText}>
            Documento oficial. Versión 1.0 — Prescriptor © 2026
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
    marginBottom: 16,
  },
  headerIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTextBlock: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  // Metadata
  metaCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    width: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 2,
  },
  metaLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Section card
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },

  // Body
  bodyText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 4,
  },

  // Bullets
  bulletList: {
    marginBottom: 8,
    gap: 5,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginTop: 7,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },

  // Footer
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 16,
    marginTop: 8,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: '#065F46',
    fontWeight: '500',
  },
});
