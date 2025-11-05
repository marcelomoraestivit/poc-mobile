# 💾 Persistência de Estado do WebView

> Como manter o estado do WebView quando navegamos entre telas

## 🐛 Problema

Quando você navega **saindo** do WebView para uma tela nativa e **volta** para o WebView, o estado (carrinho, compras, navegação) era perdido.

### Sintomas:
- ❌ Produtos adicionados ao carrinho desaparecem
- ❌ WebView volta para a página inicial
- ❌ Usuário precisa fazer tudo novamente
- ❌ Péssima experiência do usuário

### Exemplo do Problema:
```
1. Usuário abre WebView 🌐
2. Adiciona produtos ao carrinho 🛒
3. Volta para Home 🏠
4. Abre WebView novamente 🌐
5. ❌ Carrinho está vazio!
```

---

## 🔍 Causa Raiz

O problema acontecia porque o WebView estava sendo **desmontado** quando mudávamos de tela:

### Código Problemático (ANTES):

```typescript
const renderScreen = () => {
  switch (currentScreen) {
    case 'home':
      return <HomeScreen />;
    case 'webview':
      return <EmbeddedWebApp />;  // ← Remontado a cada vez!
  }
};

return <View>{renderScreen()}</View>;
```

**O que acontecia:**
1. Quando `currentScreen = 'home'` → WebView é **desmontado**
2. Quando `currentScreen = 'webview'` → WebView é **remontado do zero**
3. Todo estado (DOM, JavaScript, carrinho) é **perdido**

---

## ✅ Solução

Manter o WebView **sempre montado**, apenas escondendo/mostrando com CSS:

### Código Corrigido (DEPOIS):

```typescript
return (
  <View>
    {/* Telas nativas - esconde quando WebView ativo */}
    {currentScreen !== 'webview' && (
      <View style={styles.content}>
        {renderScreen()}
      </View>
    )}

    {/* WebView - SEMPRE montado, escondido com display:none */}
    <View
      style={[
        styles.webviewContainer,
        currentScreen !== 'webview' && styles.hidden,  // ← Apenas esconde
      ]}
    >
      <EmbeddedWebApp />
    </View>
  </View>
);
```

**Estilos:**
```typescript
webviewContainer: {
  ...StyleSheet.absoluteFillObject,  // Ocupa tela toda
  zIndex: 999,                        // Sobrepõe quando visível
},
hidden: {
  display: 'none',  // Esconde mas mantém montado
},
```

### Como Funciona:

1. **WebView é montado UMA VEZ** quando app inicia
2. Quando navegamos para outra tela:
   - WebView fica com `display: 'none'`
   - Continua montado (mantém estado)
   - Apenas não é visível
3. Quando voltamos para WebView:
   - Remove `display: 'none'`
   - WebView reaparece **com todo o estado intacto**

---

## 📊 Comparação

### ANTES (❌ Remontando)

```
Home → WebView (monta) → Home (desmonta) → WebView (monta novamente)
          ↓                    ↓                    ↓
    Estado inicial       Perde estado        Estado inicial
```

### DEPOIS (✅ Escondendo)

```
Home → WebView (aparece) → Home (esconde) → WebView (aparece)
          ↓                    ↓                    ↓
    Estado inicial       Mantém estado      Mantém estado ✅
```

---

## 🎯 Resultado

### Agora funciona:
- ✅ Produtos no carrinho permanecem
- ✅ Navegação no WebView é mantida
- ✅ Estado do JavaScript é preservado
- ✅ Melhor experiência do usuário

### Teste:
```
1. Abra WebView 🌐
2. Adicione produtos ao carrinho 🛒
3. Volte para Home 🏠
4. Volte para WebView 🌐
5. ✅ Carrinho ainda tem os produtos!
```

---

## 💡 Quando Usar Esta Técnica

### Use quando:
- ✅ Precisa manter estado entre navegações
- ✅ WebView tem formulários complexos
- ✅ Usuário pode voltar frequentemente
- ✅ Carrinho de compras ou sessão

### Não use quando:
- ❌ WebView deve sempre resetar (login, etc)
- ❌ Preocupação com memória (WebView consome RAM)
- ❌ WebView é raramente acessado

---

## 🔄 Alternativas

Se não quiser manter WebView sempre montado, outras opções:

### 1. AsyncStorage / SecureStorage

Salvar estado antes de desmontar:

