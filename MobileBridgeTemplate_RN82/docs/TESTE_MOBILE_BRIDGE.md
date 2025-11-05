# 🧪 Testes Mobile Bridge - Validação das Correções

**Objetivo:** Validar que todas as correções implementadas no Mobile Bridge funcionam corretamente.

---

## 📋 Pré-requisitos

1. **Aplicação Web rodando:**
   ```bash
   cd ../MobileBridgePOC/shopapp-web
   npm run dev
   ```
   Deve estar rodando em `http://localhost:5174` (ou `http://10.0.2.2:5174` para Android)

2. **Metro Bundler rodando:**
   ```bash
   npm start
   ```

3. **App React Native rodando:**
   ```bash
   # Android
   npm run android

   # iOS
   npm run ios
   ```

4. **Ferramentas de debug:**
   - Logcat (Android): `adb logcat | grep -i "Bridge\|WebView\|ShopApp"`
   - Console do Metro para logs do React Native
   - Browser DevTools para WebView (Chrome://inspect)

---

## ✅ Teste 1: WebView → Native (Notificação de Carrinho)

**Objetivo:** Validar que o WebView usa `WebBridge.sendToNative()` corretamente quando o carrinho é atualizado.

### Passos:

1. Abra o app React Native
2. Faça login (usuario@teste.com / senha123)
3. Navegue para a tela "WebView"
4. Aguarde o WebView carregar a loja
5. Adicione um produto ao carrinho clicando em "Adicionar ao Carrinho"

### Logs Esperados:

**No WebView (Chrome://inspect):**
```
ShopApp: Cart changed, count: 1, items: 1
ShopApp: Notifying native via WebBridge: { count: 1, items: 1, total: 299.99 }
ShopApp: Native notified successfully!
```

**No React Native (Metro/Logcat):**
```
[TurboWebView] Cart updated from web: { count: 1, items: 1, total: 299.99 }
```

### ✅ Validação:

- [ ] WebView log mostra "Notifying native via **WebBridge**" (não "ReactNativeWebView")
- [ ] React Native recebe a mensagem no handler 'cartUpdated'
- [ ] Nenhum erro de "No handler registered"
- [ ] Promise resolve com sucesso no WebView

### ❌ Se Falhar:

Se você ver:
```
ShopApp: WebBridge not available, running in browser
```

**Problema:** O `window.WebBridge` não foi injetado corretamente.

**Solução:**
1. Verifique se TurboWebView.tsx tem o `injectedJavaScript` correto
2. Force reload do WebView (sacuda o device → Reload)

---

## ✅ Teste 2: Native → WebView (Atualização de Carrinho após addToCart)

**Objetivo:** Validar que o React Native usa `bridge.sendToWeb()` para notificar o WebView após adicionar item.

### Passos:

**NOTA:** Este teste só funciona se você tiver um handler 'addToCart' sendo chamado pelo WebView. Como o WebView gerencia o próprio carrinho, este teste é mais conceitual. Vamos simular:

1. Abra App.Embedded.tsx
2. Localize o handler 'addToCart'
3. Verifique que ele usa `bridge.sendToWeb(webViewRef, 'cartUpdated', cart)`

### Logs Esperados:

**No React Native (ao adicionar item):**
```
[Bridge] Sending message to web: cartUpdated
```

**No WebView:**
```
[Bridge] Received message from native: cartUpdated
```

### ✅ Validação:

- [ ] Código usa `bridge.sendToWeb()` em vez de `injectJavaScript()` direto
- [ ] Código usa `BridgeSecurity.sanitizeForInjection()`
- [ ] Timeout de 30s é configurado
- [ ] Promise é resolvida quando WebView responde

---

## ✅ Teste 3: Mudança de Status de Rede

**Objetivo:** Validar que mudanças no status da rede são notificadas corretamente ao WebView.

### Passos:

1. Abra o app React Native
2. Faça login e navegue para WebView
3. **Simule offline:**
   - Android: Ative modo avião ou desative WiFi/dados móveis
   - iOS: Ative modo avião
4. Aguarde 2 segundos
5. **Simule online:**
   - Desative modo avião

### Logs Esperados:

**No React Native:**
```
[App.Embedded] Network status changed: false (offline)
[Bridge] Sending message to web: networkChange { isOnline: false }

[App.Embedded] Network status changed: true (online)
[Bridge] Sending message to web: networkChange { isOnline: true }
```

**No WebView:**
```
[WebView] Network status: offline
[WebView] Network status: online
```

### ✅ Validação:

- [ ] Usa `bridge.sendToWeb()` em vez de `injectJavaScript()` direto
- [ ] WebView recebe notificação quando fica offline
- [ ] WebView recebe notificação quando volta online
- [ ] Indicador de rede aparece/desaparece corretamente

---

## ✅ Teste 4: Sem Handlers Duplicados

**Objetivo:** Validar que não há conflitos de handlers duplicados.

### Passos:

1. Procure por logs de handlers sendo registrados ao iniciar o app:

```
[Bridge] Registering handler: addToCart
[Bridge] Registering handler: getDeviceInfo
[Bridge] Registering handler: cartUpdated
[Bridge] Registering handler: turbo.visit
```

### ✅ Validação:

- [ ] Handler `getDeviceInfo` é registrado **apenas 1 vez**
- [ ] Handler `navigate` **NÃO existe** (foi removido)
- [ ] Handler `turbo.visit` existe (substituiu 'navigate')
- [ ] Nenhuma mensagem de "Handler already registered, overwriting"

### ❌ Se Falhar:

Se você ver handlers duplicados, significa que há múltiplos `registerHandler()` para o mesmo tipo.

---

## ✅ Teste 5: Tipagem TypeScript

**Objetivo:** Validar que não há erros de tipo no código.

### Passos:

1. Execute o TypeScript compiler:
   ```bash
   npx tsc --noEmit
   ```

### ✅ Validação:

- [ ] **Zero erros** de TypeScript
- [ ] `webViewRef` é do tipo `WebView` (não `any`)
- [ ] Nenhum erro de "Property does not exist"

---

## ✅ Teste 6: Resposta de Mensagens

**Objetivo:** Validar que mensagens do WebView recebem resposta corretamente.

### Passos:

1. No WebView, abra o console (Chrome://inspect)
2. Execute este código JavaScript:

```javascript
// Teste 1: Enviar mensagem e aguardar resposta
window.WebBridge.sendToNative('getDeviceInfo')
  .then(response => {
    console.log('✅ Received response:', response);
    // Deve mostrar: { platform: 'react-native', isOnline: true, timestamp: ... }
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });

// Teste 2: Enviar cartUpdated e aguardar confirmação
window.WebBridge.sendToNative('cartUpdated', { count: 5, items: 3, total: 500 })
  .then(response => {
    console.log('✅ Cart update confirmed:', response);
    // Deve mostrar: { success: true, received: true }
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });
```

### Logs Esperados:

**No Console do WebView:**
```
✅ Received response: { platform: "react-native", isOnline: true, timestamp: "2025-11-04T..." }
✅ Cart update confirmed: { success: true, received: true }
```

### ✅ Validação:

- [ ] Ambas as Promises resolvem (não rejeitam)
- [ ] Resposta é recebida em menos de 1 segundo
- [ ] Dados retornados estão corretos
- [ ] Nenhum timeout de 30s

### ❌ Se Falhar:

Se Promise rejeita com "Message timeout":
- Handler não está registrado corretamente
- TurboWebView não está enviando resposta de volta

---

## ✅ Teste 7: Segurança - Rate Limiting

**Objetivo:** Validar que rate limiting está funcionando.

### Passos:

1. No console do WebView, execute:

```javascript
// Enviar 100 mensagens rapidamente
for (let i = 0; i < 100; i++) {
  window.WebBridge.sendToNative('getDeviceInfo')
    .then(r => console.log(`Message ${i}: success`))
    .catch(e => console.error(`Message ${i}: ${e.message}`));
}
```

### Logs Esperados:

**No React Native (após algumas mensagens):**
```
[Bridge] Rate limit exceeded for: getDeviceInfo
```

**No WebView:**
```
Message 0: success
Message 1: success
...
Message 50: Rate limit exceeded
Message 51: Rate limit exceeded
```

### ✅ Validação:

- [ ] Primeiras mensagens são processadas normalmente
- [ ] Após limite, mensagens são rejeitadas com "Rate limit exceeded"
- [ ] App não trava ou congela

---

## ✅ Teste 8: Segurança - XSS Sanitização

**Objetivo:** Validar que conteúdo malicioso é sanitizado.

### Passos:

1. Tente enviar payload com caracteres especiais:

```javascript
window.WebBridge.sendToNative('cartUpdated', {
  count: 1,
  productName: '</script><script>alert("XSS")</script>',
  description: '"; DROP TABLE products; --'
})
.then(r => console.log('Sanitized response:', r))
.catch(e => console.error('Error:', e));
```

### ✅ Validação:

- [ ] Mensagem é processada sem executar código malicioso
- [ ] Nenhum alert aparece
- [ ] Caracteres especiais são escapados corretamente
- [ ] App não trava

---

## ✅ Teste 9: Timeout de Mensagens

**Objetivo:** Validar que mensagens sem resposta causam timeout.

### Passos:

1. Registre um handler que nunca responde:

**No App.Embedded.tsx (temporário para teste):**
```typescript
bridge.registerHandler('testTimeout', async (payload) => {
  console.log('[Test] Received message, but will never respond');
  // Não retorna nada - simula handler travado
  await new Promise(() => {}); // Never resolves
});
```

2. No WebView, envie mensagem:

```javascript
window.WebBridge.sendToNative('testTimeout', { test: true })
  .then(r => console.log('Response:', r))
  .catch(e => console.error('Error:', e.message));
```

### Logs Esperados:

**Após 30 segundos:**
```
Error: Message timeout
```

### ✅ Validação:

- [ ] Promise rejeita após 30 segundos
- [ ] Mensagem de erro é "Message timeout"
- [ ] Callback é removido dos pendingCallbacks
- [ ] Não há memory leak

**IMPORTANTE:** Remova o handler de teste após validar!

---

## 📊 Checklist Final

### Correções Implementadas

- [ ] ✅ **Teste 1 passou** - WebView usa `WebBridge.sendToNative()`
- [ ] ✅ **Teste 2 passou** - Native usa `bridge.sendToWeb()`
- [ ] ✅ **Teste 3 passou** - Network change notifica corretamente
- [ ] ✅ **Teste 4 passou** - Sem handlers duplicados
- [ ] ✅ **Teste 5 passou** - Zero erros TypeScript
- [ ] ✅ **Teste 6 passou** - Mensagens recebem resposta
- [ ] ✅ **Teste 7 passou** - Rate limiting funciona
- [ ] ✅ **Teste 8 passou** - XSS sanitização funciona
- [ ] ✅ **Teste 9 passou** - Timeout funciona

### Funcionalidade Geral

- [ ] WebView carrega corretamente
- [ ] Login funciona
- [ ] Navegação entre telas funciona
- [ ] Adicionar produto ao carrinho funciona
- [ ] Toast aparece ao adicionar produto
- [ ] Indicador de rede aparece/desaparece
- [ ] Sem crashes ou erros no console
- [ ] Performance está boa (sem lag)

---

## 🐛 Troubleshooting

### Problema: "WebBridge not available"

**Causa:** `injectedJavaScript` não foi executado ou falhou.

**Solução:**
1. Verifique se `javaScriptEnabled={true}` está em TurboWebView
2. Force reload: Sacuda device → Reload
3. Verifique logs: `[TurboWebView] Error in injected script`

### Problema: "No handler registered"

**Causa:** Handler não foi registrado ou foi sobrescrito.

**Solução:**
1. Verifique se `registerHandler()` está sendo chamado no useEffect
2. Verifique se não há múltiplos registros para o mesmo tipo
3. Adicione log: `console.log('Handlers:', Array.from(bridge.handlers.keys()))`

### Problema: Promise nunca resolve

**Causa:** Resposta não está sendo enviada de volta ao WebView.

**Solução:**
1. Verifique se TurboWebView envia resposta:
   ```typescript
   webViewRef.current?.injectJavaScript(script);
   ```
2. Verifique se `window.WebBridge.handleNativeResponse` existe
3. Verifique logs no WebView console

### Problema: Rate limit muito agressivo

**Causa:** Configuração de rate limit muito baixa.

**Solução:**
1. Ajuste em `BridgeSecurity.ts`:
   ```typescript
   const MAX_REQUESTS_PER_SECOND = 10; // Aumente este valor
   ```

---

## ✅ Resultado Esperado

Após todos os testes passarem, você deve ter:

- ✅ Comunicação bidirecional funcionando perfeitamente
- ✅ Segurança implementada (validação, rate limit, sanitização)
- ✅ Zero erros TypeScript
- ✅ Zero handlers duplicados
- ✅ Uso consistente da API Mobile Bridge
- ✅ **Código pronto para produção**

---

## 📝 Relatório de Testes

Após executar todos os testes, preencha:

**Data:** ____________________

**Testes Executados:** ____ / 9

**Testes Passaram:** ____ / 9

**Testes Falharam:** ____

**Problemas Encontrados:**
-
-

**Ações Corretivas:**
-
-

**Status Final:** ⬜ Aprovado  ⬜ Reprovado  ⬜ Com Restrições

**Assinatura:** ____________________
