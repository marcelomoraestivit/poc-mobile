/**
 * JWT Token Generator
 * Gera tokens JWT básicos para autenticação da aplicação
 *
 * Nota: Esta é uma implementação simplificada para POC.
 * Em produção, use uma biblioteca como 'jsonwebtoken' ou
 * tokens gerados pelo backend.
 */

// Polyfill para base64 no React Native
const base64Encode = (str: string): string => {
  // React Native tem suporte nativo a base64 via btoa/atob
  if (typeof btoa !== 'undefined') {
    return btoa(str);
  }
  // Fallback para Node.js
  return Buffer.from(str, 'utf-8').toString('base64');
};

const base64Decode = (str: string): string => {
  if (typeof atob !== 'undefined') {
    return atob(str);
  }
  return Buffer.from(str, 'base64').toString('utf-8');
};

interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export class JWTGenerator {
  // Chave secreta (em produção, esta chave deve vir do backend)
  private static readonly SECRET_KEY = 'mobile-bridge-secret-key-2024';

  /**
   * Gera um token JWT
   */
  static generateToken(userId: string, email: string, name: string, expiresInHours: number = 1): string {
    const now = Math.floor(Date.now() / 1000);

    const payload: JWTPayload = {
      userId,
      email,
      name,
      iat: now, // Issued at
      exp: now + (expiresInHours * 3600), // Expiration
    };

    // Criar header JWT
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    // Encode header e payload
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));

    // Criar assinatura simplificada (mock para POC)
    // Em produção, use HMAC SHA256 real
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

    // Retornar token completo
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Decodifica um token JWT (sem validação de assinatura)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = this.base64UrlDecode(parts[1]);
      return JSON.parse(payload);
    } catch (error) {
      console.error('[JWT] Decode error:', error);
      return null;
    }
  }

  /**
   * Verifica se o token está expirado
   */
  static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  }

  /**
   * Valida um token JWT
   */
  static validateToken(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload) {
        return false;
      }

      // Verificar expiração
      if (this.isTokenExpired(token)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('[JWT] Validation error:', error);
      return false;
    }
  }

  /**
   * Extrai informações do usuário do token
   */
  static getUserFromToken(token: string): { userId: string; email: string; name: string } | null {
    const payload = this.decodeToken(token);
    if (!payload) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  }

  /**
   * Gera um refresh token (válido por 7 dias)
   */
  static generateRefreshToken(userId: string, email: string, name: string): string {
    return this.generateToken(userId, email, name, 24 * 7); // 7 dias
  }

  // ========== Métodos auxiliares ==========

  /**
   * Codifica string em Base64 URL-safe
   */
  private static base64UrlEncode(str: string): string {
    const base64 = base64Encode(str);
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Decodifica Base64 URL-safe
   */
  private static base64UrlDecode(str: string): string {
    // Adicionar padding se necessário
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      base64 += '='.repeat(4 - pad);
    }

    return base64Decode(base64);
  }

  /**
   * Cria assinatura simplificada
   * NOTA: Em produção, use HMAC SHA256 real com uma biblioteca como crypto
   */
  private static createSignature(data: string): string {
    // Implementação simplificada para POC
    // Em produção, use: crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url')

    const combined = data + this.SECRET_KEY;
    let hash = 0;

    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    const signature = Math.abs(hash).toString(36);
    return this.base64UrlEncode(signature);
  }
}

export default JWTGenerator;
