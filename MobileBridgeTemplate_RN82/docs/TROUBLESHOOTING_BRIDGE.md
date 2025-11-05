# 🔧 Troubleshooting - Mobile Bridge

> Guia de resolução de problemas do Mobile Bridge

## 🐛 Erros Comuns

### ❌ Erro: "Invalid message: Missing required fields (id, type)"

**Sintoma:**
```
MobileBridge.ts:56 [Bridge] Invalid message: Missing required fields (id, type)
```

**Causa:**
O WebView está enviando mensagens que não seguem o formato esperado pelo Mobile Bridge. Isso pode acontecer por:

1. **Mensagens de debug do browser:** Chrome DevTools ou outras ferramentas podem enviar mensagens
2. **postMessage sem formato correto:** Código JavaScript enviando mensagens sem estrutura adequada
3. **Bibliotecas third-party:** Algumas libs enviam mensagens via postMessage

**Solução:**
✅ **Já corrigido no template!** O código agora:
- Valida mensagens antes de processar
- Ignora silenciosamente mensagens mal formatadas
- Usa `console.warn` em vez de `console.error` para não poluir logs

**Se ainda aparecer:**
```javascript
// No seu código web, certifique-se de usar o formato correto:
window.ReactNativeWebView.postMessage(JSON.stringify({
  id: 'unique_id_123',      // ← Obrigatório
  type: 'myAction',         // ← Obrigatório
  payload: { /* dados */ }  // ← Opcional
}));
```

---

### ❌ Erro: "Handler not found for message type"

**Sintoma:**
```
[Bridge] Handler not found for message type: myCustomAction
```

**Causa:**
Você está tentando enviar uma mensagem do web para o nativo, mas não registrou um handler no React Native.

**Solução:**
Registre o handler no `App.tsx` ou `App.Embedded.tsx`:

```typescript
// No useEffect do App.tsx
bridge.registerHandler('myCustomAction', async (payload) => {
  console.log('Received:', payload);
  // Seu código aqui
  return { success: true, data: 'resultado' };
});
```

---

### ❌ Erro: "Rate limit exceeded"

**Sintoma:**
```
[Bridge] Rate limit exceeded for: myAction
```

**Causa:**
Você está enviando muitas mensagens muito rápido (mais de 100 por segundo por tipo).

**Solução:**
- **Debounce:** Use debounce para ações frequentes
- **Throttle:** Limite a frequência de envio
- **Batch:** Agrupe múltiplas ações em uma mensagem

```javascript
// Exemplo com debounce
import { debounce } from 'lodash';

const debouncedAction = debounce(() => {
  window.MobileBridge.call('myAction', data);
}, 300);
```

---

### ❌ Erro: "Security validation failed"

**Sintoma:**
```
[Bridge] Invalid message: Security validation failed
```

**Causa:**
A mensagem não passou na validação de segurança (payload muito grande, caracteres inválidos, etc).

**Solução:**
- **Reduza o tamanho:** Payloads grandes (>1MB) são bloqueados
- **Sanitize dados:** Remova caracteres especiais problemáticos
- **Valide antes de enviar:** Teste seus dados localmente

```javascript
// Bom ✅
window.MobileBridge.call('action', {
  name: 'Produto',
  price: 99.90
});

// Ruim ❌ - payload muito grande
window.MobileBridge.call('action', {
  image: 'data:image/png;base64,...5MB de dados...'
});
```

---

## 🔍 Debug do Mobile Bridge

### Ver todas as mensagens

Adicione logs no handler:

```typescript
// TurboWebView.tsx
const handleMessage = async (event: WebViewMessageEvent) => {
  try {
    const data = JSON.parse(event.nativeEvent.data);
    console.log('📩 [WebView → Native]:', data);  // ← Adicione isso

    // ... resto do código
  } catch (error) {
    console.error('❌ [WebView Error]:', error);
  }
};
```

### Ver respostas do nativo

No código web:

```javascript
// No seu webapp
window.MobileBridge.call('action', payload).then(response => {
  console.log('📬 [Native → Web]:', response);
});
```

