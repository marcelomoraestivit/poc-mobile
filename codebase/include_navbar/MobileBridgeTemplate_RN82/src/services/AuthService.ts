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
        await this.refreshTokens();
      }

      console.log('[Auth] Service initialized, user:', this.currentUser?.email);
    } catch (error) {
      console.error('[Auth] Initialization error:', error);
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

      // Mock implementation
      const user: User = {
        id: 'user_123',
        email,
        name: email.split('@')[0],
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      const tokens: AuthTokens = {
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        expiresAt: Date.now() + 3600000, // 1 hour
      };

      await this.setAuth(user, tokens);

      console.log('[Auth] Login successful:', user.email);
      return user;
    } catch (error) {
      console.error('[Auth] Login error:', error);
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

      console.log('[Auth] Google login successful');
      return user;
    } catch (error) {
      console.error('[Auth] Google login error:', error);
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

      console.log('[Auth] Registration successful:', user.email);
      return user;
    } catch (error) {
      console.error('[Auth] Registration error:', error);
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

      console.log('[Auth] Logout successful');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  static async refreshTokens(): Promise<void> {
    try {
      if (!this.tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      // TODO: Implement token refresh
      // const response = await api.post('/auth/refresh', {
      //   refreshToken: this.tokens.refreshToken,
      // });
      // const { tokens } = response.data;

      // Mock implementation
      const tokens: AuthTokens = {
        accessToken: 'mock_refreshed_access_token',
        refreshToken: this.tokens.refreshToken,
        expiresAt: Date.now() + 3600000,
      };

      this.tokens = tokens;
      await SecureStorage.setObject('tokens', tokens);

      console.log('[Auth] Tokens refreshed');
    } catch (error) {
      console.error('[Auth] Token refresh error:', error);
      await this.logout();
      throw error;
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

    // Refresh if expired
    if (this.isTokenExpired()) {
      await this.refreshTokens();
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
      console.error('[Auth] Load saved auth error:', error);
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

      console.log('[Auth] Password reset email sent to:', email);
    } catch (error) {
      console.error('[Auth] Send password reset error:', error);
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

      console.log('[Auth] Profile updated');
      return updatedUser;
    } catch (error) {
      console.error('[Auth] Update profile error:', error);
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
      console.error('[Auth] Enable biometric error:', error);
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
      console.error('[Auth] Biometric auth error:', error);
      return false;
    }
  }
}

export default AuthService;
