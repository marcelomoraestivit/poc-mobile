# 🖼️ Modo Embedded (Tela Cheia)

> Guia completo para usar o MobileBridge em modo embedded/fullscreen

## 📋 Índice

- [O que é o Modo Embedded?](#o-que-é-o-modo-embedded)
- [Quando Usar?](#quando-usar)
- [Diferenças entre Modos](#diferenças-entre-modos)
- [Como Alternar](#como-alternar)
- [Integração](#integração)
- [Personalização](#personalização)

---

## 🎯 O que é o Modo Embedded?

O **Modo Embedded** é uma versão do app que exibe apenas a WebView em tela cheia, sem TabBar ou elementos de navegação nativos. É ideal para quando o MobileBridge será incorporado em outra aplicação ou quando toda a navegação é controlada pelo conteúdo web.

### Características do Modo Embedded

- ✅ WebView em tela cheia (fullscreen)
- ✅ Sem TabBar ou navegação nativa
- ✅ Mantém toda funcionalidade do Mobile Bridge
- ✅ Mantém notificações Toast
- ✅ Mantém indicador de status de rede
- ✅ Mesma API de comunicação Native ↔ Web

---

## 🤔 Quando Usar?

### Use Modo Embedded quando:

✅ **Integração em outro app**
- Seu app será incorporado como uma feature dentro de outro aplicativo
- Você quer que o app nativo seja apenas um container

✅ **Navegação totalmente web**
- Toda navegação e UI é controlada pelo site/webapp
- Não há necessidade de elementos nativos de navegação

✅ **White-label apps**
- Precisa de máxima flexibilidade para personalização
- O conteúdo web define toda a experiência

### Use Modo Full (com TabBar) quando:

✅ **Navegação híbrida**
- Mistura de navegação nativa e web
- Precisa de abas rápidas para diferentes seções

✅ **App standalone**
- O app tem múltiplas funcionalidades nativas
- TabBar melhora a experiência do usuário

---

## 🔄 Diferenças entre Modos

### Modo Full (Padrão)

```
┌─────────────────────┐
│   Status Bar        │
├─────────────────────┤
│                     │
│   WebView Content   │
│                     │
├─────────────────────┤
│  🏠  🛒  ❤️  👤    │ ← TabBar
└─────────────────────┘
```

**Arquivo:** `App.tsx`

**Características:**
- WebView + TabBar de navegação
- Múltiplas abas (Home, Cart, Wishlist, Profile)
- Navegação nativa entre seções
- Indicadores de quantidade (badge no carrinho)

### Modo Embedded

```
┌─────────────────────┐
│   Status Bar        │
├─────────────────────┤
│                     │
│                     │
│   WebView Content   │
│   (Fullscreen)      │
│                     │
│                     │
└─────────────────────┘
```

**Arquivo:** `App.Embedded.tsx`

**Características:**
- WebView em tela cheia
- Sem TabBar
- Toda navegação pelo web
- Mais espaço para conteúdo

---

## 🔍 Como Saber Qual Modo Está Ativo Agora?

Abra o arquivo `index.js` na raiz do projeto:

```bash
cat index.js | grep "import App"
```

**Se aparecer:**
- `import App from './App';` → Modo FULL (com TabBar) ✅
- `import App from './App.Embedded';` → Modo EMBEDDED (fullscreen) ✅

**Por padrão**, o template vem em **MODO FULL**.

Quando você executa `npm run android` ou `npm run ios`, o app que abre é o que estiver configurado no `index.js`.


## ⚙️ Como Alternar

### Método 1: NPM Scripts (Recomendado)

```bash
# Alternar para modo FULL (com TabBar)
npm run mode:full

# Alternar para modo EMBEDDED (fullscreen)
npm run mode:embedded
```

Após executar o comando:
1. O script modifica automaticamente `index.js`
2. Recarregue o app:
   - **Android**: Pressione `R` + `R` no app
   - **iOS**: `Cmd` + `R` no app
   - Ou reinicie: `npm run android` / `npm run ios`

### Método 2: Manual

Edite o arquivo `index.js` na raiz do projeto:

**Para modo FULL:**
```javascript
import App from './App';
```

**Para modo EMBEDDED:**
```javascript
import App from './App.Embedded';
```

### Verificar Modo Atual

Olhe o arquivo `index.js`:
- Se importa `./App` → Modo Full
- Se importa `./App.Embedded` → Modo Embedded

---

## 🔗 Integração

### Cenário: Incorporar em outro App React Native

Se você está incorporando este app dentro de outro aplicativo maior:

#### 1. Modo Embedded é Ideal

```bash
npm run mode:embedded
```

#### 2. Customize a URL

Edite `App.Embedded.tsx` (linha 183):

```typescript
// Configure your web app URL here
const webAppUrl = 'https://sua-aplicacao.com';
```

#### 3. Importe como Componente

No seu app principal:

```typescript
import EmbeddedWebApp from './MobileBridgeApp/App.Embedded';

function MainApp() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Outras telas do seu app */}
        <Stack.Screen
          name="WebFeature"
          component={EmbeddedWebApp}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Cenário: App Standalone Embedded

Se este é o app principal mas sem TabBar:

#### 1. Use Modo Embedded

```bash
npm run mode:embedded
```

#### 2. Configure a URL

`App.Embedded.tsx` (linha 183):

```typescript
const webAppUrl = 'https://sua-loja.com';
```

#### 3. Customize StatusBar (Opcional)

`App.Embedded.tsx` (linha 188):

```typescript
<StatusBar
  barStyle="light-content"  // ou "dark-content"
  backgroundColor="#000000"  // Cor de fundo
/>
```

---

## 🎨 Personalização

### Remover Network Indicator

Se não quiser o indicador de status de rede:

`App.Embedded.tsx` - Remover/comentar linhas 191-191:

```typescript
// {/* Optional: Network Status Indicator */}
// <NetworkStatusIndicator onStatusChange={handleNetworkChange} />
```

### Customizar Toast Notifications

Edite a duração ou estilo dos toasts:

`App.Embedded.tsx` (linha 203-209):

```typescript
{toast && (
  <Toast
    message={toast.message}
    title={toast.title}
    type={toast.type}
    duration={5000}  // ← Mudar duração (ms)
    onDismiss={() => setToast(null)}
  />
)}
```

### Adicionar Splash Screen

Se quiser tela de loading enquanto WebView carrega:

```typescript
const [isLoading, setIsLoading] = useState(true);

// No TurboWebView:
<TurboWebView
  ref={webViewRef}
  source={{ uri: webAppUrl }}
  onLoad={() => {
    setIsLoading(false);
    console.log('WebView loaded:', webAppUrl);
  }}
  // ...
/>

{/* Loading overlay */}
{isLoading && (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
)}
```

### Configurar Deep Links

Para abrir URLs específicas no embedded app:

`App.Embedded.tsx` - Adicionar useEffect:

```typescript
useEffect(() => {
  const handleDeepLink = (url: string) => {
    if (webViewRef.current) {
      const script = `window.location.href = '${url}';`;
      webViewRef.current.injectJavaScript(script);
    }
  };

  // Setup deep link listener
  Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url);
  });

  // Check initial URL
  Linking.getInitialURL().then(url => {
    if (url) handleDeepLink(url);
  });
}, []);
```

---

## 📱 Mobile Bridge no Modo Embedded

### Funcionalidades Disponíveis

Todos os handlers do Mobile Bridge funcionam normalmente:

```javascript
// Do lado web, você pode usar:
window.MobileBridge.call('navigate', { url: '/produtos' });
window.MobileBridge.call('addToCart', { product, quantity });
window.MobileBridge.call('showNotification', {
  title: 'Sucesso!',
  message: 'Produto adicionado'
});
window.MobileBridge.call('getCart');
window.MobileBridge.call('getWishlist');
// etc...
```

### Exemplo: Navegação Web no Modo Embedded

Como não há TabBar, toda navegação acontece no web:

```javascript
// No seu webapp (React, Vue, etc):

// Navegação para diferentes páginas
function navigateToCart() {
  window.MobileBridge.call('navigate', {
    url: '/cart'
  });
}

function navigateToWishlist() {
  window.MobileBridge.call('navigate', {
    url: '/wishlist'
  });
}

// Renderizar seu próprio menu/navbar
<nav>
  <button onClick={() => navigateToCart()}>
    Carrinho ({cartCount})
  </button>
  <button onClick={() => navigateToWishlist()}>
    Favoritos
  </button>
</nav>
```

---

## 🔧 Troubleshooting

### Problema: Mudei para embedded mas TabBar ainda aparece

**Solução:**
1. Verifique se `index.js` importa `./App.Embedded`
2. Recarregue o app completamente: `R` + `R` ou reinicie
3. Se persistir, limpe cache: `npm run clean && npm start -- --reset-cache`

### Problema: WebView não carrega em fullscreen

**Solução:**
Verifique se os estilos estão corretos em `App.Embedded.tsx`:

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,  // ← Deve ser 1
    backgroundColor: '#ffffff',
  },
});
```

### Problema: Toast não aparece sobre a WebView

**Solução:**
O Toast deve estar dentro do mesmo container que a WebView. Verifique a estrutura:

```typescript
<View style={styles.container}>
  <NetworkStatusIndicator />
  <TurboWebView />
  {toast && <Toast />}  {/* ← Deve estar aqui */}
</View>
```

---

## 📚 Recursos Relacionados

- [README.md](../README.md) - Documentação principal
- [QUICKSTART.md](./QUICKSTART.md) - Início rápido
- [MOBILE_BRIDGE_API.md](../MOBILE_BRIDGE_API.md) - API completa do Bridge
- [App.Embedded.tsx](../App.Embedded.tsx) - Código fonte do modo embedded
- [App.tsx](../App.tsx) - Código fonte do modo full

---

## ✅ Checklist: Configurar Modo Embedded

- [ ] Executar `npm run mode:embedded`
- [ ] Configurar `webAppUrl` em `App.Embedded.tsx`
- [ ] Testar navegação no webapp
- [ ] Testar Mobile Bridge handlers
- [ ] Customizar StatusBar (cor, estilo)
- [ ] Decidir se mantém NetworkStatusIndicator
- [ ] Configurar deep links (se necessário)
- [ ] Testar em dispositivo físico
- [ ] Build de produção: `npm run build:release`

---

## 🚀 Próximos Passos

1. ✅ Escolha o modo adequado para seu caso de uso
2. ✅ Configure a URL do webapp
3. ✅ Personalize conforme necessário
4. ✅ Teste todas as funcionalidades do Mobile Bridge
5. ✅ Prepare para deploy!

**Dúvidas?** Consulte a [documentação completa](../README.md) ou o [guia de troubleshooting](./TROUBLESHOOTING.md).