### Logs Estruturados

Use prefixos para filtrar logs:

```
[Bridge]   - Mobile Bridge (nativo)
[WebView] - WebView messages
[Web]     - Código web
```

Filtre no console:
```
# Ver só bridge
adb logcat | grep "\[Bridge\]"

# Ver só webview
adb logcat | grep "\[WebView\]"
```

---

## 🧪 Testar o Bridge

### Teste Básico

```typescript
// No App.tsx
bridge.registerHandler('test', async (payload) => {
  console.log('[Bridge Test] Received:', payload);
  return { success: true, echo: payload };
});
```

```javascript
// No webapp
window.MobileBridge.call('test', { message: 'Hello!' })
  .then(response => console.log('Response:', response))
  .catch(error => console.error('Error:', error));
```

### Teste de Performance

```javascript
// Teste rate limit
for (let i = 0; i < 200; i++) {
  window.MobileBridge.call('test', { index: i });
}
// Deve bloquear após ~100 mensagens
```

### Teste de Payload Grande

```javascript
// Deve falhar (>1MB)
const bigData = 'x'.repeat(2 * 1024 * 1024);
window.MobileBridge.call('test', { data: bigData });
// Esperado: erro de validação
```

---

## 📊 Monitoring

### Contador de Mensagens

```typescript
let messageCount = 0;
bridge.registerHandler('*', async (payload, type) => {
  messageCount++;
  console.log(`[Bridge] Total messages: ${messageCount}`);
});
```

### Tempo de Resposta

```typescript
bridge.registerHandler('myAction', async (payload) => {
  const start = Date.now();
  // ... processamento
  const duration = Date.now() - start;
  console.log(`[Bridge] Duration: ${duration}ms`);
  return { success: true, duration };
});
```

---

## ⚠️ Avisos de Segurança

### ❌ Nunca faça isso:

```javascript
// Não use eval ❌
eval(payloadFromWeb);

// Não execute código dinâmico ❌
new Function(payloadFromWeb)();

// Não injete HTML diretamente ❌
webViewRef.injectJavaScript(`
  document.body.innerHTML = '${unsafeData}';
`);
```

### ✅ Sempre faça isso:

```javascript
// Sanitize primeiro ✅
const sanitized = BridgeSecurity.sanitizeForInjection(data);

// Valide tipos ✅
if (typeof data.id !== 'string') {
  throw new Error('Invalid id');
}

// Use JSON.stringify ✅
const script = `window.callback(${JSON.stringify(safeData)});`;
```

---

## 🚨 Emergência: Reset do Bridge

Se o bridge parar de funcionar:

```typescript
// 1. Limpe handlers
MobileBridge.clear();

// 2. Re-registre handlers
setupBridgeHandlers();

// 3. Recarregue WebView
webViewRef.current?.reload();
```

---

## 📖 Recursos

- [MOBILE_BRIDGE_API.md](./MOBILE_BRIDGE_API.md) - API completa
- [BridgeSecurity.ts](../src/utils/BridgeSecurity.ts) - Código de segurança
- [TurboWebView.tsx](../src/components/TurboWebView.tsx) - Implementação

---

## 💡 Dicas

1. **Use TypeScript:** Tipos ajudam a evitar erros
2. **Valide sempre:** Nunca confie em dados do web
3. **Log tudo (dev):** Em dev, logue todas as mensagens
4. **Teste offline:** Teste com conexão ruim
5. **Monitor rate limits:** Fique de olho na frequência

---

## ✅ Checklist de Debug

Quando algo der errado:

- [ ] Verificou os logs do Metro Bundler?
- [ ] Verificou o console do Chrome DevTools (remote debug)?
- [ ] A mensagem tem `id` e `type`?
- [ ] O handler está registrado?
- [ ] O payload é válido (tamanho, formato)?
- [ ] Tentou recarregar o WebView?
- [ ] Tentou restart completo do app?
- [ ] Verificou se não está sendo rate limited?
