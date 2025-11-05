# 🚀 Guia de Início Rápido - React Native 0.82.1

## ✅ Pré-requisitos

### Obrigatórios
- **Node.js** >= 20 (recomendado: 20.x LTS)
- **React Native CLI**
- **JDK 17 ou 21**

### Para Android
- Android Studio
- Android SDK 34
- Gradle 8.8

### Para iOS (apenas Mac)
- Xcode 15+
- CocoaPods

## 📦 Instalação

### 1. Instalar dependências

```bash
cd C:\POC\MobileBridgeTemplate_RN82
npm install
```

**Tempo estimado:** 2-5 minutos

### 2. Configurar Android

```bash
cd android
.\gradlew clean
cd ..
```

### 3. Executar no Android

#### Iniciar Metro Bundler
```bash
npm start
```

#### Em outro terminal, executar app
```bash
npm run android
```

### 4. Executar no iOS (apenas Mac)

```bash
cd ios
pod install
cd ..
npm run ios
```

## 🎯 Características do Template

### 1. TabBar Funcional
O app já vem com um TabBar completo em `src/components/TabBar.tsx`:
- 4 abas: Home, Search, Wishlist, Cart
- Badge de contagem no Cart
- Animações suaves
- Totalmente personalizável

### 2. Mobile Bridge
Sistema de comunicação entre código nativo e WebView:
- Navegação
- Cart management
- Wishlist management
- Analytics tracking
- Push notifications

### 3. Serviços Completos
- **AuthService**: Autenticação de usuários
- **AnalyticsService**: Tracking de eventos
- **NotificationService**: Notificações in-app
- **PushNotificationService**: Push notifications
- **ErrorLogger**: Log de erros

### 4. Gerenciamento de Estado
- **CartManager**: Carrinho de compras
- **WishlistManager**: Lista de desejos
- **SyncManager**: Sincronização de dados

### 5. Storage
- **OfflineStorage**: Cache local
- **SecureStorage**: Armazenamento seguro

## 🔧 Personalização

### Modificar TabBar

Edite `src/components/TabBar.tsx`:

```typescript
const tabs: TabItem[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'search', label: 'Search', icon: '🔍' },
  { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
  { id: 'cart', label: 'Cart', icon: '🛒', badge: cartItemCount },
];
```

### Modificar Cores

Edite `src/components/TabBar.tsx`:

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a', // Mude aqui
    // ...
  },
});
```

### Adicionar Nova Aba

1. Adicione o item no array `tabs`
2. Implemente o handler no `App.tsx`
3. Configure a navegação

## 🧪 Executar Testes

```bash
npm test
```

## 🛠️ Scripts Disponíveis

- `npm start` - Inicia Metro Bundler
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm test` - Executa testes
- `npm run lint` - Verifica código

## 📱 Estrutura do App

```
App (App.tsx)
├── SafeAreaProvider
│   ├── NetworkStatusIndicator
│   ├── TurboWebView (WebView principal)
│   ├── TabBar (navegação)
│   └── Toast (notificações)
```

## 🎨 Componentes Principais

### TurboWebView
WebView otimizado com cache e performance melhorada.

**Localização:** `src/components/TurboWebView.tsx`

### TabBar
Sistema de navegação por abas.

**Localização:** `src/components/TabBar.tsx`

### Mobile Bridge
Comunicação nativo-web.

**Localização:** `src/bridge/MobileBridge.ts`

## 🔍 Debug

### Ver logs do Metro Bundler
```bash
npm start
```

### Ver logs do dispositivo Android
```bash
adb logcat *:S ReactNative:V ReactNativeJS:V
```

### Ver logs do iOS
No Xcode: Window > Devices and Simulators > Open Console

## ⚡ Performance

### Build de Produção Android
```bash
cd android
.\gradlew assembleRelease
```

O APK estará em: `android/app/build/outputs/apk/release/`

### Build de Produção iOS
No Xcode:
1. Product > Scheme > Edit Scheme
2. Run > Build Configuration > Release
3. Product > Archive

## 🐛 Troubleshooting

### Metro Bundler não inicia
```bash
npm start -- --reset-cache
```

### Erro de build no Android
```bash
cd android
.\gradlew clean
.\gradlew --stop
cd ..
npm run android
```

### Erro de pods no iOS
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### App não atualiza
```bash
# Limpar cache
npm start -- --reset-cache

# Rebuild
npm run android
```

## 📚 Recursos

- [React Native 0.82 Docs](https://reactnative.dev/)
- [React 19 Docs](https://react.dev/)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)

## 💡 Dicas

1. **Primeira build demora**: 10-15 minutos é normal
2. **Use Fast Refresh**: Economiza tempo durante desenvolvimento
3. **Metro Bundler**: Mantenha sempre rodando
4. **Logs**: Sempre verifique os logs para debug

## ✨ Próximos Passos

1. Personalize o TabBar
2. Configure seu backend
3. Adicione suas telas/páginas web
4. Implemente seus handlers no Mobile Bridge
5. Configure analytics e push notifications

---

**Pronto!** Seu app React Native 0.82.1 está configurado e funcionando! 🎉
