# 🧪 Como Testar o Modo Embedded

> Guia rápido de 3 minutos para testar a integração do WebView embedded

## ⚡ Teste Rápido (3 passos)

### 1. Ative o Modo Test Host
```bash
npm run mode:testhost
```

### 2. Recarregue o App
- Pressione `R` + `R` no app
- Ou execute: `npm run android`

### 3. Explore!
- Navegue entre as abas no bottom navigation
- Clique na aba 🌐 (WebView)
- Veja o WebView ocupar a tela toda
- Use o botão "← Voltar" para retornar

---

## 🎯 O que você verá

### Telas Nativas (🏠 👤 ⚙️)
```
┌─────────────────────────┐
│   App Host Demo         │  ← Header
├─────────────────────────┤
│                         │
│   Conteúdo Nativo      │
│                         │
├─────────────────────────┤
│  🏠  👤  🌐  ⚙️       │  ← Bottom Nav
└─────────────────────────┘
```

### WebView Embedded (🌐)
```
┌─────────────────────────┐
│ ← Voltar                │  ← Botão Voltar
│                         │
│                         │
│   WebView Fullscreen   │
│                         │
│                         │
└─────────────────────────┘
```

**Observe:**
- Header some quando WebView ativo
- Bottom Nav some quando WebView ativo
- WebView ocupa TODA a tela
- Botão "Voltar" aparece

---

## 🔄 Outros Modos

### Modo FULL (com TabBar nativo)
```bash
npm run mode:full
```
App completo com TabBar de navegação nativa.

### Modo EMBEDDED (só WebView)
```bash
npm run mode:embedded
```
Apenas o WebView fullscreen, sem nenhuma navegação nativa.

---

## 📖 Documentação Completa

- [TESTHOST_MODE.md](./docs/TESTHOST_MODE.md) - Guia completo do modo test
- [EMBEDDED_MODE.md](./docs/EMBEDDED_MODE.md) - Guia do modo embedded
- [README.md](./README.md) - Documentação principal

---

## 💡 Próximos Passos

Depois de testar:

1. **Veja o código:** Abra `App.TestHost.tsx` para ver como funciona
2. **Adapte:** Use como base para seu próprio app
3. **Customize:** Modifique cores, telas e navegação
4. **Implemente:** Integre no seu projeto seguindo o exemplo

---

## 🚀 Pronto para Produção?

Quando estiver pronto para usar em produção:

```typescript
// Seu app
import EmbeddedWebApp from './path/to/App.Embedded';

function MyApp() {
  return (
    <MyNavigation>
      {/* Suas telas */}
      <Screen name="Store" component={EmbeddedWebApp} />
    </MyNavigation>
  );
}
```

É só isso! ✨
