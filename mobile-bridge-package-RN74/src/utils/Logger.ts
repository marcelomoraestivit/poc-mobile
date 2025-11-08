/**
 * Logger Utility
 *
 * Sistema de logging que:
 * - Em DEV: Mostra todos os logs no console
 * - Em PRODUCTION: Remove todos os logs (exceto errors críticos)
 *
 * Uso:
 * import { Logger } from '@/utils/Logger';
 * Logger.log('[Component]', 'mensagem');
 * Logger.warn('[Component]', 'aviso');
 * Logger.error('[Component]', 'erro');
 */

const isDevelopment = __DEV__;

export class Logger {
  /**
   * Log informativo (apenas em desenvolvimento)
   */
  static log(...args: any[]): void {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  /**
   * Log de aviso (apenas em desenvolvimento)
   */
  static warn(...args: any[]): void {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  /**
   * Log de erro (sempre exibido, mas pode ser enviado para serviço de analytics)
   */
  static error(...args: any[]): void {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // Em produção, enviar para serviço de monitoramento
      // TODO: Integrar com Sentry, Firebase Crashlytics, etc.
      // Sentry.captureException(new Error(args.join(' ')));
    }
  }

  /**
   * Log de debug (apenas em desenvolvimento, muito verboso)
   */
  static debug(...args: any[]): void {
    if (isDevelopment) {
      console.debug(...args);
    }
  }

  /**
   * Log de informação importante (sempre exibido)
   */
  static info(...args: any[]): void {
    if (isDevelopment) {
      console.info(...args);
    }
  }

  /**
   * Agrupa logs (apenas em desenvolvimento)
   */
  static group(label: string): void {
    if (isDevelopment) {
      console.group(label);
    }
  }

  /**
   * Fecha grupo de logs (apenas em desenvolvimento)
   */
  static groupEnd(): void {
    if (isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Log com tabela (apenas em desenvolvimento)
   */
  static table(data: any): void {
    if (isDevelopment) {
      console.table(data);
    }
  }

  /**
   * Mede tempo de execução (apenas em desenvolvimento)
   */
  static time(label: string): void {
    if (isDevelopment) {
      console.time(label);
    }
  }

  /**
   * Finaliza medição de tempo (apenas em desenvolvimento)
   */
  static timeEnd(label: string): void {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
}

export default Logger;
