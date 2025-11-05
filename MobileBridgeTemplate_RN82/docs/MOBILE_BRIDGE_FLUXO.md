# Mobile Bridge - Fluxo de Comunicação React Native ↔ WebView

## 🎯 Resposta Direta

**SIM**, a comunicação entre React Native e WebView **USA a arquitetura Mobile Bridge**, mas o fluxo que acabamos de corrigir (verificação de token na navegação) **NÃO envolve Mobile Bridge diretamente**.

Vamos entender a diferença:

---

## 📊 Dois Fluxos Diferentes

### 1️⃣ Fluxo de Navegação (O que corrigimos) - **SEM Mobile Bridge**

Este é um fluxo **100% React Native**, sem comunicação com a WebView:

```
┌─────────────────────────────────────────────────────────┐
│          REACT NATIVE (App.TestHost.tsx)                │
│                                                          │
│  Usuário clica "Abrir WebView"                         │
│         ↓                                               │
│  handleNavigateToScreen('webview')                     │
│         ↓                                               │
│  AuthService.isAuthenticated() ← Verifica token        │
│         ↓                                               │
│  Token válido?                                          │
│    ├─ Sim → setCurrentScreen('webview')               │
│    └─ Não → Logout + Tela de Login                    │
│                                                          │
│  ⚠️ NENHUMA comunicação com WebView ainda!             │
└─────────────────────────────────────────────────────────┘
```

**Tecnologias envolvidas:**
- React Native State Management (`useState`)
- AuthService (validação de JWT)
- Renderização condicional React

**Mobile Bridge usado?** ❌ **NÃO**

---

### 2️⃣ Fluxo Mobile Bridge (Comunicação RN ↔ WebView) - **COM Mobile Bridge**

Este fluxo acontece **DEPOIS** que a WebView já foi aberta:

```
┌────────────────────────────────────────────────────────────────┐
│                 REACT NATIVE ↔ WEBVIEW                         │
│                                                                 │
│  ┌─────────────────────┐         ┌────────────────────┐       │
│  │   React Native      │         │      WebView       │       │
│  │  (App.Embedded)     │         │   (shopapp-web)    │       │
│  └─────────────────────┘         └────────────────────┘       │
│            │                              │                    │
│            │ ◄──── Mobile Bridge ────►    │                    │
│            │                              │                    │
│  ┌─────────▼──────────┐         ┌────────▼─────────┐          │
│  │ MobileBridge.ts    │         │ JavaScript       │          │
│  │ - registerHandler  │         │ - postMessage    │          │
│  │ - sendMessage      │         │ - onMessage      │          │
│  └────────────────────┘         └──────────────────┘          │
│                                                                 │
│  Exemplos de comunicação:                                      │
│  • WebView → RN: addToCart(product)                           │
│  • RN → WebView: cartUpdated(cart)                            │
│  • WebView → RN: getDeviceInfo()                              │
│  • RN → WebView: navigate(url)                                │
└────────────────────────────────────────────────────────────────┘
```

**Tecnologias envolvidas:**
- `MobileBridge.ts` (camada de abstração)
- `window.ReactNativeWebView.postMessage()` (WebView → RN)
- `webViewRef.injectJavaScript()` (RN → WebView)
- Event handlers registrados

**Mobile Bridge usado?** ✅ **SIM**

---

## 🔄 Fluxo Completo: Do Login até a Comunicação Bridge

Vamos ver o fluxo COMPLETO quando funciona corretamente:

### Fase 1: Navegação (SEM Mobile Bridge)

```typescript
// App.TestHost.tsx - linha 116
const handleNavigateToScreen = async (screen: Screen) => {
  // ⚠️ FASE 1: Verificação ANTES de abrir WebView
  const isStillAuthenticated = AuthService.isAuthenticated();

  if (!isStillAuthenticated) {
    // Token expirado - BLOQUEIA navegação
    await AuthService.logout();
    setIsAuthenticated(false);
    return; // ❌ PARA AQUI - não chega na WebView
  }

  // ✅ Token válido - permite navegação
  setCurrentScreen('webview'); // Renderiza <EmbeddedWebApp />
};
```

