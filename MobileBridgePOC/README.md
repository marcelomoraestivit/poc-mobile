# Mobile Bridge E-Commerce POC

> Aplicação E-Commerce híbrida usando Mobile Bridge Pattern - React Web App + React Native Container

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Mobile Bridge API](#mobile-bridge-api)
- [Funcionalidades](#funcionalidades)
- [Screenshots](#screenshots)

## 🎯 Visão Geral

Este projeto é uma Prova de Conceito (POC) de um aplicativo E-Commerce que utiliza o padrão **Mobile Bridge**, onde:

- 🌐 **Interface Web**: Aplicação React completa rodando em um WebView
- 📱 **Container Nativo**: React Native fornecendo recursos nativos
- 🌉 **Bridge Bidirecional**: Comunicação JavaScript ↔ Native via Mobile Bridge

### Por que Mobile Bridge?

✅ **Desenvolvimento Ágil** - Uma única codebase web para web e mobile
✅ **Recursos Nativos** - Acesso a funcionalidades nativas quando necessário
✅ **Performance** - WebView otimizado com cache e recursos offline
✅ **Manutenção** - Atualizações instantâneas sem precisar publicar na loja
✅ **UX Nativa** - Notificações, gestos e componentes nativos onde fazem sentido

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                  React Native App                    │
│  ┌───────────────────────────────────────────────┐  │
│  │              Native Components                 │  │
│  │  • TabBar        • NetworkIndicator           │  │
│  │  • Toast         • Native Notifications       │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │              Mobile Bridge                     │  │
│  │    ┌─────────────────────────────────┐        │  │
│  │    │   Bidirectional Communication   │        │  │
│  │    │   Web ←──────────────────→ Native│       │  │
│  │    └─────────────────────────────────┘        │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │           TurboWebView (Enhanced)             │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │        React Web Application            │ │  │
│  │  │  • HomePage    • ProductPage            │ │  │
│  │  │  • CartPage    • CheckoutPage           │ │  │
│  │  │  • Wishlist    • Search                 │ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │           Native Services                      │  │
│  │  • CartManager      • WishlistManager         │  │
│  │  • NetworkManager   • OfflineStorage          │  │
│  │  • SyncManager      • NotificationService     │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Fluxo de Comunicação

```javascript
// Web → Native (chamada)
window.WebBridge.sendToNative('addToCart', {
  product,
  quantity,
  color,
  size
})

// Native processa e responde
CartManager.addItem(product, quantity, color, size)

// Native → Web (notificação)
webView.injectJavaScript(`
  window.WebBridge.emit('cartUpdated', {
    items,
    count,
    total
  })
`)
```

## 🛠️ Tecnologias

### Web App (shopapp-web/)

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool ultrarrápido
- **React Router** - Navegação SPA
- **Mantine UI** - Biblioteca de componentes
- **Tabler Icons** - Ícones modernos

### Native App (MobileBridgeApp/)

- **React Native 0.82** - Framework mobile
- **TypeScript** - Tipagem estática
- **React Native WebView** - Container web
- **AsyncStorage** - Persistência local
- **NetInfo** - Status de rede
- **URL Polyfill** - Suporte a URLs

## 📁 Estrutura do Projeto

```
MobileBridgePOC/
├── shopapp-web/                    # Aplicação Web React
│   ├── src/
│   │   ├── components/            # Componentes React
│   │   ├── pages/                 # Páginas da aplicação
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProductPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── WishlistPage.tsx
│   │   │   └── SearchPage.tsx
│   │   ├── context/              # Context API
│   │   │   └── ShopContext.tsx   # Estado global do e-commerce
│   │   ├── data/                 # Dados mockados
│   │   │   └── mockData.ts       # Produtos, categorias, banners
│   │   ├── utils/                # Utilitários
│   │   │   ├── notifications.ts  # Sistema de notificações
│   │   │   └── placeholderImages.ts # Imagens SVG
│   │   ├── types/                # TypeScript types
│   │   ├── App.tsx               # Componente raiz
│   │   └── main.tsx              # Entry point
│   ├── package.json
│   └── vite.config.ts
│
└── MobileBridgeApp/               # Aplicação React Native
    ├── src/
    │   ├── bridge/               # Mobile Bridge
    │   │   └── MobileBridge.ts   # Core do bridge
    │   ├── components/           # Componentes nativos
    │   │   ├── TurboWebView.tsx  # WebView enhanced
    │   │   ├── TabBar.tsx        # Barra de navegação
    │   │   ├── Toast.tsx         # Notificações nativas
    │   │   └── NetworkStatusIndicator.tsx
    │   ├── store/                # Gerenciamento de estado
    │   │   ├── CartManager.ts    # Carrinho de compras
    │   │   └── WishlistManager.ts # Lista de desejos
    │   ├── services/             # Serviços
    │   │   └── NotificationService.ts
    │   ├── network/              # Rede
    │   │   └── NetworkManager.ts
    │   ├── storage/              # Armazenamento
    │   │   └── OfflineStorage.ts
    │   └── sync/                 # Sincronização
    │       └── SyncManager.ts
    ├── android/                  # Projeto Android
    ├── ios/                      # Projeto iOS
    ├── App.tsx                   # Componente raiz
    └── package.json
```

## 🚀 Instalação

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS)

### Passo 1: Clonar o Repositório

```bash
git clone <repository-url>
cd MobileBridgePOC
```

### Passo 2: Instalar Web App

```bash
cd shopapp-web
npm install
```

### Passo 3: Instalar Native App

```bash
cd ../MobileBridgeApp
npm install
```

### Passo 4: Configurar Android (opcional)

```bash
cd android
./gradlew clean
cd ..
```

## 💻 Como Usar

### Iniciando o Web Server

```bash
cd shopapp-web
npm run dev
```

O servidor web iniciará em `http://localhost:5174`

### Rodando o App React Native

#### Android

```bash
cd MobileBridgeApp
npm run android
```

#### iOS

```bash
cd MobileBridgeApp
npm run ios
```

### Configuração de URL

O app nativo está configurado para acessar:
- **Emulador Android**: `http://10.0.2.2:5174`
- **Dispositivo Físico**: Use o IP da sua máquina (ex: `http://192.168.1.25:5174`)

Edite `MobileBridgeApp/App.tsx` linha 395 para alterar a URL:

```typescript
const webAppUrl = 'http://10.0.2.2:5174'; // Altere aqui
```

## 🌉 Mobile Bridge API

### Handlers Disponíveis

#### Navegação

```typescript
// Navegar para uma página
window.WebBridge.sendToNative('navigate', {
  page: 'product',
  params: { id: 'prod1' }
})
```

#### Carrinho

```typescript
// Adicionar ao carrinho
window.WebBridge.sendToNative('addToCart', {
  product: Product,
  quantity: number,
  selectedColor?: string,
  selectedSize?: string
})

// Obter carrinho
const cart = await window.WebBridge.sendToNative('getCart', {})
// Returns: { items, count, total, subtotal, discount }

// Atualizar quantidade
window.WebBridge.sendToNative('updateCartQuantity', {
  productId: string,
  quantity: number,
  selectedColor?: string,
  selectedSize?: string
})

// Remover do carrinho
window.WebBridge.sendToNative('removeFromCart', {
  productId: string,
  selectedColor?: string,
  selectedSize?: string
})

// Limpar carrinho
window.WebBridge.sendToNative('clearCart', {})

// Aplicar cupom
window.WebBridge.sendToNative('applyCoupon', {
  code: string
})
// Returns: { success, discount?, message }
```

#### Lista de Desejos

```typescript
// Toggle wishlist
window.WebBridge.sendToNative('toggleWishlist', {
  product: Product
})
// Returns: { inWishlist: boolean }

// Obter wishlist
const wishlist = await window.WebBridge.sendToNative('getWishlist', {})
// Returns: { items, count }

// Verificar se está na wishlist
const result = await window.WebBridge.sendToNative('isInWishlist', {
  productId: string
})
// Returns: { inWishlist: boolean }
```

#### Pedidos

```typescript
// Criar pedido
const order = await window.WebBridge.sendToNative('createOrder', {
  address: AddressData,
  payment: PaymentData
})
// Returns: { success, orderId }
```

#### Notificações

```typescript
// Mostrar notificação nativa
window.WebBridge.sendToNative('showNotification', {
  title: string,
  message: string,
  color: 'green' | 'red' | 'blue' | 'yellow'
})
```

#### Utilitários

```typescript
// Obter informações do dispositivo
const device = await window.WebBridge.sendToNative('getDeviceInfo', {})
// Returns: { platform, version, isTablet }

// Status de rede
const status = await window.WebBridge.sendToNative('getNetworkStatus', {})
// Returns: { isOnline, timestamp }

// Armazenamento
window.WebBridge.sendToNative('setStorageItem', { key, value })
const data = await window.WebBridge.sendToNative('getStorageItem', { key })
```

### Eventos Web → Native

A aplicação web pode ouvir eventos nativos:

```typescript
// Carrinho atualizado
window.addEventListener('cartUpdated', (event) => {
  const { items, count, total } = event.detail
})

// Wishlist atualizada
window.addEventListener('wishlistUpdated', (event) => {
  const { items, count } = event.detail
})

// Status de rede mudou
window.addEventListener('networkStatusChanged', (event) => {
  const { isOnline } = event.detail
})
```

## ✨ Funcionalidades

### E-Commerce Completo

- ✅ **Catálogo de Produtos** - Grid responsivo com 12 produtos
- ✅ **Detalhes do Produto** - Galeria, variações (cor/tamanho), avaliações
- ✅ **Carrinho de Compras** - Adicionar, remover, atualizar quantidades
- ✅ **Lista de Desejos** - Favoritar produtos
- ✅ **Busca** - Pesquisar produtos por nome/categoria
- ✅ **Checkout** - Fluxo completo: Endereço → Pagamento → Revisão
- ✅ **Cupons de Desconto** - Sistema de cupons
- ✅ **Categorias** - Filtrar por categoria

### Recursos Nativos

- 📱 **Tab Bar Nativa** - Navegação inferior nativa
- 🔔 **Notificações Nativas** - Toast animado com cores
- 🌐 **Indicador de Rede** - Status online/offline
- 💾 **Armazenamento Offline** - Carrinho e wishlist persistentes
- 🔄 **Sincronização** - Sync automático quando online
- 🎨 **Imagens Otimizadas** - SVG placeholders para performance

### Recursos Offline

- 💾 **Cache de Dados** - Produtos, carrinho, wishlist
- 📊 **Ações Pendentes** - Fila de ações offline
- 🔄 **Auto-sync** - Sincroniza quando reconectar
- 📴 **Modo Offline** - Aplicação funcional sem internet

## 📸 Screenshots

### Web App

- **Home Page**: Catálogo de produtos com banners
- **Product Page**: Detalhes com seletor de cor/tamanho
- **Cart Page**: Carrinho com cupons e frete
- **Checkout**: Fluxo de 3 etapas
- **Wishlist**: Lista de favoritos

### Native App

- **Toast Nativo**: Notificações animadas
- **Tab Bar**: Navegação nativa
- **Network Indicator**: Banner de status

## 🎨 Temas e Customização

### Cores do Tema

```typescript
// Gradientes dos placeholders
const gradients = [
  { start: '#667eea', end: '#764ba2' }, // Roxo
  { start: '#f093fb', end: '#f5576c' }, // Rosa
  { start: '#4facfe', end: '#00f2fe' }, // Azul
  { start: '#43e97b', end: '#38f9d7' }, // Verde
]
```

### Toast Nativo

```typescript
// Cores disponíveis
success: '#10b981'  // Verde
error: '#ef4444'    // Vermelho
info: '#3b82f6'     // Azul
warning: '#f59e0b'  // Amarelo
```

## 🧪 Testes

### Testar Mobile Bridge

1. Abrir DevTools no Chrome
2. Inspecionar WebView: `chrome://inspect`
3. Console do navegador → Ver logs do bridge

### Testar Notificações

```javascript
// No console do WebView
window.WebBridge.sendToNative('showNotification', {
  title: 'Teste',
  message: 'Notificação funcionando!',
  color: 'green'
})
```

## 🔧 Troubleshooting

### Imagens não carregam

- ✅ Verificar configuração de rede (`network_security_config.xml`)
- ✅ Confirmar URL do servidor web
- ✅ Verificar se o servidor está rodando

### Bridge não funciona

- ✅ Verificar se `window.WebBridge` está disponível
- ✅ Ver logs no console nativo e web
- ✅ Confirmar que `injectedJavaScript` está sendo executado

### App não conecta ao servidor

- ✅ Emulador: usar `10.0.2.2` ao invés de `localhost`
- ✅ Dispositivo físico: usar IP da máquina
- ✅ Verificar firewall e porta aberta (5174)

## 📝 Licença

Este é um projeto de Prova de Conceito (POC) para fins educacionais.

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ usando React + React Native**
