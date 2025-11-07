# Getting Started - Mobile Bridge Skeleton

Guia rápido para começar a usar o Mobile Bridge Skeleton em 5 minutos.

## 🚀 Quick Start

### 1. Clone/Copy o Skeleton

```bash
# Copiar a pasta completa
cp -r MobileBridge-Skeleton meu-projeto-mobile
cd meu-projeto-mobile
```

### 2. Instalar Dependências

```bash
# Instalar pacotes npm
npm install

# iOS: Instalar pods (macOS apenas)
cd ios && pod install && cd ..
```

### 3. Configurar URL do WebView

Edite `App.tsx` linha ~126:

```typescript
// Altere para sua URL
const webAppUrl = 'http://10.0.2.2:3000'; // ← Sua URL aqui
```

**URLs importantes**:
- Android Emulator: `http://10.0.2.2:PORT` (localhost)
- iOS Simulator: `http://localhost:PORT`
- Produção: `https://seu-dominio.com`

### 4. Executar

```bash
# Android
npm run android

# iOS (macOS apenas)
npm run ios
```

## 📱 Testando a Comunicação

### No Web App

Adicione este código no seu HTML/JavaScript:

```html
<script>
  // Setup WebBridge
  window.WebBridge = {
    _callbacks: {},
    send: function(type, payload) {
      return new Promise((resolve, reject) => {
        const id = 'web_' + Date.now();
        const message = { id, type, payload, timestamp: Date.now() };

        this._callbacks[id] = { resolve, reject };

        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        } else {
          reject(new Error('Not in WebView'));
        }

        setTimeout(() => {
          delete this._callbacks[id];
          reject(new Error('Timeout'));
        }, 30000);
      });
    },
    handleNativeResponse: function(response) {
      const cb = this._callbacks[response.id];
      if (cb) {
        delete this._callbacks[response.id];
        response.success ? cb.resolve(response.data) : cb.reject(new Error(response.error));
      }
    }
  };
</script>

<button onclick="testBridge()">Test Bridge</button>

<script>
  async function testBridge() {
    try {
      const result = await window.WebBridge.send('showNotification', {
        title: 'Test',
        message: 'Bridge working!'
      });
      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  }
</script>
```

## ✅ Verificar Setup

### Checklist de Verificação

- [ ] `npm install` executado com sucesso
- [ ] Pods instalados (iOS)
- [ ] URL do WebView configurada
- [ ] App rodando no emulador/simulador
- [ ] WebView carregando a página
- [ ] Console do web não mostra erros
- [ ] Teste de bridge funcionando

### Comandos de Diagnóstico

```bash
# Verificar instalação do React Native
npx react-native doctor

# Ver logs Android
npx react-native log-android

# Ver logs iOS
npx react-native log-ios

# Limpar cache
npm start -- --reset-cache
```

## 🎯 Primeiros Passos

### 1. Entender a Arquitetura

Leia em ordem:
1. `README.md` - Visão geral
2. `ARCHITECTURE.md` - Arquitetura detalhada
3. `PROJECT_STRUCTURE.md` - Estrutura de arquivos

### 2. Ver Exemplos

Confira `EXAMPLES.md` para casos de uso completos.

### 3. Implementar Seu Handler

No `App.tsx`, adicione seu handler:

```typescript
useEffect(() => {
  // Seu handler customizado
  MobileBridge.registerHandler('meuHandler', async (payload) => {
    // Sua lógica aqui
    console.log('Payload recebido:', payload);

    // Retornar resultado
    return { success: true, data: 'resultado' };
  });

  return () => {
    MobileBridge.clear();
  };
}, []);
```

### 4. Chamar do Web

No seu web app:

```javascript
async function meuBotao() {
  try {
    const result = await window.WebBridge.send('meuHandler', {
      dados: 'valor'
    });
    console.log('Resultado:', result);
  } catch (error) {
    console.error('Erro:', error);
  }
}
```

## 📚 Documentação

### Documentos Principais

| Documento | Descrição |
|-----------|-----------|
| `README.md` | Overview e instalação |
| `INTEGRATION_GUIDE.md` | Guia passo a passo de integração |
| `WEB_INTEGRATION.md` | Integração lado web |
| `ARCHITECTURE.md` | Arquitetura e design patterns |
| `EXAMPLES.md` | Exemplos práticos completos |
| `PROJECT_STRUCTURE.md` | Estrutura de arquivos |

### Código Fonte Principal

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/bridge/MobileBridge.ts` | Comunicação Native ↔ Web |
| `src/utils/BridgeSecurity.ts` | Segurança e validação |
| `src/storage/OfflineStorage.ts` | Cache e fila offline |
| `src/network/NetworkManager.ts` | Detecção de rede |
| `src/sync/SyncManager.ts` | Sincronização |

## 🔧 Configurações Importantes

### Android Development

#### network_security_config.xml

Para desenvolvimento local, crie:

`android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">10.0.2.2</domain>
    <domain includeSubdomains="true">localhost</domain>
  </domain-config>
</network-security-config>
```

#### AndroidManifest.xml

Adicione:

```xml
<application
  android:networkSecurityConfig="@xml/network_security_config"
  ...>
