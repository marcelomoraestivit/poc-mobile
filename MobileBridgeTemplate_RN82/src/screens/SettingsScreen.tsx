/**
 * Settings Screen
 * Tela de configurações do aplicativo
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#E03131',
  white: '#FFFFFF',
  background: '#F8F9FA',
  text: '#212529',
  textSecondary: '#868E96',
  border: '#DEE2E6',
  shadow: '#000000',
  switchTrackOff: '#DEE2E6',
  switchTrackOn: '#E03131',
  switchThumb: '#FFFFFF',
};

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onLogout }) => {
  const [notifications, setNotifications] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Configurações</Text>
        </View>

        {/* Preferências */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferências</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notificações</Text>
              <Text style={styles.settingDescription}>
                Receber alertas e atualizações
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.switchTrackOff, true: COLORS.switchTrackOn }}
              thumbColor={COLORS.switchThumb}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Analytics</Text>
              <Text style={styles.settingDescription}>
                Compartilhar dados de uso
              </Text>
            </View>
            <Switch
              value={analytics}
              onValueChange={setAnalytics}
              trackColor={{ false: COLORS.switchTrackOff, true: COLORS.switchTrackOn }}
              thumbColor={COLORS.switchThumb}
            />
          </View>
        </View>

        {/* Sobre */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sobre</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versão</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2025.11.04</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>React Native</Text>
            <Text style={styles.infoValue}>0.82</Text>
          </View>
        </View>

        {/* Ações */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineButtonText}>📄 Termos de Uso</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlineButton, styles.buttonSpacing]}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineButtonText}>🔒 Política de Privacidade</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ghostButton, styles.buttonSpacing]}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.ghostButtonText}>🚪 Sair da Conta</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.text,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
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
  ghostButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSpacing: {
    marginTop: 12,
  },
});

export default SettingsScreen;
