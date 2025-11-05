#!/bin/bash

echo "♻️  Restaurando Logger original..."

if [ -f "src/utils/Logger.ts.backup" ]; then
    mv src/utils/Logger.ts.backup src/utils/Logger.ts
    echo "✅ Logger restaurado para modo DESENVOLVIMENTO"
    echo ""
    echo "📱 Recarregue o app (R+R) para ver os logs novamente"
else
    echo "❌ Backup não encontrado. Recriando Logger original..."

    cat > src/utils/Logger.ts << 'EOF'
/**
 * Logger Utility
 *
 * Sistema de logging que:
 * - Em DEV: Mostra todos os logs no console
 * - Em PRODUCTION: Remove todos os logs (exceto errors críticos)
 */

const isDevelopment = __DEV__;

export class Logger {
  static log(...args: any[]): void {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  static warn(...args: any[]): void {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  static error(...args: any[]): void {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // Em produção, enviar para serviço de monitoramento
      // TODO: Integrar com Sentry, Firebase Crashlytics, etc.
      // Sentry.captureException(new Error(args.join(' ')));
    }
  }

  static debug(...args: any[]): void {
    if (isDevelopment) {
      console.debug(...args);
    }
  }

  static info(...args: any[]): void {
    if (isDevelopment) {
      console.info(...args);
    }
  }

  static group(label: string): void {
    if (isDevelopment) {
      console.group(label);
    }
  }

  static groupEnd(): void {
    if (isDevelopment) {
      console.groupEnd();
    }
  }

  static table(data: any): void {
    if (isDevelopment) {
      console.table(data);
    }
  }

  static time(label: string): void {
    if (isDevelopment) {
      console.time(label);
    }
  }

  static timeEnd(label: string): void {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
}

export default Logger;
EOF

    echo "✅ Logger recriado com configuração original"
fi

echo ""
