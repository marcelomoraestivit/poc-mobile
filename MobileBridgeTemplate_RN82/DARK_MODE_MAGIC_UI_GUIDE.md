# 🎨 Dark Mode + Magic UI - Guia de Implementação

**Status:** ⏳ Em Implementação
**Tema:** Dark Mode inspirado no Magic UI com Tailwind CSS
**Tecnologias:** NativeWind + Tailwind CSS + React Native 0.82

---

## 📋 O Que Foi Feito Até Agora

### ✅ 1. Configuração do Tailwind CSS (NativeWind)

**Arquivos Criados/Modificados:**

#### `tailwind.config.js`
```javascript
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './App.*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Dark Mode Colors (Magic UI inspired)
        background: {
          DEFAULT: '#0a0a0a',       // Preto profundo
          secondary: '#141414',      // Preto secondary
          tertiary: '#1a1a1a',       // Preto tertiary
        },
        foreground: {
          DEFAULT: '#ffffff',        // Branco puro
          secondary: '#a1a1aa',      // Cinza claro
          tertiary: '#71717a',       // Cinza médio
        },
        primary: {
          DEFAULT: '#8b5cf6',        // Roxo (Purple)
          light: '#a78bfa',
          dark: '#7c3aed',
        },
        accent: {
          DEFAULT: '#06b6d4',        // Ciano (Cyan)
          light: '#22d3ee',
          dark: '#0891b2',
        },
        // ... more colors
      },
    },
  },
};
```

#### `babel.config.js`
```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'nativewind/babel',
    'react-native-reanimated/plugin', // must be last
  ],
};
```

#### `global.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### ✅ 2. Componentes UI Reutilizáveis

Criados componentes base com estilo Magic UI:

#### `src/components/ui/Card.tsx`
```typescript
<Card variant="default">  {/* Padrão */}
<Card variant="bordered"> {/* Com borda destacada */}
<Card variant="glass">    {/* Efeito glass/blur */}
```

**Uso:**
```tsx
<Card variant="glass" className="mb-6">
  <Text className="text-foreground">Conteúdo do card</Text>
</Card>
```

---

#### `src/components/ui/Button.tsx`
```typescript
<Button variant="primary" size="lg" loading={false}>
  Texto do botão
</Button>
```

