/**
 * Login Screen
 * Autenticação com email/senha e geração de JWT token
 * Tema: Vermelho e Branco (Mantine-inspired)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../services/AuthService';

// Mantine-inspired color palette (red and white theme)
const COLORS = {
  primary: '#E03131',      // red.6
  primaryDark: '#C92A2A',  // red.7
  primaryLight: '#FFF5F5', // red.0
  white: '#FFFFFF',
  background: '#F8F9FA',
  text: '#212529',
  textSecondary: '#868E96',
  border: '#DEE2E6',
  shadow: '#000000',
};

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Usuário de teste
  const TEST_USER = {
    email: 'usuario@teste.com',
    password: 'senha123',
    name: 'Usuário Teste',
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      // Validar credenciais do usuário de teste
      if (email.toLowerCase() === TEST_USER.email && password === TEST_USER.password) {
        await AuthService.loginWithEmail(email, password);
        onLoginSuccess();
      } else {
        Alert.alert(
          'Erro de Autenticação',
          'Email ou senha incorretos.\n\nUsuário de teste:\nEmail: usuario@teste.com\nSenha: senha123'
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao fazer login. Tente novamente.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail(TEST_USER.email);
    setPassword(TEST_USER.password);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header Vermelho */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Mobile Bridge App</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.title}>Bem-vindo!</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Text style={styles.inputIcon}>📧</Text>
                <Text style={styles.label}>Email</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="usuario@teste.com"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Text style={styles.inputIcon}>🔒</Text>
                <Text style={styles.label}>Senha</Text>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Entrar</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Test User Helper */}
            <TouchableOpacity
              style={styles.testButton}
              onPress={fillTestCredentials}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.testIcon}>💡</Text>
              <Text style={styles.testButtonText}>
                Usar credenciais de teste
              </Text>
            </TouchableOpacity>
          </View>

          {/* Test User Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoIcon}>👤</Text>
              <Text style={styles.infoTitle}>Usuário de Teste</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoText}>{TEST_USER.email}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoText}>{TEST_USER.password}</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    backgroundColor: COLORS.primary,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  lockIcon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 0,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputIcon: {
    fontSize: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  eyeButton: {
    padding: 12,
  },
  eyeIcon: {
    fontSize: 20,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    shadowOpacity: 0,
  },
  loginIcon: {
    fontSize: 22,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  testButton: {
    marginTop: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  testIcon: {
    fontSize: 18,
  },
  testButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 16,
    paddingTop: 24,
    paddingBottom: 40,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  infoIcon: {
    fontSize: 22,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  infoItemIcon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '500',
  },
});

export default LoginScreen;