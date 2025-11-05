# 🎨 Visual da Tela de Login - Tema Vermelho e Branco

## 📱 Preview da Tela

```
┌─────────────────────────────────────┐
│ ███████████████████████████████████ │ ← Header Vermelho (#E03131)
│ █  🛒  Mobile Bridge App         █ │
│ ███████████████████████████████████ │
│                                     │
│                                     │ ← Fundo Cinza Claro (#F8F9FA)
│           🔒                        │ ← Ícone vermelho
│       Bem-vindo!                    │ ← Título grande
│   Faça login para continuar        │ ← Subtítulo
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ╔═══════════════════════════╗ │   │ ← Card Branco com shadow
│  │ ║ 📧 Email                  ║ │   │
│  │ ║ ┌───────────────────────┐ ║ │   │
│  │ ║ │ usuario@teste.com     │ ║ │   │
│  │ ║ └───────────────────────┘ ║ │   │
│  │ ║                           ║ │   │
│  │ ║ 🔒 Senha                  ║ │   │
│  │ ║ ┌──────────────────── 👁️│ ║ │   │
│  │ ║ │ ••••••••              │ ║ │   │
│  │ ║ └───────────────────────┘ ║ │   │
│  │ ║                           ║ │   │
│  │ ║ ╔════════════════════╗    ║ │   │ ← Botão Vermelho
│  │ ║ ║ 🔑  Entrar        ║    ║ │   │   com shadow
│  │ ║ ╚════════════════════╝    ║ │   │
│  │ ║                           ║ │   │
│  │ ║  💡 Usar credenciais      ║ │   │ ← Texto vermelho
│  │ ║     de teste              ║ │   │
│  │ ╚═══════════════════════════╝ │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │ ← Card Info Rosa Claro
│  │ │ 👤 Usuário de Teste       │   │   (#FFF5F5)
│  │ │                           │   │   Borda vermelha esquerda
│  │ │ 📧 usuario@teste.com      │   │
│  │ │ 🔑 senha123               │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 🎨 Paleta de Cores (Mantine Red Theme)

```
Primary Red:       #E03131 (vermelho vibrante)
Primary Dark:      #C92A2A (vermelho escuro)
Primary Light:     #FFF5F5 (rosa muito claro)
White:             #FFFFFF (branco puro)
Background:        #F8F9FA (cinza muito claro)
Text:              #212529 (quase preto)
Text Secondary:    #868E96 (cinza médio)
Border:            #DEE2E6 (cinza claro)
```

## ✨ Recursos Visuais

### Header
- ✅ Fundo vermelho vibrante (#E03131)
- ✅ Ícone de carrinho de compras branco
- ✅ Texto "Mobile Bridge App" em branco
- ✅ Sombra suave

### Welcome Section
- ✅ Ícone de cadeado vermelho (64px)
- ✅ Título "Bem-vindo!" em negrito
- ✅ Subtítulo "Faça login para continuar"

### Form Card (Branco)
- ✅ Fundo branco com bordas arredondadas
- ✅ Sombra suave para profundidade
- ✅ Labels com ícones:
  - 📧 Email (ícone cinza)
  - 🔒 Senha (ícone cinza)
- ✅ Inputs com fundo cinza claro
- ✅ Botão de mostrar/ocultar senha (ícone olho)

### Login Button
- ✅ Fundo vermelho vibrante
- ✅ Ícone de login + texto "Entrar"
- ✅ Sombra vermelha pronunciada
- ✅ Efeito hover (opacity 0.8)

### Test Credentials Button
- ✅ Transparente com texto vermelho
- ✅ Ícone de lâmpada
- ✅ Texto "Usar credenciais de teste"

### Info Card
- ✅ Fundo rosa muito claro (#FFF5F5)
- ✅ Borda vermelha na esquerda (4px)
- ✅ Ícone de usuário + título
- ✅ Lista de credenciais com ícones

## 📐 Espaçamento e Layout

```
Padding do Card:        24px
Margin entre inputs:    20px
Altura dos inputs:      ~52px
Altura do botão:        ~56px
Border radius:          12px
Ícones:                 20-24px
Títulos:                28px
Texto normal:           15-16px
```

## 🎭 Estados Visuais

### Loading
- Botão desabilitado: cinza (#868E96)
- Spinner branco no centro do botão
- Sem sombra

### Hover/Press
- Botão vermelho: opacity 0.8
- Botão teste: opacity 0.7

### Disabled
- Inputs: opacity reduzida
- Botões: não clicável

## 🔄 Transições

- Todas as mudanças de estado são suaves
- Sombras aparecem/desaparecem gradualmente
- Cores transitam suavemente

## 📱 Compatibilidade

- ✅ Android: Material Design
- ✅ iOS: iOS Native look & feel
- ✅ Tema consistente com App.TestHost.tsx
- ✅ Status bar: light-content (texto branco)

## 🎯 Alinhamento com App Host

A tela de login usa **exatamente a mesma paleta de cores** do App.TestHost:
- Mesmo vermelho (#E03131)
- Mesmos cinzas
- Mesmas sombras
- Mesmo estilo de cards

Quando você faz login, a transição é **visualmente perfeita** pois os headers têm a mesma cor!

```
LOGIN SCREEN          →          APP HOST HOME
┌─────────────┐                 ┌─────────────┐
│ ███ Red ███ │    [Login]      │ ███ Red ███ │
│ Login       │    ───────→     │ App Host    │
│             │                 │             │
│  🔒 Form    │                 │  🏠 Content │
└─────────────┘                 └─────────────┘
```

Transição suave e consistente! 🎨✨