**Variantes:**
- `primary` - Roxo (#8b5cf6)
- `secondary` - Cinza escuro com borda
- `outline` - Transparente com borda roxa
- `ghost` - Transparente
- `accent` - Ciano (#06b6d4)

**Tamanhos:**
- `sm` - Pequeno
- `md` - Médio (padrão)
- `lg` - Grande

**Props:**
- `loading`: Mostra ActivityIndicator
- `disabled`: Desabilita e reduz opacidade

---

#### `src/components/ui/Input.tsx`
```typescript
<Input
  label="Email"
  placeholder="seu@email.com"
  value={email}
  onChangeText={setEmail}
  error="Campo obrigatório"
  icon={<Text>📧</Text>}
  rightIcon={<Text>👁️</Text>}
  onRightIconPress={() => {}}
/>
```

**Features:**
- Label opcional
- Mensagem de erro
- Ícone esquerdo
- Ícone direito com ação
- Borda muda de cor no foco
- Borda vermelha quando há erro

---

### ✅ 3. Tela de Login com Dark Mode

**Arquivo:** `src/screens/LoginScreen.DarkMode.tsx`

**Características:**
- 🌑 Background preto profundo (#0a0a0a)
- 💜 Botões roxos (#8b5cf6)
- 🎨 Cards com efeito glass
- ✨ Animações suaves
- 📱 Totalmente responsivo
- 🔒 Validação de campos
- 💡 Botão para preencher credenciais de teste
- 👤 Card info com credenciais

**Preview:**
```
┌─────────────────────────────────────┐
│          🛒 Mobile Bridge           │
│         ● Sistema Online            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Bem-vindo de volta!           │ │
│  │ Entre com suas credenciais... │ │
│  │                               │ │
│  │ 📧 Email                      │ │
│  │ ┌─────────────────────────┐   │ │
│  │ │ seu@email.com           │   │ │
│  │ └─────────────────────────┘   │ │
│  │                               │ │
│  │ 🔒 Senha                      │ │
│  │ ┌─────────────────────────┐👁│ │
│  │ │ ••••••••                │   │ │
│  │ └─────────────────────────┘   │ │
│  │                               │ │
│  │ [      Entrar      ]          │ │
│  │ 💡 Usar credenciais de teste │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 👤 Credenciais de Teste       │ │
│  │ 📧 usuario@teste.com          │ │
│  │ 🔑 senha123                   │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🎨 Paleta de Cores Dark Mode

```typescript
// Backgrounds
background: '#0a0a0a'           // Principal (preto profundo)
background-secondary: '#141414' // Cards
background-tertiary: '#1a1a1a'  // Inputs

// Textos
foreground: '#ffffff'           // Principal (branco)
foreground-secondary: '#a1a1aa' // Secundário (cinza claro)
foreground-tertiary: '#71717a'  // Terciário (cinza médio)

// Primary (Roxo)
primary: '#8b5cf6'
primary-light: '#a78bfa'
primary-dark: '#7c3aed'

// Accent (Ciano)
accent: '#06b6d4'
accent-light: '#22d3ee'
accent-dark: '#0891b2'

// Bordas
border: '#27272a'
border-light: '#3f3f46'

// Estados
success: '#10b981'  // Verde
error: '#ef4444'    // Vermelho
warning: '#f59e0b'  // Amarelo
```

---

## 📦 Dependências Instaladas

```bash
npm install nativewind tailwindcss react-native-reanimated react-native-svg
```

**Nota:** A instalação está em andamento devido a problemas de permissão no Windows/WSL.

---

## 🚀 Próximos Passos

### 1. ⏳ Aguardar Instalação das Dependências

```bash
# Verificar status
npm list nativewind

# Se ainda houver problemas, tentar:
rm -rf node_modules package-lock.json
npm install
```

---

### 2. 📱 Criar Telas Faltantes com Dark Mode

#### HomeScreen.DarkMode.tsx
```tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from '../components/ui';

const HomeScreen = ({ onNavigate, onLogout }) => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 py-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">
            Bem-vindo! 👋
          </Text>
          <Text className="text-foreground-secondary mt-2">
            Escolha uma opção abaixo
          </Text>
        </View>

        {/* Cards de Navegação */}
        <Card variant="glass" className="mb-4">
          <View className="flex-row items-center gap-4 mb-3">
            <View className="w-12 h-12 rounded-xl bg-primary/20 items-center justify-center">
              <Text className="text-2xl">🌐</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">
                WebView Shop
              </Text>
              <Text className="text-sm text-foreground-secondary">
                Loja integrada via Mobile Bridge
              </Text>
            </View>
          </View>
          <Button
            variant="primary"
            onPress={() => onNavigate('webview')}
          >
            Abrir Loja
          </Button>
        </Card>

        <Card variant="glass" className="mb-4">
          <View className="flex-row items-center gap-4 mb-3">
            <View className="w-12 h-12 rounded-xl bg-accent/20 items-center justify-center">
              <Text className="text-2xl">👤</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">
                Meu Perfil
              </Text>
              <Text className="text-sm text-foreground-secondary">
                Informações da conta
              </Text>
            </View>
          </View>
          <Button
            variant="outline"
            onPress={() => onNavigate('profile')}
          >
            Ver Perfil
          </Button>
        </Card>

        <Card variant="glass" className="mb-4">
          <View className="flex-row items-center gap-4 mb-3">
            <View className="w-12 h-12 rounded-xl bg-warning/20 items-center justify-center">
              <Text className="text-2xl">⚙️</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">
                Configurações
              </Text>
              <Text className="text-sm text-foreground-secondary">
                Ajustes do aplicativo
              </Text>
            </View>
          </View>
          <Button
            variant="outline"
            onPress={() => onNavigate('settings')}
          >
            Configurar
          </Button>
        </Card>

        {/* Logout Button */}
        <Button
          variant="ghost"
          className="mt-4"
          onPress={onLogout}
        >
          🚪 Sair
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
```

---

#### ProfileScreen.DarkMode.tsx
```tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from '../components/ui';
import { AuthService } from '../services/AuthService';

const ProfileScreen = ({ onBack }) => {
  const user = AuthService.getCurrentUser();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 py-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Button variant="ghost" onPress={onBack} className="mr-3">
            ←
          </Button>
          <Text className="text-2xl font-bold text-foreground">
            Meu Perfil
          </Text>
        </View>

        {/* Avatar + Nome */}
        <Card variant="glass" className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent items-center justify-center mb-4">
            <Text className="text-5xl">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-foreground mb-1">
            {user?.name || 'Usuário'}
          </Text>
          <Text className="text-foreground-secondary">
            {user?.email}
          </Text>
        </Card>

        {/* Informações */}
        <Card variant="bordered" className="mb-4">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Informações da Conta
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between py-2 border-b border-border">
              <Text className="text-foreground-secondary">Email</Text>
              <Text className="text-foreground font-medium">{user?.email}</Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-border">
              <Text className="text-foreground-secondary">Nome</Text>
              <Text className="text-foreground font-medium">{user?.name}</Text>
            </View>

            <View className="flex-row justify-between py-2">
              <Text className="text-foreground-secondary">Membro desde</Text>
              <Text className="text-foreground font-medium">Nov 2025</Text>
            </View>
          </View>
        </Card>

        {/* Estatísticas */}
        <Card variant="glass">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Estatísticas
          </Text>

          <View className="flex-row justify-between">
            <View className="flex-1 items-center">
              <Text className="text-3xl font-bold text-primary">12</Text>
              <Text className="text-foreground-secondary text-sm mt-1">
                Compras
              </Text>
            </View>

            <View className="flex-1 items-center border-l border-r border-border">
              <Text className="text-3xl font-bold text-accent">5</Text>
              <Text className="text-foreground-secondary text-sm mt-1">
                Favoritos
              </Text>
            </View>

            <View className="flex-1 items-center">
              <Text className="text-3xl font-bold text-success">R$ 1.2k</Text>
              <Text className="text-foreground-secondary text-sm mt-1">
                Total
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
```

---

#### SettingsScreen.DarkMode.tsx
```tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from '../components/ui';

const SettingsScreen = ({ onBack, onLogout }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 py-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Button variant="ghost" onPress={onBack} className="mr-3">
            ←
          </Button>
          <Text className="text-2xl font-bold text-foreground">
            Configurações
          </Text>
        </View>

        {/* Preferências */}
        <Card variant="glass" className="mb-4">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Preferências
          </Text>

          <View className="space-y-4">
            <View className="flex-row justify-between items-center py-2">
              <View className="flex-1">
                <Text className="text-foreground font-medium">Notificações</Text>
                <Text className="text-foreground-secondary text-sm">
                  Receber alertas e atualizações
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#27272a', true: '#8b5cf6' }}
                thumbColor={notifications ? '#ffffff' : '#71717a'}
              />
            </View>

            <View className="flex-row justify-between items-center py-2">
              <View className="flex-1">
                <Text className="text-foreground font-medium">Modo Escuro</Text>
                <Text className="text-foreground-secondary text-sm">
                  Interface em tema escuro
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#27272a', true: '#8b5cf6' }}
                thumbColor={darkMode ? '#ffffff' : '#71717a'}
              />
            </View>

            <View className="flex-row justify-between items-center py-2">
              <View className="flex-1">
                <Text className="text-foreground font-medium">Analytics</Text>
                <Text className="text-foreground-secondary text-sm">
                  Compartilhar dados de uso
                </Text>
              </View>
              <Switch
                value={analytics}
                onValueChange={setAnalytics}
                trackColor={{ false: '#27272a', true: '#8b5cf6' }}
                thumbColor={analytics ? '#ffffff' : '#71717a'}
              />
            </View>
          </View>
        </Card>

        {/* Sobre */}
        <Card variant="bordered" className="mb-4">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Sobre
          </Text>

          <View className="space-y-2">
            <View className="flex-row justify-between py-2">
              <Text className="text-foreground-secondary">Versão</Text>
              <Text className="text-foreground font-medium">1.0.0</Text>
            </View>

            <View className="flex-row justify-between py-2">
              <Text className="text-foreground-secondary">Build</Text>
              <Text className="text-foreground font-medium">2025.11.04</Text>
            </View>

            <View className="flex-row justify-between py-2">
              <Text className="text-foreground-secondary">React Native</Text>
              <Text className="text-foreground font-medium">0.82</Text>
            </View>
          </View>
        </Card>

        {/* Ações */}
        <Card variant="glass" className="mb-4">
          <Button
            variant="outline"
            className="mb-3"
            onPress={() => {}}
          >
            📄 Termos de Uso
          </Button>

          <Button
            variant="outline"
            className="mb-3"
            onPress={() => {}}
          >
            🔒 Política de Privacidade
          </Button>

          <Button
            variant="ghost"
            onPress={onLogout}
          >
            🚪 Sair da Conta
          </Button>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
```

---

### 3. 🔧 Atualizar App.TestHost para usar Dark Mode

**Arquivo:** `App.TestHost.DarkMode.tsx`

Substituir imports das telas antigas pelas novas:

```typescript
// OLD:
import LoginScreen from './src/screens/LoginScreen';

// NEW:
import LoginScreen from './src/screens/LoginScreen.DarkMode';
import HomeScreen from './src/screens/HomeScreen.DarkMode';
import ProfileScreen from './src/screens/ProfileScreen.DarkMode';
import SettingsScreen from './src/screens/SettingsScreen.DarkMode';
```

E atualizar os componentes para usar o novo estilo:

```typescript
// Renderizar tela baseado em currentScreen
const renderScreen = () => {
  switch (currentScreen) {
    case 'home':
      return (
        <HomeScreen
          onNavigate={handleNavigateToScreen}
          onLogout={handleLogout}
        />
      );
    case 'profile':
      return (
        <ProfileScreen onBack={() => setCurrentScreen('home')} />
      );
    case 'settings':
      return (
        <SettingsScreen
          onBack={() => setCurrentScreen('home')}
          onLogout={handleLogout}
        />
      );
    case 'webview':
      return <EmbeddedWebApp />;
    default:
      return null;
  }
};
```

---

### 4. 🎨 Importar CSS Global

No início do `App.TestHost.DarkMode.tsx`:

```typescript
import './global.css';
```

---

### 5. ✅ Testar o Aplicativo

```bash
# Limpar cache e rebuild
npm start -- --reset-cache

# Em outro terminal
npm run android
# ou
npm run ios
```

---

## 🎯 Resultado Final

- ✅ Visual moderno com tema escuro
- ✅ Componentes reutilizáveis (Card, Button, Input)
- ✅ Paleta de cores consistente (Magic UI inspired)
- ✅ Animações suaves
- ✅ Totalmente tipado (TypeScript)
- ✅ Responsivo
- ✅ Acessível

---

## 📸 Screenshots (Conceito)

### Login Screen
```
🌑 Background preto profundo
💜 Botão roxo brilhante
✨ Card com efeito glass
🎨 Inputs com borda animada
```

### Home Screen
```
👋 Welcome message
📱 Cards de navegação com ícones
🎨 Degradês sutis
🔘 Botões com hover states
```

### Profile Screen
```
👤 Avatar circular com degradê
📊 Estatísticas coloridas
📋 Informações organizadas
✨ Cards com bordas suaves
```

### Settings Screen
```
⚙️ Switches modernos
📱 Lista de opções
🎨 Cards informativos
🚪 Botão de logout
```

---

## 🐛 Troubleshooting

### Problema: Classes Tailwind não funcionam

**Solução:**
```bash
# Verificar se NativeWind está instalado
npm list nativewind

# Limpar cache do Metro
npm start -- --reset-cache

# Rebuild completo
cd android && ./gradlew clean && cd ..
npm run android
```

---

### Problema: Erro "className não é uma prop válida"

**Solução:**
Verificar se `babel.config.js` tem o plugin do NativeWind:

```javascript
plugins: [
  'nativewind/babel',
  'react-native-reanimated/plugin',
],
```

---

### Problema: Cores não aparecem

**Solução:**
Verificar se `global.css` está sendo importado no arquivo principal:

```typescript
import './global.css'; // No início do App.tsx ou App.TestHost.tsx
```

---

## 📚 Recursos

- [NativeWind Docs](https://www.nativewind.dev/)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [Magic UI](https://magicui.design/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

---

## ✅ Checklist de Implementação

- [x] Configurar Tailwind CSS
- [x] Criar componentes UI base
- [x] Criar LoginScreen com Dark Mode
- [ ] Criar HomeScreen com Dark Mode
- [ ] Criar ProfileScreen com Dark Mode
- [ ] Criar SettingsScreen com Dark Mode
- [ ] Atualizar App.TestHost para usar novas telas
- [ ] Testar navegação entre telas
- [ ] Testar em Android
- [ ] Testar em iOS

---

**Status Atual:** Arquivos de configuração e componentes base criados. Aguardando conclusão da instalação das dependências para continuar.

**Próximo Passo:** Criar as telas Home, Profile e Settings quando o npm install terminar.
