# Mobile Bridge Template - React Native 0.82

> Template de aplicativo híbrido que combina React Native com WebView, permitindo comunicação bidirecional entre aplicações web e recursos nativos do dispositivo.

[![React Native](https://img.shields.io/badge/React%20Native-0.82-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## ✨ Características

### 🌉 Mobile Bridge
- Comunicação bidirecional Web ↔ Native via promises
- API type-safe com TypeScript
- Handlers customizáveis e extensíveis
- Timeout e retry automáticos

### 🛒 E-Commerce Ready
- Gerenciamento de carrinho persistente
- Sistema de wishlist
- Autenticação JWT com tokens
- Checkout e pagamento integrado

### 🔐 Segurança
- Armazenamento criptografado (SecureStorage)
- Tokens JWT com expiração automática
- Logout silencioso em caso de token expirado
- Validação de mensagens bridge

### 📱 Recursos Nativos
- TabBar nativo com badges
- Notificações push
- Biometria (Touch ID / Face ID)
- Scanner de código de barras
- Compartilhamento nativo
- Informações do dispositivo

### 🎨 UI/UX
- Tema vermelho e branco (Mantine-inspired)
- Dark mode ready (infraestrutura preparada)
- Animações suaves
- Feedback visual (toasts, loading states)
- Tratamento de erros com Error Boundary

### 📶 Offline First
- Cache de dados com AsyncStorage
- Sincronização automática quando online
- Indicador de status de rede
- Queue de requisições offline

## 🏗️ Arquitetura

O template oferece **3 modos de operação**:

### 1. Standalone App (`App.tsx`)
Aplicativo completo com tela de login e WebView integrada.
```bash
npm run mode:standalone
```

### 2. Embedded App (`App.Embedded.tsx`)
WebView com TabBar nativo, pronto para ser incorporado em outro app.
```bash
npm run mode:embedded
```

### 3. Test Host App (`App.TestHost.tsx`)
Demonstra como integrar o Embedded em um aplicativo maior com telas nativas.
```bash
npm run mode:testhost
```

## 📋 Pré-requisitos

- Node.js >= 18
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS, apenas macOS)
- JDK 17 (para Android)

## 🚀 Quick Start

### 1. Instalar Dependências
```bash
npm install

# iOS only
cd ios && pod install && cd ..
```

### 2. Escolher Modo de Operação
```bash
# Standalone (app completo)
npm run mode:standalone

# Embedded (WebView + TabBar)
npm run mode:embedded

# Test Host (app host de exemplo)
npm run mode:testhost
```

### 3. Iniciar Metro Bundler
```bash
npm start
```

### 4. Executar no Dispositivo/Emulador

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Modo watch
npm test -- --watch

# Com coverage
npm test -- --coverage
```

## 📖 Documentação Completa

- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Guia passo a passo para começar
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitetura detalhada com diagramas Mermaid
- **[API.md](API.md)** - Referência completa da API do Mobile Bridge

## 🎯 Uso Básico

### Enviando Mensagem do Web para Native

```typescript
// No código web (React)
if (window.WebBridge) {
  const result = await window.WebBridge.sendToNative('addToCart', {
    product: { id: '1', name: 'Product', price: 99.90 },
    quantity: 2
  });
  console.log('Cart updated:', result);
}
```

### Registrando Handler no Native

```typescript
// No código React Native
MobileBridge.registerHandler('addToCart', async (payload) => {
  const { product, quantity } = payload;
  await CartManager.getInstance().addItem(product, quantity);
  return { success: true, count: CartManager.getInstance().getItemCount() };
});
```

## 📁 Estrutura do Projeto

```
MobileBridgeTemplate_RN82/
├── App.tsx                    # Standalone app
├── App.Embedded.tsx          # Embedded WebView
├── App.TestHost.tsx          # Host app demo
├── src/
│   ├── bridge/               # Mobile Bridge implementation
│   ├── components/           # React Native components
│   ├── screens/              # Native screens
│   ├── services/             # Business logic services
│   ├── storage/              # Data persistence
│   ├── store/                # State management
│   ├── network/              # Network utilities
│   ├── sync/                 # Sync manager
│   └── utils/                # Helper utilities
├── android/                  # Android native code
├── ios/                      # iOS native code
└── docs/                     # Additional documentation
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# API Configuration
API_URL=https://api.example.com
API_TIMEOUT=30000

# WebView URL
WEBVIEW_URL=http://localhost:5173

# Auth Configuration
JWT_SECRET=your-secret-key
TOKEN_EXPIRATION=3600
REFRESH_TOKEN_EXPIRATION=604800

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_BIOMETRIC_AUTH=true
```

### URLs da WebView

Por padrão, o template carrega a WebView de:
- **Android Emulador**: `http://10.0.2.2:5173`
- **iOS Simulator**: `http://localhost:5173`
- **Dispositivos Físicos**: Use o IP da sua máquina

Edite em `src/components/TurboWebView.tsx`:
```typescript
const WEBVIEW_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:5173'
    : 'http://localhost:5173'
  : 'https://your-production-url.com';
```

## 🎨 Customização

### Tema de Cores

Edite as cores em `src/components/TabBar.tsx` ou nas screens:

```typescript
const COLORS = {
  primary: '#E03131',      // Vermelho principal
  primaryDark: '#C92A2A',  // Vermelho escuro
  primaryLight: '#FFF5F5', // Vermelho claro
  white: '#FFFFFF',
  background: '#F8F9FA',
  text: '#212529',
  textSecondary: '#868E96',
  border: '#DEE2E6',
};
```

### Adicionando Novos Handlers

```typescript
// 1. Registre o handler no Mobile Bridge
MobileBridge.registerHandler('myCustomAction', async (payload) => {
  // Sua lógica aqui
  return { success: true };
});

// 2. Use no código web
await window.WebBridge.sendToNative('myCustomAction', { data: 'value' });
```

## 🐛 Troubleshooting

### Problema: WebView não carrega

**Solução:**
1. Verifique se o servidor web está rodando
2. Confirme a URL correta no TurboWebView.tsx
3. Para Android, verifique `network_security_config.xml`

### Problema: Bridge não funciona

**Solução:**
1. Verifique se `window.WebBridge` está disponível
2. Confirme que o handler está registrado
3. Veja os logs com `npm run android:logs` ou `npm run ios:logs`

### Problema: Token expirado

**Solução:**
O AuthService faz logout automático quando o token expira. Para ajustar o tempo:
```typescript
// src/services/AuthService.ts
const tokens: AuthTokens = {
  accessToken,
  refreshToken,
  expiresAt: Date.now() + 3600 * 1000, // 1 hora
};
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.


## 🗺️ Roadmap

- [x] Mobile Bridge básico
- [x] Autenticação JWT
- [x] Gerenciamento de carrinho
- [x] Telas nativas separadas
- [ ] Refresh automático de tokens
- [ ] Deep Links
- [ ] Firebase Analytics
- [ ] Code Push (OTA updates)
- [ ] Testes E2E com Detox
- [ ] CI/CD Pipeline
- [ ] Documentação de API completa

---