```typescript
// Antes de desmontar
await AsyncStorage.setItem('cart', JSON.stringify(cart));

// Após remontar
const cart = await AsyncStorage.getItem('cart');
```

**Prós:** Menos memória
**Contras:** Mais código, pode ser lento

### 2. Context / Redux

Gerenciar estado fora do WebView:

```typescript
const [cart, setCart] = useContext(CartContext);
// Sincronizar com WebView via Bridge
```

**Prós:** Controle total
**Contras:** Complexo, duplica lógica

### 3. WebView Cache

Configurar cache do WebView:

```typescript
<WebView
  cacheEnabled={true}
  cacheMode="LOAD_CACHE_ELSE_NETWORK"
/>
```

**Prós:** Fácil
**Contras:** Não garante estado JavaScript

---

## 🚀 Performance

### Impacto de Manter WebView Montado:

**Memória:**
- WebView consome ~50-100MB RAM
- Aceitável para a maioria dos apps
- Monitore em dispositivos low-end

**CPU:**
- WebView escondido consome pouquíssimo CPU
- JavaScript continua rodando (timers, etc)
- Use `onVisibilityChange` se necessário

**Bateria:**
- Impacto mínimo quando escondido
- Pause operações pesadas quando escondido

### Otimizações Opcionais:

```typescript
useEffect(() => {
  if (currentScreen === 'webview') {
    // WebView visível - retomar operações
    webViewRef.current?.injectJavaScript('resumeOperations();');
  } else {
    // WebView escondido - pausar operações pesadas
    webViewRef.current?.injectJavaScript('pauseOperations();');
  }
}, [currentScreen]);
```

---

## 📱 Exemplo Completo

### Implementação no seu app:

```typescript
function MyApp() {
  const [screen, setScreen] = useState('home');

  return (
    <SafeAreaView>
      {/* Telas nativas */}
      {screen !== 'web' && (
        <View style={{ flex: 1 }}>
          <MyScreen />
        </View>
      )}

      {/* WebView sempre montado */}
      <View style={[
        StyleSheet.absoluteFillObject,
        screen !== 'web' && { display: 'none' }
      ]}>
        <WebView source={{ uri: 'https://...' }} />
      </View>

      {/* Navegação */}
      <TabBar onSelect={setScreen} />
    </SafeAreaView>
  );
}
```

---

## 🐛 Troubleshooting

### WebView não esconde corretamente

**Solução:** Use `display: 'none'` em vez de `opacity: 0`:

```typescript
// ❌ Não use opacity (WebView ainda visível para toque)
hidden: { opacity: 0 }

// ✅ Use display (WebView realmente escondido)
hidden: { display: 'none' }
```

### WebView aparece "por cima" de tudo

**Solução:** Ajuste zIndex:

```typescript
webviewContainer: {
  ...StyleSheet.absoluteFillObject,
  zIndex: 999,  // Alto quando deve sobrepor
}

// Ou ajuste quando escondido:
hidden: {
  display: 'none',
  zIndex: -1,  // Garante que fica abaixo
}
```

### Memória aumentando muito

**Solução:** Libere WebView quando não usado há muito tempo:

```typescript
const [lastWebViewUse, setLastWebViewUse] = useState(Date.now());

useEffect(() => {
  const interval = setInterval(() => {
    if (Date.now() - lastWebViewUse > 300000) {  // 5 minutos
      // Recarregar WebView para liberar memória
      webViewRef.current?.reload();
    }
  }, 60000);

  return () => clearInterval(interval);
}, [lastWebViewUse]);
```

---

## 📖 Recursos

- [App.TestHost.tsx](../App.TestHost.tsx) - Implementação completa
- [React Native Docs - View](https://reactnative.dev/docs/view)
- [WebView Docs](https://github.com/react-native-webview/react-native-webview)

---

## ✅ Checklist

Ao implementar persistência de estado:

- [ ] WebView está sempre montado (não dentro de conditional)
- [ ] Usa `display: 'none'` para esconder
- [ ] zIndex configurado corretamente
- [ ] Testado navegação entre telas
- [ ] Testado com carrinho/estado
- [ ] Monitorado uso de memória
- [ ] Documentado comportamento

---

## 🎉 Conclusão

A técnica de **manter WebView montado** é simples e eficaz para preservar estado entre navegações. É especialmente útil para:

- 🛒 E-commerce (carrinho)
- 📝 Formulários complexos
- 🎮 Apps interativos
- 📱 Navegação frequente

**Trade-off:** Um pouco mais de memória por muito melhor UX! 🚀
