/**
 * Home Screen
 * Tela inicial com navegação para outras seções do app
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#E03131',
  primaryLight: '#FFF5F5',
  white: '#FFFFFF',
  background: '#F8F9FA',
  text: '#212529',
  textSecondary: '#868E96',
  border: '#DEE2E6',
  shadow: '#000000',
};

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onLogout }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Bem-vindo! 👋</Text>
          <Text style={styles.subtitle}>Escolha uma opção abaixo</Text>
        </View>

        {/* Cards de Navegação */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryLight }]}>
              <Text style={styles.emoji}>🌐</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>WebView Shop</Text>
              <Text style={styles.cardDescription}>
                Loja integrada via Mobile Bridge
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onNavigate('webview')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Abrir Loja</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryLight }]}>
              <Text style={styles.emoji}>👤</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Meu Perfil</Text>
              <Text style={styles.cardDescription}>Informações da conta</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => onNavigate('profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineButtonText}>Ver Perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryLight }]}>
              <Text style={styles.emoji}>⚙️</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Configurações</Text>
              <Text style={styles.cardDescription}>Ajustes do aplicativo</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => onNavigate('settings')}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineButtonText}>Configurar</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>🚪 Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  logoutButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
