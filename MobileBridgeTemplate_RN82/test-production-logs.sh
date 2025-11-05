#!/bin/bash

echo "🧪 Teste Rápido - Simular Logs de Produção"
echo "=========================================="
echo ""
echo "Este script simula como os logs se comportam em PRODUÇÃO"
echo "sem precisar fazer build de release."
echo ""

# Backup do Logger.ts
cp src/utils/Logger.ts src/utils/Logger.ts.backup

# Modificar Logger para simular produção
cat > src/utils/Logger.ts << 'EOF'
/**
 * Logger Utility - MODO DE TESTE (Simulando Produção)
 */

const isDevelopment = false; // ⚠️ FORÇADO PARA TESTE

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
      // Em produção, apenas erros críticos
      console.error('[PRODUCTION ERROR]', ...args);
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

echo "✅ Logger modificado para simular PRODUÇÃO"
echo ""
echo "📱 Agora recarregue o app (R+R) e observe:"
echo "   - Logs informativos NÃO aparecem"
echo "   - Apenas erros críticos (se houver)"
echo ""
echo "Para RESTAURAR o Logger normal:"
echo "   bash restore-logger.sh"
echo ""
