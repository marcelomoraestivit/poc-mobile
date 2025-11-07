# Guia de Integração Rápida

Este guia mostra como integrar o Mobile Bridge Skeleton em um projeto React Native existente em 5 passos simples.

## 📋 Pré-requisitos

- Projeto React Native 0.70+ existente
- Node.js 20+
- npm ou yarn

## 🚀 Integração em 5 Passos

### Passo 1: Copiar Arquivos

Copie a pasta `src/` completa para o seu projeto:

```bash
cp -r MobileBridge-Skeleton/src/* seu-projeto/src/
```

Estrutura que será copiada:
```
seu-projeto/src/
├── bridge/
│   └── MobileBridge.ts
├── utils/
│   └── BridgeSecurity.ts
├── storage/
│   ├── OfflineStorage.ts
│   └── SecureStorage.ts
├── network/
│   └── NetworkManager.ts
├── sync/
│   └── SyncManager.ts
└── components/
    ├── TurboWebView.tsx
    ├── NetworkStatusIndicator.tsx
    ├── ErrorBoundary.tsx
    └── Toast.tsx
```

### Passo 2: Instalar Dependências

```bash
# Dependências obrigatórias
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
npm install react-native-webview
npm install react-native-safe-area-context

# Para iOS (macOS apenas)
cd ios && pod install && cd ..
```

### Passo 3: Adicionar no Seu Componente Principal

Adicione este código no seu App.tsx ou tela principal:

```typescript
import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import TurboWebView from './src/components/TurboWebView';
import NetworkStatusIndicator from './src/components/NetworkStatusIndicator';
import MobileBridge from './src/bridge/MobileBridge';
import NetworkManager from './src/network/NetworkManager';
import SyncManager from './src/sync/SyncManager';

function YourScreen() {
  const webViewRef = useRef(null);

  // IMPORTANTE: Inicializar serviços
  useEffect(() => {
    NetworkManager.initialize();
    SyncManager.initialize();

    return () => {
      NetworkManager.cleanup();
      SyncManager.cleanup();
    };
  }, []);

  // IMPORTANTE: Registrar handlers
  useEffect(() => {
    // Handler de exemplo - customize conforme necessário
    MobileBridge.registerHandler('showNotification', async (payload) => {
      const { title, message } = payload;
      // Sua lógica de notificação aqui
      return { success: true };
    });

    // Adicione mais handlers aqui

    return () => {
      MobileBridge.clear();
    };
  }, []);

  // IMPORTANTE: Handler de mensagens do WebView
  const handleMessage = useCallback(async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      const response = await MobileBridge.handleMessage(message);

      // Enviar resposta de volta para o WebView
      if (webViewRef.current) {
        const script = `
          (function() {
            if (window.WebBridge && window.WebBridge.handleNativeResponse) {
              window.WebBridge.handleNativeResponse(${JSON.stringify(response)});
            }
          })();
        `;
        webViewRef.current.injectJavaScript(script);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }, []);

  // Handler de mudança de rede
  const handleNetworkChange = useCallback((connected) => {
    console.log('Network status changed:', connected);
  }, []);

  return (
    <View style={styles.container}>
      <NetworkStatusIndicator onStatusChange={handleNetworkChange} />

      <TurboWebView
        ref={webViewRef}
        source={{ uri: 'https://sua-url-aqui.com' }}
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default YourScreen;
```

### Passo 4: Configurar Lado Web (JavaScript/TypeScript)

No seu aplicativo web, adicione este código para comunicação com o Mobile Bridge:

```javascript
// Criar WebBridge no lado web
window.WebBridge = {
  // Enviar mensagem para o nativo
  send: function(type, payload) {
    return new Promise((resolve, reject) => {
      const messageId = 'web_' + Date.now() + '_' + Math.random();

      const message = {
        id: messageId,
        type: type,
        payload: payload,
        timestamp: Date.now()
      };

      // Armazenar callback
      if (!window.WebBridge._callbacks) {
        window.WebBridge._callbacks = {};
      }
      window.WebBridge._callbacks[messageId] = { resolve, reject };

      // Enviar para React Native
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }

      // Timeout de 30 segundos
      setTimeout(() => {
        if (window.WebBridge._callbacks[messageId]) {
          delete window.WebBridge._callbacks[messageId];
          reject(new Error('Timeout'));
        }
      }, 30000);
    });
  },

  // Receber resposta do nativo
  handleNativeResponse: function(response) {
    if (window.WebBridge._callbacks && window.WebBridge._callbacks[response.id]) {
      const { resolve, reject } = window.WebBridge._callbacks[response.id];
      delete window.WebBridge._callbacks[response.id];

      if (response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response.error));
      }
    }
  }
};

// Exemplo de uso no web
async function notifyUser() {
  try {
    const result = await window.WebBridge.send('showNotification', {
      title: 'Hello',
      message: 'From Web!'
    });
    console.log('Notification sent:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Passo 5: Testar

Execute o app e teste a comunicação:

```bash
# Android
npm run android