```

### iOS Development

#### Info.plist

Para desenvolvimento local:

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsLocalNetworking</key>
  <true/>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

**⚠️ REMOVA em produção!**

## 🐛 Problemas Comuns

### WebView não carrega

**Sintomas**: Tela branca ou erro de rede

**Soluções**:
1. Verificar URL está correta
2. Verificar servidor web está rodando
3. Verificar network_security_config.xml (Android)
4. Verificar NSAppTransportSecurity (iOS)
5. Testar URL no browser do dispositivo

```bash
# Android: Testar URL
adb shell am start -a android.intent.action.VIEW -d "http://10.0.2.2:3000"
```

### Bridge não funciona

**Sintomas**: Mensagens não chegam no nativo

**Soluções**:
1. Verificar `window.ReactNativeWebView` existe
2. Verificar WebBridge foi inicializado
3. Adicionar logs no handleMessage
4. Verificar console do web para erros

```typescript
// Adicionar log no handleMessage
const handleMessage = useCallback(async (event: any) => {
  console.log('[Debug] Message received:', event.nativeEvent.data);
  // ...
}, []);
```

### Resposta não volta para web

**Sintomas**: Promise fica pending forever

**Soluções**:
1. Verificar handler está registrado
2. Verificar handler retorna Promise
3. Verificar injectJavaScript funciona
4. Verificar WebBridge.handleNativeResponse existe

```typescript
// Testar injectJavaScript
webViewRef.current?.injectJavaScript(`
  console.log('Test injection');
  alert('If you see this, injection works');
`);
```

### Build falha

**Sintomas**: Erro ao compilar

**Soluções**:
1. Limpar cache: `npm start -- --reset-cache`
2. Limpar build Android: `cd android && ./gradlew clean`
3. Reinstalar pods: `cd ios && pod install`
4. Reinstalar node_modules: `rm -rf node_modules && npm install`

## 📊 Estrutura de Dados

### Mensagem (Web → Native)

```typescript
{
  id: string,           // Único identificador
  type: string,         // Nome do handler
  payload: object,      // Dados
  timestamp: number,    // Unix timestamp
  signature?: string    // HMAC (opcional)
}
```

### Resposta (Native → Web)

```typescript
{
  id: string,           // Mesmo ID da mensagem
  success: boolean,     // Status
  data?: any,          // Dados de retorno
  error?: string,      // Mensagem de erro
  timestamp: number    // Unix timestamp
}
```

## 🎓 Próximos Passos

### Nível Iniciante
1. ✅ Seguir este guia
2. ✅ Testar comunicação básica
3. ✅ Implementar 1-2 handlers simples
4. ✅ Ver exemplos em `EXAMPLES.md`

### Nível Intermediário
1. Implementar offline sync
2. Adicionar autenticação
3. Implementar handlers complexos
4. Adicionar testes

### Nível Avançado
1. Configurar crypto real (crypto-js)
2. Instalar encrypted storage
3. Implementar analytics
4. Configurar CI/CD

## 💡 Dicas de Desenvolvimento

### 1. Use DevTools

```javascript
// No web, abrir DevTools
if (window.WebBridge?.isNative()) {
  console.log('Running in WebView');
} else {
  console.log('Running in browser - use mock');
}
```

### 2. Hot Reload

```bash
# Metro bundler permite hot reload
# Alterações em JS/TS recarregam automaticamente
# Alterações em native code requerem rebuild
```

### 3. Debug Remoto

```bash
# Abrir menu de debug
# Android: Shake ou Cmd+M
# iOS: Cmd+D

# Opções:
# - Enable Remote JS Debugging
# - Show Inspector
# - Reload
```

### 4. Log Tudo

```typescript
// Adicionar logs extensivos durante desenvolvimento
console.log('[Bridge] Message:', message);
console.log('[Network] Status:', isOnline);
console.log('[Storage] Cached:', key);
```

## 🚀 Deploy para Produção

### Checklist Pré-Produção

- [ ] SECRET_KEY configurado em BridgeSecurity
- [ ] crypto-js instalado
- [ ] react-native-encrypted-storage instalado
- [ ] NSAppTransportSecurity removido (iOS)
- [ ] cleartext traffic removido (Android)
- [ ] HTTPS configurado
- [ ] Rate limits revisados
- [ ] Error tracking configurado (Sentry, etc)
- [ ] Analytics configurado
- [ ] Logs de produção configurados

### Build de Release

```bash
# Android
cd android && ./gradlew assembleRelease

# iOS (Xcode)
# Product → Archive
```

## 📞 Suporte

- **Documentação**: Veja arquivos .md neste projeto
- **Projeto Original**: `simulation-mobile-bridge-ReactNative082`
- **Issues**: Reporte problemas no projeto original

## ✨ Features Incluídas

- ✅ Mobile Bridge com segurança
- ✅ Offline First com sync automático
- ✅ Network detection
- ✅ Cache com expiração
- ✅ Fila de ações offline
- ✅ Rate limiting
- ✅ Message validation
- ✅ XSS protection
- ✅ Componentes essenciais
- ✅ TypeScript
- ✅ Documentação completa

## 🎉 Pronto!

Agora você está pronto para desenvolver com o Mobile Bridge!

Para mais detalhes, consulte a documentação completa nos arquivos .md deste projeto.

**Happy coding! 🚀**
