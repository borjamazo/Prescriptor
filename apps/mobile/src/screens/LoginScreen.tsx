import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextInputField } from '../components/TextInputField';
import { useAuth } from '../contexts/AuthContext';
import type { AuthStackParamList } from '../navigation/AuthStack';
import { AppIcon } from '../components/AppIcon';
import { version } from '../../package.json';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginWithCredentials, loginWithBiometrics } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      await loginWithCredentials(email.trim(), password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      Alert.alert('Acceso denegado', message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Próximamente', `Inicio de sesión con ${provider} disponible pronto.`);
  };

  const handleBiometricLogin = async () => {
    try {
      await loginWithBiometrics();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Autenticación biométrica fallida';
      Alert.alert('Error', message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <AppIcon size={100} />
            </View>
            <Text style={styles.welcomeTitle}>Bienvenido</Text>
            <Text style={styles.welcomeSubtitle}>Accede a tu plataforma médica</Text>
          </View>

          {/* ── Card ── */}
          <View style={styles.card}>
            <TextInputField
              label="Email o Usuario"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              leftIcon="mail-outline"
              keyboardType="email-address"
            />
            <TextInputField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              leftIcon="lock-closed-outline"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
              onRightIconPress={() => setShowPassword(v => !v)}
            />

            {/* Iniciar sesión */}
            <View style={styles.buttonContainer}>
              <PrimaryButton title="Iniciar Sesión" onPress={handleLogin} loading={loading} />
            </View>

            {/* Registro link */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLinkText}>
                ¿No tienes cuenta?{' '}
                <Text style={styles.registerLinkBold}>Regístrate</Text>
              </Text>
            </TouchableOpacity>

            {/* Divider: o continúa con */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continúa con</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialRow}>
              <SocialIconButton
                icon={<FontAwesome5 name="google" size={22} color="#EA4335" brand />}
                onPress={() => handleSocialLogin('Google')}
              />
              <SocialIconButton
                icon={<FontAwesome5 name="linkedin" size={22} color="#0A66C2" brand />}
                onPress={() => handleSocialLogin('LinkedIn')}
              />
              <SocialIconButton
                icon={<FontAwesome5 name="facebook" size={22} color="#1877F2" brand />}
                onPress={() => handleSocialLogin('Facebook')}
              />
            </View>

            {/* Divider: o usa */}
            <View style={[styles.divider, styles.dividerSpacingTop]}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o usa</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Biometric */}
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              activeOpacity={0.85}
            >
              <Ionicons name="finger-print" size={22} color="#5551F5" style={styles.biometricIcon} />
              <Text style={styles.biometricText}>Acceso con Huella</Text>
            </TouchableOpacity>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            {/*<Text style={styles.footerText}>
              Sistema seguro con cifrado de extremo a extremo
            </Text>*/}
            <Text style={styles.footerText}>
              © 2026 Prescriptor Pro • Versión {version}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ── Social Icon Button ────────────────────────────────────────────────────────

interface SocialIconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
}

const SocialIconButton = ({ icon, onPress }: SocialIconButtonProps) => (
  <TouchableOpacity
    style={styles.socialIconButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {icon}
  </TouchableOpacity>
);

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5551F5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logoContainer: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  welcomeTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContainer: {
    marginTop: 4,
    marginBottom: 14,
  },
  registerLink: {
    alignItems: 'center',
    marginBottom: 20,
  },
  registerLinkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  registerLinkBold: {
    color: '#5551F5',
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dividerSpacingTop: {
    marginTop: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#6B7280',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 6,
  },
  socialIconButton: {
    width: 60,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 52,
  },
  biometricIcon: {
    marginRight: 8,
  },
  biometricText: {
    color: '#111827',
    fontWeight: '500',
    fontSize: 15,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    marginBottom: 0,
  },
});
