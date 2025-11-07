/**
 * Authentication Service
 * Handle user authentication (email, Google, biometric)
 *
 * TODO: Integrate with Firebase Auth or backend API
 * npm install @react-native-firebase/auth
 * npm install @react-native-google-signin/google-signin
 * npm install react-native-biometrics
 */

import { SecureStorage } from '../storage/SecureStorage';
import { JWTGenerator } from '../utils/JWTGenerator';
import { Logger } from '../utils/Logger';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class AuthService {
  private static currentUser?: User;
  private static tokens?: AuthTokens;
  private static listeners: Array<(user: User | null) => void> = [];

  /**
   * Initialize auth service
   */
  static async initialize(): Promise<void> {
    try {
      // Load saved user and tokens
      await this.loadSavedAuth();

      // Check if tokens are still valid
      if (this.tokens && this.isTokenExpired()) {
        Logger.log('[Auth] Token expired on initialization - performing silent logout');
        await this.logout();
        return; // Exit early after logout
      }

      Logger.log('[Auth] Service initialized, user:', this.currentUser?.email);
    } catch (error) {
      Logger.error('[Auth] Initialization error:', error);
      // Silent logout on initialization errors
      await this.logout();
    }
  }

  /**
   * Login with email and password
   */
  static async loginWithEmail(
    email: string,
    password: string
  ): Promise<User> {
    try {
      // TODO: Implement actual backend API call
      // const response = await api.post('/auth/login', { email, password });
      // const { user, tokens } = response.data;

      // Validação simples de credenciais (usuário de teste)
      const TEST_USERS = [
        { email: 'usuario@teste.com', password: 'senha123', name: 'Usuário Teste' },
        { email: 'admin@teste.com', password: 'admin123', name: 'Admin Teste' },
      ];

      const testUser = TEST_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!testUser) {
        throw new Error('Credenciais inválidas');
      }

      // Criar usuário
      const userId = `user_${Date.now()}`;
      const user: User = {
        id: userId,
        email: testUser.email,
        name: testUser.name,
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      // Gerar JWT tokens reais
      const accessToken = JWTGenerator.generateToken(userId, testUser.email, testUser.name, 1 / 60); // 1 minuto
      const refreshToken = JWTGenerator.generateRefreshToken(userId, testUser.email, testUser.name); // 7 dias

      const tokens: AuthTokens = {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + 60 * 1000, // 1 minuto
      };

      await this.setAuth(user, tokens);

      Logger.log('[Auth] Login successful:', user.email);
      Logger.debug('[Auth] JWT Token:', accessToken);
      return user;
    } catch (error) {
      Logger.error('[Auth] Login error:', error);
      throw new Error('Login failed: ' + (error as Error).message);
    }
  }

  /**
   * Login with Google
   */
  static async loginWithGoogle(): Promise<User> {
    try {
      // TODO: Implement Google Sign-In
      // import { GoogleSignin } from '@react-native-google-signin/google-signin';

      // await GoogleSignin.hasPlayServices();
      // const userInfo = await GoogleSignin.signIn();

      // const response = await api.post('/auth/google', {
      //   idToken: userInfo.idToken,
      // });

      // const { user, tokens } = response.data;

      // Mock implementation
      const user: User = {
        id: 'google_user_123',
        email: 'user@gmail.com',
        name: 'Google User',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      const tokens: AuthTokens = {
        accessToken: 'mock_google_access_token',
        refreshToken: 'mock_google_refresh_token',
        expiresAt: Date.now() + 3600000,
      };

      await this.setAuth(user, tokens);

      Logger.log('[Auth] Google login successful');
      return user;
    } catch (error) {
      Logger.error('[Auth] Google login error:', error);
      throw new Error('Google login failed');
    }
  }

  /**
   * Register new user
   */
  static async register(
    email: string,
    password: string,
    name: string
  ): Promise<User> {
    try {
      // TODO: Implement backend API call
      // const response = await api.post('/auth/register', { email, password, name });
      // const { user, tokens } = response.data;

      // Mock implementation
      const user: User = {
        id: 'new_user_' + Date.now(),
        email,
        name,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      };

      const tokens: AuthTokens = {
        accessToken: 'mock_new_access_token',
        refreshToken: 'mock_new_refresh_token',
        expiresAt: Date.now() + 3600000,
      };

      await this.setAuth(user, tokens);

      Logger.log('[Auth] Registration successful:', user.email);
      return user;
    } catch (error) {
      Logger.error('[Auth] Registration error:', error);
      throw new Error('Registration failed');
    }
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<void> {
    try {
      // TODO: Revoke tokens on backend
      // await api.post('/auth/logout');

      // Clear local storage
      await SecureStorage.removeItem('user');
      await SecureStorage.removeItem('tokens');

      // Clear in-memory data
      this.currentUser = undefined;
      this.tokens = undefined;

      // Notify listeners
      this.notifyListeners(null);

      Logger.log('[Auth] Logout successful');
    } catch (error) {
      Logger.error('[Auth] Logout error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   * In mock mode, this just performs a silent logout
   */
  static async refreshTokens(): Promise<void> {
    try {
      if (!this.tokens?.refreshToken) {
        Logger.log('[Auth] No refresh token - performing silent logout');
        await this.logout();
        return;
      }

      // TODO: Implement token refresh with real backend
      // const response = await api.post('/auth/refresh', {
      //   refreshToken: this.tokens.refreshToken,
      // });
      // const { tokens } = response.data;

      // For mock mode, we don't implement auto-refresh
      // Just perform silent logout when token expires
      Logger.log('[Auth] Token expired - performing silent logout (mock mode)');
      await this.logout();
    } catch (error) {
      Logger.log('[Auth] Token refresh error - performing silent logout');
      await this.logout();
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.currentUser !== undefined && !this.isTokenExpired();
  }

  /**
   * Get current user
   */
  static getCurrentUser(): User | undefined {
    return this.currentUser;
  }

  /**
   * Get access token
   */
  static async getAccessToken(): Promise<string | null> {
    if (!this.tokens) return null;

    // Check if expired - in mock mode, just return null and logout
    if (this.isTokenExpired()) {
      Logger.log('[Auth] Token expired - performing silent logout');
      await this.logout();
      return null;
    }

    return this.tokens.accessToken;
  }

  /**
   * Check if token is expired
   */
  private static isTokenExpired(): boolean {
    if (!this.tokens) return true;
    return Date.now() >= this.tokens.expiresAt;
  }

  /**
   * Set authentication (user and tokens)
   */
  private static async setAuth(user: User, tokens: AuthTokens): Promise<void> {
    this.currentUser = user;
    this.tokens = tokens;

    // Save to secure storage
    await SecureStorage.setObject('user', user);
    await SecureStorage.setObject('tokens', tokens);

    // Notify listeners
    this.notifyListeners(user);
  }

  /**
   * Load saved authentication
   */
  private static async loadSavedAuth(): Promise<void> {
    try {
      const user = await SecureStorage.getObject<User>('user');
      const tokens = await SecureStorage.getObject<AuthTokens>('tokens');

      if (user && tokens) {
        this.currentUser = user;
        this.tokens = tokens;
      }
    } catch (error) {
      Logger.error('[Auth] Load saved auth error:', error);
    }
  }

  /**
   * Add auth state listener
   */
  static addListener(
    listener: (user: User | null) => void
  ): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  private static notifyListeners(user: User | null): void {
    this.listeners.forEach(listener => listener(user));
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // TODO: Implement password reset
      // await api.post('/auth/reset-password', { email });

      Logger.log('[Auth] Password reset email sent to:', email);
    } catch (error) {
      Logger.error('[Auth] Send password reset error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      // TODO: Implement profile update
      // const response = await api.patch('/user/profile', updates);
      // const { user } = response.data;

      // Mock implementation
      const updatedUser = { ...this.currentUser, ...updates };

      this.currentUser = updatedUser;
      await SecureStorage.setObject('user', updatedUser);

      this.notifyListeners(updatedUser);

      Logger.log('[Auth] Profile updated');
      return updatedUser;
    } catch (error) {
      Logger.error('[Auth] Update profile error:', error);
      throw error;
    }
  }

  /**
   * Enable biometric authentication
   */
  static async enableBiometric(): Promise<boolean> {
    try {
      // TODO: Implement biometric authentication
      // import ReactNativeBiometrics from 'react-native-biometrics';
      // const rnBiometrics = new ReactNativeBiometrics();

      // const { available } = await rnBiometrics.isSensorAvailable();
      // if (!available) return false;

      // const { success } = await rnBiometrics.simplePrompt({
      //   promptMessage: 'Confirme sua identidade',
      // });

      // if (success) {
      //   await SecureStorage.setItem('biometric_enabled', 'true');
      // }

      // return success;

      return false;
    } catch (error) {
      Logger.error('[Auth] Enable biometric error:', error);
      return false;
    }
  }

  /**
   * Authenticate with biometrics
   */
  static async authenticateWithBiometric(): Promise<boolean> {
    try {
      // TODO: Implement biometric authentication
      // import ReactNativeBiometrics from 'react-native-biometrics';
      // const rnBiometrics = new ReactNativeBiometrics();

      // const { success } = await rnBiometrics.simplePrompt({
      //   promptMessage: 'Autentique para continuar',
      // });

      // return success;

      return false;
    } catch (error) {
      Logger.error('[Auth] Biometric auth error:', error);
      return false;
    }
  }
}

export default AuthService;
