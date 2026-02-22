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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextInputField } from '../components/TextInputField';
import { useAuth } from '../contexts/AuthContext';
import type { AuthStackParamList } from '../navigation/AuthStack';

const BRAND_LOGO = require('../../assets/logo.png');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export const RegisterScreen = ({ navigation }: Props) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register({ fullName, email, password });
      Alert.alert(
        '¡Registro completado!',
        'Hemos enviado un email de verificación a tu correo. Verifica tu cuenta y espera la activación por parte del equipo de Prescriptor.',
        [{ text: 'Entendido', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear la cuenta';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
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
            <Text style={styles.welcomeTitle}>Crear cuenta</Text>
            <Text style={styles.welcomeSubtitle}>Únete a Prescriptor Pro</Text>
          </View>

          {/* ── Card ── */}
          <View style={styles.card}>
            {/*<TextInputField
              label="Nombre completo"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Dr. Juan García"
              leftIcon="person-outline"
              autoCapitalize="words"
            />*/}
            <TextInputField
              label="Email"
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
              placeholder="Mínimo 8 caracteres"
              leftIcon="lock-closed-outline"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
              onRightIconPress={() => setShowPassword(v => !v)}
            />
            <TextInputField
              label="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repite la contraseña"
              leftIcon="lock-closed-outline"
              secureTextEntry={!showConfirm}
              rightIcon={showConfirm ? 'eye-outline' : 'eye-off-outline'}
              onRightIconPress={() => setShowConfirm(v => !v)}
            />

            {/* Info box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Tu cuenta será revisada y activada por nuestro equipo. Recibirás una notificación cuando esté lista.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <PrimaryButton
                title="Crear cuenta"
                onPress={handleRegister}
                loading={loading}
              />
            </View>

            {/* Volver al login */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLinkText}>
                ¿Ya tienes cuenta?{' '}
                <Text style={styles.loginLinkBold}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
           {/*} <Text style={styles.footerText}>
              Sistema seguro con cifrado de extremo a extremo
            </Text>*/}
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
    marginBottom: 16,
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
  infoBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#4338CA',
    lineHeight: 18,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 14,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLinkBold: {
    color: '#5551F5',
    fontWeight: '600',
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