**Neste ponto:**
- ❌ Mobile Bridge NÃO foi usado
- ✅ Apenas validação de token React Native
- ✅ Se token válido → renderiza WebView
- ❌ Se token inválido → bloqueia

---

### Fase 2: Renderização da WebView (COM Mobile Bridge)

```typescript
// App.TestHost.tsx - linha 424
<View style={[styles.webviewContainer, currentScreen !== 'webview' && styles.hidden]}>
  <EmbeddedWebApp /> {/* ← Aqui o Mobile Bridge entra em ação! */}
</View>
```

Quando `currentScreen === 'webview'`, o componente `EmbeddedWebApp` é exibido.

---

### Fase 3: Inicialização do Mobile Bridge

```typescript
// App.Embedded.tsx - linha 30
useEffect(() => {
  // ⚠️ FASE 2: Mobile Bridge sendo configurado

  // Registrar handlers (RN escuta WebView)
  bridge.registerHandler('addToCart', async (payload) => {
    await cartManager.addItem(payload.product);
    return { success: true };
  });

  bridge.registerHandler('getDeviceInfo', async () => {
    return {
      platform: Platform.OS,
      version: DeviceInfo.getVersion()
    };
  });

  // ... outros handlers
}, []);
```

**Neste ponto:**
- ✅ Mobile Bridge está ATIVO
- ✅ Handlers registrados
- ✅ Pronto para receber mensagens da WebView

---

### Fase 4: Comunicação Bidirecional (Mobile Bridge em Ação)

#### WebView → React Native

```javascript
// shopapp-web (WebView)
function addToCart(product) {
  // Enviar mensagem via Mobile Bridge
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'addToCart',
    payload: { product, quantity: 1 }
  }));
}
```

```typescript
// React Native (MobileBridge.ts)
// Recebe mensagem e chama handler registrado
bridge.registerHandler('addToCart', async (payload) => {
  await CartManager.addItem(payload.product);
  return { success: true };
});
```

#### React Native → WebView

```typescript
// React Native
if (webViewRef.current) {
  const script = `
    window.onCartUpdated({ items: 5, total: 299.99 });
  `;
  webViewRef.current.injectJavaScript(script);
}
```

```javascript
// WebView
window.onCartUpdated = (cart) => {
  console.log('Cart atualizado do RN:', cart);
  updateUIWithCart(cart);
};
```

---

## 📋 Resumo: O Que Cada Parte Faz

### ❌ SEM Mobile Bridge (O que corrigimos)

| Componente | Responsabilidade | Mobile Bridge? |
|------------|------------------|----------------|
| `handleNavigateToScreen()` | Verificar token antes de navegar | ❌ NÃO |
| `AuthService.isAuthenticated()` | Validar JWT token | ❌ NÃO |
| `setCurrentScreen('webview')` | Mudar estado do React | ❌ NÃO |
| Renderização condicional | Mostrar/esconder WebView | ❌ NÃO |

### ✅ COM Mobile Bridge (Comunicação RN ↔ WebView)

| Componente | Responsabilidade | Mobile Bridge? |
|------------|------------------|----------------|
| `MobileBridge.ts` | Camada de abstração de comunicação | ✅ SIM |
| `registerHandler()` | Registrar funções que WebView pode chamar | ✅ SIM |
| `sendMessage()` | Enviar mensagens para WebView | ✅ SIM |
| `postMessage()` | WebView enviar para RN | ✅ SIM |
| `injectJavaScript()` | RN enviar para WebView | ✅ SIM |

---

## 🎭 Analogia para Entender

Pense assim:

### 🚪 Verificação de Token (SEM Bridge)
```
Você quer entrar numa sala (WebView).
Antes de abrir a porta, o segurança (handleNavigateToScreen)
verifica seu crachá (token).

- Crachá válido? ✅ Porta abre → Você entra
- Crachá expirado? ❌ Porta não abre → Vai renovar crachá (login)

⚠️ O segurança NÃO usa telefone, walkie-talkie, ou qualquer
comunicação. Ele só VERIFICA e PERMITE/BLOQUEIA entrada.
```

