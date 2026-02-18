import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';
import { BiometricService } from '../services/BiometricService';

const BRAND_LOGO = require('../../assets/splash_screens/android/drawable-xxhdpi/splash.jpg');

const PRIMARY = '#5551F5';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    login();
  };

  const handleBiometricLogin = async () => {
    const success = await BiometricService.authenticate();
    if (success) {
      login();
    } else {
      Alert.alert('Error', 'Autenticación biométrica fallida');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image source={BRAND_LOGO} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.welcomeTitle}>Bienvenido</Text>
            <Text style={styles.welcomeSubtitle}>Accede a tu plataforma médica</Text>
          </View>

          {/* ── Card ── */}
          <View style={styles.card}>
            {/* Email */}
            <Text style={styles.label}>Email o Usuario</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="tu@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(v => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {/* Primary button */}
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continúa con</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Biometric button */}
            <TouchableOpacity style={styles.secondaryButton} onPress={handleBiometricLogin} activeOpacity={0.85}>
              <Ionicons name="finger-print" size={22} color={PRIMARY} style={styles.biometricIcon} />
              <Text style={styles.secondaryButtonText}>Acceso con Huella</Text>
            </TouchableOpacity>

            {/* Demo hint */}
            <View style={styles.demoRow}>
              <Text style={styles.demoText}>
                <Text style={styles.demoBold}>Demo: </Text>
                Usa cualquier email y contraseña{' '}
              </Text>
              <Text style={styles.demoCode}>demo123</Text>
            </View>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Sistema seguro con cifrado de extremo a extremo</Text>
            <Text style={styles.footerText}>© 2026 Prescriptor Pro • Versión 2.1.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PRIMARY,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    width: 180,
    height: 200,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    marginBottom: 20,
  },
  logoImage: {
    width: 180,
    height: 200,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },

  // Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },

  // Primary button
  primaryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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

  // Secondary button
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 52,
    marginBottom: 20,
  },
  biometricIcon: {
    marginRight: 10,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },

  // Demo hint
  demoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  demoBold: {
    fontWeight: '700',
    color: '#374151',
  },
  demoCode: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 28,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
});
