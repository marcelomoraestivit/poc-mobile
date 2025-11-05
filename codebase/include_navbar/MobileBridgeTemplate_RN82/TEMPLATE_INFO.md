# 📦 MobileBridge Template - Informações

> Este é um template profissional de React Native pronto para desenvolvimento

## 🎯 O que este template oferece

### ✅ Estrutura Completa
- Arquitetura bem definida e organizada
- TypeScript configurado
- ESLint + Prettier
- Testes com Jest
- Scripts úteis no package.json

### ✅ Componentes Prontos
- **TabBar** - Navegação por abas funcional
- **TurboWebView** - WebView com bridge nativo-web
- **Toast** - Sistema de notificações
- **ErrorBoundary** - Tratamento de erros
- **NetworkStatusIndicator** - Indicador de conexão

### ✅ Sistema Completo
- **Mobile Bridge** - Comunicação bidirecional Native ↔ Web
- **Gerenciamento de Estado** - Cart + Wishlist + Sync
- **Storage** - Offline + Secure Storage
- **Serviços** - Auth, Analytics, Notifications, Push
- **Network Manager** - Gerenciamento de conexão

### ✅ Documentação
- README completo
- Guia de início rápido
- Troubleshooting detalhado
- Checklist de setup
- Exemplos de código

## 🚀 Como usar este template

### 1. Início Rápido (5 minutos)

```bash
# 1. Navegue até o template
cd MobileBridgeTemplate_RN82

# 2. Instale dependências
npm install

# 3. Execute
npm start          # Terminal 1 - Metro
npm run android    # Terminal 2 - App
```

### 2. Personalização Básica

**Nome do App:**
- [ ] `app.json` → alterar `name` e `displayName`
- [ ] `android/app/src/main/res/values/strings.xml`
- [ ] `ios/MobileBridgeApp/Info.plist`

**URL da WebView:**
- [ ] `App.tsx` (linha 395) → alterar `webAppUrl`

**TabBar:**
- [ ] `src/components/TabBar.tsx` → personalizar abas

### 3. Configuração Avançada

Siga o checklist completo: [`docs/PROJECT_SETUP.md`](./docs/PROJECT_SETUP.md)

## 📁 Estrutura do Template

```
MobileBridgeTemplate_RN82/
├── docs/                      # 📚 Documentação
│   ├── QUICKSTART.md          # Guia de início rápido
│   ├── TROUBLESHOOTING.md     # Solução de problemas
│   └── PROJECT_SETUP.md       # Checklist completo
├── src/                       # 📱 Código fonte
│   ├── bridge/                # Mobile Bridge
│   ├── components/            # Componentes UI
│   ├── services/              # Serviços (Auth, Analytics, etc)
│   ├── store/                 # Estado (Cart, Wishlist)
│   ├── storage/               # Storage (Offline, Secure)
│   ├── network/               # Network Manager
│   └── sync/                  # Sync Manager
├── android/                   # 🤖 Projeto Android
├── ios/                       # 🍎 Projeto iOS
├── .env.example               # Template de variáveis de ambiente
└── README.md                  # Documentação principal
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm start              # Metro Bundler
npm run android        # Executar Android
npm run ios            # Executar iOS

# Build
npm run build:android  # Build APK debug
npm run build:release  # Build APK release
npm run clean          # Limpar caches

# Qualidade
npm run lint           # Verificar código
npm run lint:fix       # Corrigir automaticamente
npm run typecheck      # Verificar tipos
npm test               # Executar testes
npm run test:coverage  # Cobertura de testes

# Utilitários
npm run reset          # Reset completo
npm run doctor         # Diagnóstico
```

## 📚 Documentação Disponível

| Documento | Descrição |
|-----------|-----------|
| [README.md](./README.md) | Documentação principal |
| [QUICKSTART.md](./docs/QUICKSTART.md) | Como começar rapidamente |
| [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | Solução de problemas |
| [PROJECT_SETUP.md](./docs/PROJECT_SETUP.md) | Checklist de setup completo |

## 🎨 Personalização

### Componentes Customizáveis

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| TabBar | `src/components/TabBar.tsx` | Navegação por abas |
| WebView | `src/components/TurboWebView.tsx` | WebView + Bridge |
| Toast | `src/components/Toast.tsx` | Notificações |

### Serviços Configuráveis

| Serviço | Arquivo | Descrição |
|---------|---------|-----------|
| Auth | `src/services/AuthService.ts` | Autenticação |
| Analytics | `src/services/AnalyticsService.ts` | Tracking |
| Notifications | `src/services/NotificationService.ts` | Notificações locais |
| Push | `src/services/PushNotificationService.ts` | Push notifications |

## 🔧 Requisitos

### Obrigatório
- Node.js >= 20
- JDK 17 ou 21
- Android Studio (para Android)
- Xcode (para iOS - apenas Mac)

### Verificar Ambiente

```bash
npm run doctor
```

## 🐛 Problemas Comuns

### Erro: "MobileBridgeApp has not been registered"
**Solução:** Verifique se `app.json` tem `"name": "MobileBridgeApp"`

### Gradle Timeout
**Solução:** Aumente o timeout em `android/gradle/wrapper/gradle-wrapper.properties`

### Metro não conecta
**Solução:** Execute `adb reverse tcp:8081 tcp:8081` (Android)

Mais soluções: [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

## 📖 Recursos de Aprendizado

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev/)

## 🤝 Contribuindo

1. Faça suas modificações
2. Teste completamente
3. Atualize a documentação
4. Commit com mensagens claras

## 📝 Licença

Este é um template de projeto. Use livremente!

## 📧 Suporte

- Documentação completa em `docs/`
- Issues no repositório do projeto
- Email de suporte (configure aqui)

---

## ⚡ Próximos Passos

1. ✅ [Leia o QUICKSTART.md](./docs/QUICKSTART.md)
2. ✅ [Siga o PROJECT_SETUP.md](./docs/PROJECT_SETUP.md)
3. ✅ Personalize o template para seu projeto
4. ✅ Comece a desenvolver!

**Bom desenvolvimento! 🚀**
