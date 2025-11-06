/**
 * App de Teste - Simula um aplicativo host que incorpora o MobileBridge
 *
 * Este arquivo demonstra como integrar o App Embedded (App.Embedded.tsx com TabBar)
 * dentro de uma aplicação React Native maior como uma tela adicional.
 *
 * Para testar:
 * 1. npm run mode:testhost
 * 2. Recarregue o app (R+R)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

// Importa o componente Embedded do MobileBridge (com TabBar)
import WebApp from './App.Embedded';
import { AuthService } from './src/services/AuthService';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import { Logger } from './src/utils/Logger';

type Screen = 'home' | 'profile' | 'settings' | 'webview';

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

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticação ao iniciar
  useEffect(() => {
    Logger.log('[App.TestHost] Component mounted - Starting auth check');
    const checkAuth = async () => {
      try {
        Logger.log('[App.TestHost] Initializing AuthService...');
        await AuthService.initialize();

        // Verificar se está autenticado E se o token é válido
        const authenticated = AuthService.isAuthenticated();
        Logger.log('[App.TestHost] Authentication status:', authenticated);

        if (authenticated) {
          const user = AuthService.getCurrentUser();
          Logger.log('[App.TestHost] User authenticated:', user?.email);
          Logger.log('[App.TestHost] Token is valid');
        } else {
          Logger.log('[App.TestHost] User NOT authenticated or token expired - will show login');
          // Se tinha um usuário salvo mas o token expirou, fazer logout completo
          const user = AuthService.getCurrentUser();
          if (user) {
            Logger.log('[App.TestHost] Token expired for user:', user.email, '- logging out');
            await AuthService.logout();
          }
        }

        setIsAuthenticated(authenticated);
      } catch (error) {
        Logger.error('[App.TestHost] Auth check error:', error);
        // Em caso de erro, fazer logout para garantir estado limpo
        await AuthService.logout();
        setIsAuthenticated(false);
      } finally {
        Logger.log('[App.TestHost] Auth check completed - Setting isCheckingAuth to false');
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Listener para mudanças de autenticação
  useEffect(() => {
    const unsubscribe = AuthService.addListener((user) => {
      Logger.log('[App.TestHost] Auth state changed, user:', user?.email || 'null');
      setIsAuthenticated(user !== null);
    });

    return () => unsubscribe();
  }, []);

  // Handler de login bem-sucedido
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Handler de logout
  const handleLogout = async () => {
    Logger.log('[App.TestHost] Logging out...');
    await AuthService.logout();
    setIsAuthenticated(false);
    setCurrentScreen('home');
  };

  // Handler de navegação com verificação de autenticação
  const handleNavigateToScreen = async (screen: Screen) => {
    Logger.log('[App.TestHost] Attempting to navigate to:', screen);

    // Verificar se o token ainda é válido antes de navegar
    const isStillAuthenticated = AuthService.isAuthenticated();

    if (!isStillAuthenticated) {
      Logger.log('[App.TestHost] Token expired during navigation - forcing logout');
      await AuthService.logout();
      setIsAuthenticated(false);
      setCurrentScreen('home');
      return;
    }

    Logger.log('[App.TestHost] Token is valid - navigating to:', screen);
    setCurrentScreen(screen);
  };

  // Mostrar erro se houver
  if (error) {
    Logger.log('[App.TestHost] Rendering ERROR screen');
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>⚠️ Erro</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setIsCheckingAuth(true);
            }}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Mostrar loading enquanto verifica autenticação
  if (isCheckingAuth) {
    Logger.log('[App.TestHost] Rendering LOADING screen - isCheckingAuth:', isCheckingAuth);
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Verificando autenticação...</Text>
        </View>
      </View>
    );
  }

  // Mostrar tela de login se não estiver autenticado
  if (!isAuthenticated) {
    Logger.log('[App.TestHost] Rendering LOGIN screen - isAuthenticated:', isAuthenticated);
    return (
      <View style={styles.container}>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </View>
    );
  }

  Logger.log('[App.TestHost] Rendering MAIN APP - isAuthenticated:', isAuthenticated, 'currentScreen:', currentScreen);

  // Renderiza a tela atual (APENAS telas nativas) usando componentes importados
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        Logger.log('[App.TestHost] Rendering HomeScreen');
        return (
          <HomeScreen
            onNavigate={handleNavigateToScreen}
            onLogout={handleLogout}
          />
        );
      case 'profile':
        Logger.log('[App.TestHost] Rendering ProfileScreen');
        return (
          <ProfileScreen
            onBack={() => handleNavigateToScreen('home')}
            onNavigateToWebView={() => handleNavigateToScreen('webview')}
          />
        );
      case 'settings':
        Logger.log('[App.TestHost] Rendering SettingsScreen');
        return (
          <SettingsScreen
            onBack={() => handleNavigateToScreen('home')}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <HomeScreen
            onNavigate={handleNavigateToScreen}
            onLogout={handleLogout}
          />
        );
    }
  };

  Logger.log('[App.TestHost] Rendering main app, currentScreen:', currentScreen);

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        {/* Conteúdo das telas nativas - esconde quando WebView ativo */}
        {/* Usando telas separadas importadas de src/screens/ (HomeScreen, ProfileScreen, SettingsScreen) */}
        {currentScreen !== 'webview' && (
          <View style={styles.content}>
            {renderScreen()}
          </View>
        )}

        {/* WebView - SEMPRE montado, mas escondido quando não ativo */}
        {/* Isso mantém o estado do WebView quando navegamos entre telas */}
        <View
          style={[
            styles.webviewContainer,
            currentScreen !== 'webview' && styles.hidden,
          ]}
        >
          <WebApp isVisible={currentScreen === 'webview'} />
        </View>

        {/* Bottom Navigation - Apenas quando NÃO está na WebView */}
        {currentScreen !== 'webview' && (
          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={[styles.navButton, currentScreen === 'home' && styles.navButtonActive]}
              onPress={() => setCurrentScreen('home')}
              activeOpacity={0.7}
            >
              <Text style={styles.navIcon}>🏠</Text>
              <Text style={[styles.navText, currentScreen === 'home' && styles.navTextActive]}>
                Início
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, currentScreen === 'profile' && styles.navButtonActive]}
              onPress={() => setCurrentScreen('profile')}
              activeOpacity={0.7}
            >
              <Text style={styles.navIcon}>👤</Text>
              <Text style={[styles.navText, currentScreen === 'profile' && styles.navTextActive]}>
                Perfil
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, currentScreen === 'settings' && styles.navButtonActive]}
              onPress={() => setCurrentScreen('settings')}
              activeOpacity={0.7}
            >
              <Text style={styles.navIcon}>⚙️</Text>
              <Text style={[styles.navText, currentScreen === 'settings' && styles.navTextActive]}>
                Config
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botão Voltar - Apenas quando está na WebView */}
        {currentScreen === 'webview' && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => handleNavigateToScreen('home')}
            activeOpacity={0.8}
          >
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        )}
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Light background (#F8F9FA)
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 4,
    opacity: 0.95,
  },

  // Content
  content: {
    flex: 1,
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  navButtonActive: {
    backgroundColor: 'transparent',
  },
  navText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  navTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // WebView
  webviewContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  hidden: {
    display: 'none',
  },

  // Back Button
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1000,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  // Error
  errorText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Navigation Icons
  navIcon: {
    fontSize: 24,
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
});

export default App;
