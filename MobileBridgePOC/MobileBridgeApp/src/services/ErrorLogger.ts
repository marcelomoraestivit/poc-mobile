/**
 * Error Logger Service
 * Centralized error handling and logging
 *
 * TODO: Integrate with Sentry or Crashlytics in production
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class ErrorLogger {
  private static errors: Array<{
    error: Error;
    context?: ErrorContext;
    severity: ErrorSeverity;
    timestamp: number;
  }> = [];

  private static readonly MAX_STORED_ERRORS = 100;
  private static enabled = true;

  /**
   * Enable or disable error logging
   */
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Log an error with context
   */
  static log(
    error: Error | string,
    context?: ErrorContext,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ): void {
    if (!this.enabled) return;

    const errorObj = typeof error === 'string' ? new Error(error) : error;

    // Store error
    this.errors.push({
      error: errorObj,
      context,
      severity,
      timestamp: Date.now(),
    });

    // Keep only recent errors
    if (this.errors.length > this.MAX_STORED_ERRORS) {
      this.errors.shift();
    }

    // Log to console
    const contextStr = context?.component
      ? `[${context.component}${context.action ? `:${context.action}` : ''}]`
      : '';

    console.error(
      `${contextStr} ${severity.toUpperCase()}:`,
      errorObj.message,
      context?.metadata
    );

    // TODO: Send to remote logging service (Sentry, Crashlytics, etc)
    // this.sendToRemote(errorObj, context, severity);
  }

  /**
   * Log critical error
   */
  static critical(error: Error | string, context?: ErrorContext): void {
    this.log(error, context, ErrorSeverity.CRITICAL);
  }

  /**
   * Log high severity error
   */
  static high(error: Error | string, context?: ErrorContext): void {
    this.log(error, context, ErrorSeverity.HIGH);
  }

  /**
   * Log medium severity error
   */
  static error(error: Error | string, context?: ErrorContext): void {
    this.log(error, context, ErrorSeverity.MEDIUM);
  }

  /**
   * Log low severity error (warning)
   */
  static warn(error: Error | string, context?: ErrorContext): void {
    this.log(error, context, ErrorSeverity.LOW);
  }

  /**
   * Get all stored errors
   */
  static getErrors() {
    return [...this.errors];
  }

  /**
   * Get errors by severity
   */
  static getErrorsBySeverity(severity: ErrorSeverity) {
    return this.errors.filter(e => e.severity === severity);
  }

  /**
   * Clear all stored errors
   */
  static clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get error statistics
   */
  static getStats() {
    return {
      total: this.errors.length,
      critical: this.errors.filter(e => e.severity === ErrorSeverity.CRITICAL).length,
      high: this.errors.filter(e => e.severity === ErrorSeverity.HIGH).length,
      medium: this.errors.filter(e => e.severity === ErrorSeverity.MEDIUM).length,
      low: this.errors.filter(e => e.severity === ErrorSeverity.LOW).length,
    };
  }

  /**
   * Send error to remote logging service
   * TODO: Implement actual remote logging
   */
  private static async sendToRemote(
    error: Error,
    context?: ErrorContext,
    severity?: ErrorSeverity
  ): Promise<void> {
    // Example Sentry integration:
    // import * as Sentry from '@sentry/react-native';
    // Sentry.captureException(error, {
    //   level: severity,
    //   tags: {
    //     component: context?.component,
    //     action: context?.action,
    //   },
    //   extra: context?.metadata,
    // });

    // Example Crashlytics integration:
    // import crashlytics from '@react-native-firebase/crashlytics';
    // crashlytics().recordError(error);
    // if (context) {
    //   crashlytics().log(JSON.stringify(context));
    // }
  }

  /**
   * Format error for display
   */
  static formatError(error: Error, includeStack = false): string {
    if (includeStack && error.stack) {
      return `${error.name}: ${error.message}\n${error.stack}`;
    }
    return `${error.name}: ${error.message}`;
  }

  /**
   * Check if error should notify user
   */
  static shouldNotifyUser(severity: ErrorSeverity): boolean {
    return [ErrorSeverity.HIGH, ErrorSeverity.CRITICAL].includes(severity);
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: Error): string {
    // Map technical errors to user-friendly messages
    const errorMessages: Record<string, string> = {
      'Network request failed': 'Erro de conexão. Verifique sua internet.',
      'timeout': 'A operação demorou muito. Tente novamente.',
      'Invalid signature': 'Erro de segurança. Recarregue o aplicativo.',
      'Rate limit exceeded': 'Muitas requisições. Aguarde um momento.',
    };

    for (const [key, message] of Object.entries(errorMessages)) {
      if (error.message.toLowerCase().includes(key.toLowerCase())) {
        return message;
      }
    }

    // Default message
    return 'Ocorreu um erro. Tente novamente.';
  }
}

export default ErrorLogger;