# iOS
npm run ios
```

## ✅ Checklist de Integração

- [ ] Arquivos copiados da pasta `src/`
- [ ] Dependências instaladas
- [ ] NetworkManager inicializado
- [ ] SyncManager inicializado
- [ ] Handlers registrados no MobileBridge
- [ ] handleMessage implementado
- [ ] WebBridge configurado no lado web
- [ ] URL do WebView configurada
- [ ] Testado em Android
- [ ] Testado em iOS

## 🎯 Handlers Comuns para Implementar

Aqui estão alguns handlers úteis que você pode querer implementar:

```typescript
// 1. Navegação
MobileBridge.registerHandler('navigate', async (payload) => {
  const { screen, params } = payload;
  // Sua lógica de navegação (React Navigation, etc)
  navigation.navigate(screen, params);
  return { success: true };
});

// 2. Notificações
MobileBridge.registerHandler('showNotification', async (payload) => {
  const { title, message, type } = payload;
  // Mostrar notificação nativa ou toast
  return { success: true };
});

// 3. Armazenamento
MobileBridge.registerHandler('saveData', async (payload) => {
  const { key, value } = payload;
  await OfflineStorage.cacheData(key, value);
  return { success: true };
});

MobileBridge.registerHandler('getData', async (payload) => {
  const { key } = payload;
  const data = await OfflineStorage.getCachedData(key);
  return { success: true, data };
});

// 4. Device Info
MobileBridge.registerHandler('getDeviceInfo', async () => {
  return {
    platform: Platform.OS,
    version: Platform.Version,
    isTablet: DeviceInfo.isTablet(),
  };
});

// 5. Share
MobileBridge.registerHandler('share', async (payload) => {
  const { title, message, url } = payload;
  await Share.share({ title, message, url });
  return { success: true };
});

// 6. Camera/Photos
MobileBridge.registerHandler('pickImage', async () => {
  const result = await ImagePicker.launchImageLibrary({});
  return { success: true, image: result.assets[0] };
});

// 7. Biometrics
MobileBridge.registerHandler('authenticate', async () => {
  const result = await BiometricsAuth.authenticate();
  return { success: result.success };
});
```

## 🔧 Configurações Importantes

### 1. Android Permissions (android/app/src/main/AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### 2. iOS Permissions (ios/YourApp/Info.plist)

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

### 3. Network Security (Android - Desenvolvimento)

Crie `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">10.0.2.2</domain>
    <domain includeSubdomains="true">localhost</domain>
  </domain-config>
</network-security-config>
```

Adicione no AndroidManifest.xml:
```xml
<application
  android:networkSecurityConfig="@xml/network_security_config"
  ...>
```

## 🐛 Troubleshooting

### Problema: WebView não carrega

**Solução**:
1. Verifique se a URL está acessível
2. Verifique permissões de Internet
3. No Android, verifique network_security_config.xml
4. Use IP `10.0.2.2` para localhost no Android Emulator

### Problema: Mensagens não chegam no nativo

**Solução**:
1. Verifique se `window.ReactNativeWebView` existe no web
2. Verifique se `handleMessage` está implementado
3. Verifique se a mensagem está sendo enviada como string JSON
4. Adicione logs no handleMessage para debug

### Problema: Resposta não volta para o web

**Solução**:
1. Verifique se `window.WebBridge.handleNativeResponse` existe
2. Verifique se o messageId está correto
3. Adicione logs no injectJavaScript

### Problema: Erro "Maximum call stack size exceeded"

**Solução**:
1. Não coloque objetos muito grandes no payload
2. Evite referências circulares nos objetos
3. Serialize apenas o necessário

## 📱 Testando Offline First

```typescript
// Simular offline
await NetworkManager.refresh();

// Executar ação offline
await SyncManager.executeWithOffline(
  'saveItem',
  { item: 'test' },
  async (payload) => {
    // Esta função será executada quando voltar online
    return await api.saveItem(payload.item);
  },
  { cacheKey: 'item-test', useCache: true }
);

// Verificar fila de ações pendentes
const pending = await OfflineStorage.getPendingActions();
console.log('Pending actions:', pending.length);

// Forçar sincronização
await SyncManager.syncPendingActions();
```

## 🎓 Próximos Passos

1. Customize os handlers para suas necessidades
2. Implemente autenticação se necessário
3. Configure notificações push
4. Adicione analytics
5. Implemente deep linking
6. Configure CodePush para atualizações OTA

## 📚 Recursos

- [React Native WebView Docs](https://github.com/react-native-webview/react-native-webview)
- [AsyncStorage Guide](https://react-native-async-storage.github.io/async-storage/)
- [NetInfo API](https://github.com/react-native-netinfo/react-native-netinfo)

## 💡 Dicas

1. Sempre teste em dispositivos físicos, não apenas emuladores
2. Use React DevTools para debug
3. Monitore o uso de memória do WebView
4. Implemente error boundaries
5. Configure logging apropriado para produção
6. Faça code splitting no web app para performance
7. Use lazy loading para recursos grandes
8. Implemente retry logic para requisições críticas

## 🔐 Segurança em Produção

Antes de ir para produção:

1. **Configure SECRET_KEY**: Edite `src/utils/BridgeSecurity.ts`
```typescript
private static readonly SECRET_KEY = process.env.BRIDGE_SECRET_KEY;
```

2. **Instale crypto real**:
```bash
npm install crypto-js @types/crypto-js
```

3. **Instale encrypted storage**:
```bash
npm install react-native-encrypted-storage
```

4. **Configure HTTPS**: Remova allowsArbitraryLoads do Info.plist

5. **Revise rate limits**: Ajuste conforme seu caso de uso

6. **Implemente monitoring**: Use Sentry, Firebase, etc