### 📞 Mobile Bridge (COM Bridge)
```
Agora você JÁ ESTÁ dentro da sala (WebView aberta).
Você usa um telefone (Mobile Bridge) para falar com
pessoas do lado de fora (React Native).

Você: "Adiciona produto ao carrinho" → Telefone → RN: "Ok, adicionado!"
RN: "Carrinho tem 3 itens agora" → Telefone → Você: "Atualizar UI!"

⚠️ Isso SÓ funciona se você JÁ ENTROU na sala.
```

---

## 🔍 Verificando Mobile Bridge no Código

### Onde Mobile Bridge É USADO ✅

```typescript
// App.Embedded.tsx
bridge.registerHandler('addToCart', ...)        // ✅ USA Bridge
bridge.registerHandler('getDeviceInfo', ...)    // ✅ USA Bridge
webViewRef.current.injectJavaScript(...)        // ✅ USA Bridge
```

```javascript
// shopapp-web (WebView)
window.ReactNativeWebView.postMessage(...)      // ✅ USA Bridge
window.onCartUpdated = (cart) => { ... }        // ✅ USA Bridge
```

### Onde Mobile Bridge NÃO É USADO ❌

```typescript
// App.TestHost.tsx
const handleNavigateToScreen = async (screen) => {
  const isAuth = AuthService.isAuthenticated(); // ❌ NÃO USA Bridge
  setCurrentScreen(screen);                     // ❌ NÃO USA Bridge
};

const handleLogout = async () => {
  await AuthService.logout();                   // ❌ NÃO USA Bridge
  setIsAuthenticated(false);                    // ❌ NÃO USA Bridge
};
```

---

## ✅ Conclusão

### O que acabamos de corrigir:

**Fluxo:** Verificação de token ao TENTAR abrir a WebView
**Tecnologia:** React Native State + AuthService (JWT)
**Mobile Bridge usado?** ❌ **NÃO**

**Por quê?** Porque estamos verificando permissão ANTES de abrir a WebView. Neste ponto, a WebView nem foi renderizada ainda, então não há comunicação possível.

---

### Mobile Bridge é usado quando:

**Fluxo:** WebView JÁ está aberta e precisa comunicar com React Native
**Tecnologia:** MobileBridge.ts + postMessage + injectJavaScript
**Mobile Bridge usado?** ✅ **SIM**

**Exemplos:**
- WebView chama: `addToCart(product)` → RN adiciona ao carrinho
- RN notifica: `cartUpdated(5 items)` → WebView atualiza badge
- WebView pede: `getDeviceInfo()` → RN retorna informações do device

---

## 🎯 Resposta Final

**Pergunta:** "Essa comunicação entre React Native e WebView está usando Mobile Bridge nesse fluxo que acabou de alterar?"

**Resposta:**

**NÃO** diretamente. O fluxo de verificação de token que corrigimos é **ANTERIOR** à comunicação com a WebView.

Ele funciona assim:

1. **Verificação de Token** (❌ SEM Bridge) → Decide SE abre WebView
2. **Se token válido** → Renderiza WebView
3. **WebView carrega** → Mobile Bridge inicializa (✅ COM Bridge)
4. **Comunicação ativa** → RN ↔ WebView usando Bridge (✅ COM Bridge)

O Mobile Bridge só entra em ação **DEPOIS** que você passa pela verificação de token e a WebView é renderizada.

---

**Analogia final:**
- **Segurança na porta** (verificação token) = SEM Bridge
- **Telefone dentro da sala** (comunicação RN ↔ WebView) = COM Bridge

Você corrigiu o **segurança** para verificar crachá antes de abrir a porta.
O **telefone** continua funcionando igual, mas só é usado DEPOIS de entrar na sala.
