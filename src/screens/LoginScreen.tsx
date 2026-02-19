import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextInputField } from '../components/TextInputField';
import { useAuth } from '../contexts/AuthContext';
import { BiometricService } from '../services/BiometricService';

const BRAND_LOGO = require('../../assets/logo.png');

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
              <Image source={BRAND_LOGO} style={styles.logo} resizeMode="contain" />
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

            <View style={styles.buttonContainer}>
              <PrimaryButton title="Iniciar Sesión" onPress={handleLogin} />
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continúa con</Text>
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

            {/* Demo hint */}
            <View style={styles.demoHint}>
              <Text style={styles.demoText}>
                <Text style={styles.demoBold}>Demo: </Text>
                Usa cualquier email y contraseña{' '}
              </Text>
              <Text style={styles.demoPassword}>demo123</Text>
            </View>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Sistema seguro con cifrado de extremo a extremo
            </Text>
            <Text style={styles.footerText}>
              © 2026 Prescriptor Pro • Versión 2.1.0
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    marginBottom: 28,
  },
  logoContainer: {
    width: 90,
    height: 100,
  },
  logo: {
    width: '100%',
    height: '100%',
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
    marginBottom: 20,
  },
  divider: {
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
    fontSize: 14,
    color: '#6B7280',
  },
  biometricButton: {
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
    marginRight: 8,
  },
  biometricText: {
    color: '#111827',
    fontWeight: '500',
    fontSize: 15,
  },
  demoHint: {
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
    fontWeight: 'bold',
    color: '#374151',
  },
  demoPassword: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5551F5',
  },
  footer: {
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    marginBottom: 4,
  },
});
