# 🎨 Testar Dark Mode - Instruções

## ✅ Status Atual

- ✅ Tema Dark Mode criado (`src/theme/darkTheme.ts`)
- ✅ Componentes UI criados (`src/components/DarkUI/`)
- ✅ LoginScreen.Dark.tsx criado
- ✅ App.TestHost.tsx atualizado para usar nova tela
- ✅ npm install concluído
- ✅ Metro bundler iniciando...

---

## 🚀 Executar AGORA

**Em um novo terminal (CMD ou PowerShell):**

```bash
cd C:\github_tivit\poc-mobile\MobileBridgeTemplate_RN82

# Executar no Android
npm run android
```

Ou se já estiver com o app rodando, apenas recarregue:
- Sacuda o device/emulador
- Pressione **R** duas vezes (Reload)

---

## 📱 O Que Você Verá

### Tela de Login (Dark Mode)

```
┌──────────────────────────────────────┐
│  Background Preto Profundo (#0a0a0a)│
│                                      │
│         ┌────────────┐               │
│         │    🛒     │  ← Logo roxo   │
│         │  (roxo)   │                │
│         └────────────┘               │
│      Mobile Bridge                   │
│      ● Sistema Online                │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ [CARD GLASS com blur]          │ │
│  │                                │ │
│  │ Bem-vindo de volta!            │ │
│  │ Entre com suas credenciais...  │ │
│  │                                │ │
│  │ 📧 Email                       │ │
│  │ ╔═══════════════════════════╗  │ │
│  │ ║ input com borda animada   ║  │ │
│  │ ╚═══════════════════════════╝  │ │
│  │                                │ │
│  │ 🔒 Senha               👁️     │ │
│  │ ╔═══════════════════════════╗  │ │
│  │ ║ ••••••••                  ║  │ │
│  │ ╚═══════════════════════════╝  │ │
│  │                                │ │
│  │ ┌───────────────────────────┐  │ │
│  │ │ [BOTÃO ROXO BRILHANTE]    │  │ │
│  │ │       Entrar              │  │ │
│  │ └───────────────────────────┘  │ │
│  │                                │ │
│  │ 💡 Usar credenciais de teste  │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ [CARD com borda roxa]          │ │
│  │ 👤 Credenciais de Teste        │ │
│  │ ┌──────────────────────────┐   │ │
│  │ │📧 usuario@teste.com      │   │ │
│  │ └──────────────────────────┘   │ │
│  │ ┌──────────────────────────┐   │ │
│  │ │🔑 senha123               │   │ │
│  │ └──────────────────────────┘   │ │
│  └────────────────────────────────┘ │
│                                      │
│  Powered by React Native 0.82        │
│  Magic UI + Dark Mode                │
└──────────────────────────────────────┘
```

---

## 🎨 Características do Visual

### Cores
- **Background:** Preto profundo (#0a0a0a)
- **Cards:** Cinza escuro com efeito glass
- **Botões:** Roxo brilhante (#8b5cf6)
- **Texto:** Branco (#ffffff)
- **Bordas:** Cinza (#27272a)
- **Focus:** Roxo (#8b5cf6)
- **Erro:** Vermelho (#ef4444)

### Interações
1. **Inputs:**
   - Borda cinza em estado normal
   - Borda roxa ao focar
   - Borda vermelha quando há erro

2. **Botões:**
   - Efeito de pressão (opacity)
   - Loading spinner integrado
   - Variantes coloridas

3. **Validação:**
   - Email valida formato
   - Senha valida mínimo 6 caracteres
   - Mensagens de erro aparecem em tempo real

---

## 🧪 Testar Funcionalidades

### 1. Preencher Manualmente
Digite:
- Email: `usuario@teste.com`
- Senha: `senha123`
- Clique em **Entrar**

### 2. Usar Botão de Teste
- Clique em **"💡 Usar credenciais de teste"**
- Campos são preenchidos automaticamente
- Clique em **Entrar**

### 3. Testar Validação
- Tente clicar **Entrar** sem preencher
- Digite email inválido (ex: `teste`)
- Digite senha curta (ex: `123`)
- Veja mensagens de erro aparecerem

### 4. Mostrar/Ocultar Senha
- Clique no ícone 👁️ ao lado da senha
- Senha alterna entre visível e oculta

---

## 🔧 Troubleshooting

### Metro não inicia
```bash
# Limpar cache e reiniciar
npm start -- --reset-cache
```

### App não recarrega
```bash
# Forçar rebuild
npm run android
```

### Erro de importação
Verifique que `App.TestHost.tsx` linha 27 está:
```typescript
import LoginScreen from './src/screens/LoginScreen.Dark';
```

### Tela em branco
1. Abra o DevTools (Cmd+D ou Shake device)
2. Selecione "Debug"
3. Veja erros no console do navegador

---

## 📊 Comparação: Antes vs Depois

### ANTES (Tema Vermelho)
```
- Background: Cinza claro (#F8F9FA)
- Primary: Vermelho (#E03131)
- Cards: Branco com sombra
- Texto: Preto
- Visual: Mantine-inspired
```

### DEPOIS (Dark Mode)
```
- Background: Preto profundo (#0a0a0a)
- Primary: Roxo (#8b5cf6)
- Accent: Ciano (#06b6d4)
- Cards: Glass effect com blur
- Texto: Branco
- Visual: Magic UI Dark Mode
```

---

## 📸 Screenshots Esperados

### Login Screen
- ✅ Logo roxo circular no topo
- ✅ Status "Sistema Online" com bolinha verde
- ✅ Card glass semi-transparente
- ✅ Inputs com bordas animadas
- ✅ Botão roxo brilhante
- ✅ Card de credenciais com fundo roxo transparente

### Comportamento
- ✅ Borda do input muda de cor ao focar (cinza → roxo)
- ✅ Validação mostra mensagens em vermelho
- ✅ Botão mostra loading spinner ao processar
- ✅ Toast aparece após login bem-sucedido

---

## 🎯 Próximos Passos

Após testar o Login:

1. **Criar HomeScreen.Dark.tsx**
   - Código exemplo em `DARK_MODE_STYLESHEET_GUIDE.md`
   - Usar componentes DarkCard, DarkButton

2. **Criar ProfileScreen.Dark.tsx**
   - Avatar circular com degradê
   - Estatísticas com cores
   - Informações da conta

3. **Criar SettingsScreen.Dark.tsx**
   - Switches com tema dark
   - Lista de configurações
   - Informações do app

---

## 📚 Documentação

- **DARK_MODE_README.md** - Quick start
- **DARK_MODE_STYLESHEET_GUIDE.md** - Guia completo
- **Este arquivo** - Instruções de teste

---

## ✅ Checklist de Teste

- [ ] Metro iniciou sem erros
- [ ] App rodou no Android
- [ ] Tela de login aparece com tema dark
- [ ] Logo roxo visível
- [ ] Cards com efeito glass
- [ ] Inputs mudam cor ao focar
- [ ] Validação funciona
- [ ] Botão "usar credenciais" funciona
- [ ] Login bem-sucedido navega para home
- [ ] Visual está profissional e moderno

---

**Pronto para testar! Execute `npm run android` em um novo terminal!** 🚀
