# Sistema de Logging

## Visão Geral

O projeto utiliza um sistema de logging inteligente que **remove automaticamente** os logs em builds de produção, mantendo apenas logs essenciais de erro.

## Como Funciona

### Ambiente de Desenvolvimento (`__DEV__ = true`)
- ✅ Todos os logs são exibidos no console
- ✅ Logs de debug, info, warn e error funcionam normalmente
- ✅ Ótimo para debugging durante desenvolvimento

### Ambiente de Produção (`__DEV__ = false`)
- ❌ Logs informativos são **removidos** (não aparecem no console)
- ❌ Logs de debug são **removidos**
- ❌ Logs de warning são **removidos**
- ✅ Apenas **erros críticos** são capturados (e podem ser enviados para analytics)

## Uso

### Importar o Logger

```typescript
import { Logger } from '@/utils/Logger';
```

### Métodos Disponíveis

```typescript
// Log informativo (removido em produção)
Logger.log('[Component]', 'Mensagem informativa');

// Log de debug (removido em produção)
Logger.debug('[API]', 'Detalhes técnicos:', data);

// Log de warning (removido em produção)
Logger.warn('[Service]', 'Aviso importante');

// Log de erro (SEMPRE capturado, pode ser enviado para analytics)
Logger.error('[Auth]', 'Erro crítico:', error);

// Log de info (removido em produção)
Logger.info('[App]', 'Informação geral');
```

### Métodos Avançados

```typescript
// Agrupar logs relacionados
Logger.group('Processo de Login');
Logger.log('Etapa 1: Validação');
Logger.log('Etapa 2: Autenticação');
Logger.groupEnd();

// Exibir dados em tabela
Logger.table([
  { nome: 'João', idade: 25 },
  { nome: 'Maria', idade: 30 }
]);

// Medir tempo de execução
Logger.time('Operação Complexa');
// ... código ...
Logger.timeEnd('Operação Complexa'); // Exibe: Operação Complexa: 1234ms
```

## Exemplos Práticos

### ❌ ERRADO (usar console.log diretamente)

```typescript
export class AuthService {
  static async login(email: string) {
    console.log('Login attempt:', email); // ❌ Aparecerá em produção!
    console.error('Login failed'); // ❌ Sem tratamento
  }
}
```

### ✅ CORRETO (usar Logger)

```typescript
import { Logger } from '@/utils/Logger';

export class AuthService {
  static async login(email: string) {
    Logger.log('[Auth] Login attempt:', email); // ✅ Removido em produção
    Logger.error('[Auth] Login failed'); // ✅ Capturado e pode ser enviado para analytics
  }
}
```

## Build de Produção

### Como Testar Logs em Produção

Para testar como o app se comporta em produção (sem logs):

```bash
# Android
npm run android -- --mode=release

# iOS
npm run ios -- --configuration=Release
```

### Verificar se está em modo de produção

No código, você pode verificar:

```typescript
if (__DEV__) {
  // Estamos em desenvolvimento
  Logger.log('Modo: Desenvolvimento');
} else {
  // Estamos em produção
  Logger.log('Este log NÃO aparecerá');
}
```

## Integração com Analytics (Futuro)

Em produção, os erros podem ser enviados automaticamente para serviços de monitoramento:

```typescript
// Em Logger.ts
static error(...args: any[]): void {
  if (isDevelopment) {
    console.error(...args);
  } else {
    // Enviar para serviço de monitoramento
    Sentry.captureException(new Error(args.join(' ')));
    // ou
    Crashlytics.log(args.join(' '));
  }
}
```

### Serviços Recomendados

- **Sentry**: Monitoramento de erros em tempo real
- **Firebase Crashlytics**: Relatórios de crashes
- **LogRocket**: Gravação de sessões de usuário
- **Bugsnag**: Detecção e diagnóstico de erros

## Benefícios

### Performance
- ✅ Logs removidos em produção não consomem recursos
- ✅ App mais rápido e leve

### Segurança
- ✅ Dados sensíveis não aparecem em logs de produção
- ✅ Tokens, senhas, etc. não vazam no console

### Profissionalismo
- ✅ Console limpo para usuários finais
- ✅ Apenas erros críticos são capturados

### Debugging
- ✅ Logs detalhados em desenvolvimento
- ✅ Fácil identificação de problemas

## Migração

Se você tem código antigo usando `console.log`, substitua por:

```bash
# Buscar todos os console.log no projeto
grep -r "console\." src/

# Substituir manualmente ou usar find/replace:
# console.log → Logger.log
# console.warn → Logger.warn
# console.error → Logger.error
# console.debug → Logger.debug
```

## Boas Práticas

### ✅ DO

```typescript
// Prefixar logs com [Component/Service]
Logger.log('[HomePage] Component mounted');
Logger.log('[AuthService] User logged in:', user.email);

// Usar Logger.error para erros
try {
  await api.call();
} catch (error) {
  Logger.error('[API] Request failed:', error);
}
```

### ❌ DON'T

```typescript
// Não usar console diretamente
console.log('Teste'); // ❌

// Não logar dados sensíveis
Logger.log('Password:', password); // ❌ NUNCA!
Logger.log('Token:', accessToken); // ❌ NUNCA!

// Preferir Logger.debug para dados sensíveis em dev
Logger.debug('[Auth] Token generated'); // ✅ OK (removido em prod)
```

## Resumo

| Método | Dev | Produção | Uso |
|--------|-----|----------|-----|
| `Logger.log()` | ✅ Exibe | ❌ Remove | Logs informativos gerais |
| `Logger.debug()` | ✅ Exibe | ❌ Remove | Logs técnicos detalhados |
| `Logger.warn()` | ✅ Exibe | ❌ Remove | Avisos não-críticos |
| `Logger.error()` | ✅ Exibe | ⚠️ Captura | Erros críticos (analytics) |
| `Logger.info()` | ✅ Exibe | ❌ Remove | Informações gerais |

---

**Importante**: Sempre use `Logger` ao invés de `console` para garantir que logs sejam removidos em produção!
