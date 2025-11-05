# 🧪 Modo Test Host - Guia de Teste

> App de demonstração que simula como integrar o MobileBridge em uma aplicação React Native maior

## 📋 O que é o Modo Test Host?

O **Modo Test Host** é uma aplicação de exemplo que demonstra **como incorporar o MobileBridge (modo embedded) dentro de um app React Native maior**.

Este modo é útil para:
- ✅ Visualizar como o WebView embedded funciona em contexto real
- ✅ Testar a integração antes de implementar no seu app
- ✅ Entender a arquitetura de integração
- ✅ Ver exemplos de navegação entre telas nativas e WebView

---

## 🚀 Como Testar

### 1. Ativar o Modo Test Host

```bash
npm run mode:testhost
```

O script vai modificar o `index.js` para importar `./App.TestHost`.

### 2. Recarregar o App

**Opção 1: Recarregar no app em execução**
- Pressione `R` + `R` no app

**Opção 2: Reiniciar completamente**
```bash
npm run android
# ou
npm run ios
```

### 3. Explorar o App

Quando o app abrir, você verá:

```
┌─────────────────────────┐
│   App Host Demo         │  ← Header (apenas em telas nativas)
├─────────────────────────┤
│                         │
│   Conteúdo da Tela      │  ← Área principal
│                         │
├─────────────────────────┤
│  🏠  👤  🌐  ⚙️       │  ← Bottom Navigation
└─────────────────────────┘
```

---

## 🗺️ Navegação

O app de teste tem 4 telas:

### 1. 🏠 Home
- Tela inicial do app "host"
- Explica o conceito do test mode
- Botão para abrir o WebView

### 2. 👤 Perfil
- Tela nativa simulando um perfil de usuário
- Demonstra conteúdo nativo do app
- Opção de navegar para o WebView

### 3. 🌐 WebView (MobileBridge Embedded)
- **Aqui está o componente `App.Embedded.tsx`**
- WebView ocupa a tela toda (fullscreen)
- Header e Bottom Nav **desaparecem**
- Botão "Voltar" aparece no canto superior esquerdo
- Toda funcionalidade do Mobile Bridge ativa

### 4. ⚙️ Configurações
- Tela nativa de configurações
- Informações sobre o WebView

---

## 🔍 O que Observar

### Quando está em telas nativas (Home, Perfil, Config):
- ✅ Header azul no topo
- ✅ Bottom navigation visível
- ✅ Conteúdo nativo React Native
- ✅ Navegação entre abas

### Quando abre o WebView (🌐):
- ✅ WebView ocupa **tela inteira**
- ✅ Header e Bottom Nav **desaparecem**
- ✅ Botão "Voltar" no canto superior esquerdo
- ✅ Todo conteúdo é do webapp
- ✅ Mobile Bridge funcionando normalmente

### Fluxo de Teste Recomendado:

1. **Inicie no Home** → Leia as informações
2. **Navegue para Perfil** → Veja uma tela nativa
3. **Navegue para WebView** → Veja a transição
4. **Interaja com o WebView** → Teste o Mobile Bridge
5. **Pressione Voltar** → Retorne para Home
6. **Navegue entre as abas** → Veja como funciona

---

## 💻 Como Funciona (Código)

### Estrutura do App.TestHost.tsx

```typescript
// Importa o componente embedded
import EmbeddedWebApp from './App.Embedded';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;  // Tela nativa
      case 'profile':
        return <ProfileScreen />;  // Tela nativa
      case 'settings':
        return <SettingsScreen />;  // Tela nativa
      case 'webview':
        return <EmbeddedWebApp />;  // ← WebView embedded!
    }
  };

  return (
    <SafeAreaView>
      {/* Header - esconde quando webview ativo */}
      {currentScreen !== 'webview' && <Header />}

      {/* Conteúdo */}
      {renderScreen()}

      {/* Bottom Nav - esconde quando webview ativo */}
      {currentScreen !== 'webview' && <BottomNav />}

      {/* Botão Voltar - apenas quando webview ativo */}
      {currentScreen === 'webview' && <BackButton />}
    </SafeAreaView>
  );
}
```

### Pontos-Chave:

1. **Importação Simples:**
   ```typescript
   import EmbeddedWebApp from './App.Embedded';
   ```

2. **Uso como Componente:**
   ```typescript
   <EmbeddedWebApp />
   ```

3. **Controle de Visibilidade:**
   - Header/Nav aparecem apenas em telas nativas
   - WebView ocupa tela toda quando ativo

4. **Navegação Controlada:**
   - Estado `currentScreen` controla qual tela mostrar
   - Simples e direto, sem bibliotecas complexas

---

## 🎯 Aplicando no Seu Projeto

Este é um exemplo simplificado. No seu app real, você provavelmente usará:

### Com React Navigation:

```typescript
import { createStackNavigator } from '@react-navigation/stack';
import EmbeddedWebApp from './path/to/App.Embedded';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />

      {/* WebView Embedded - sem header */}
      <Stack.Screen
        name="Store"
        component={EmbeddedWebApp}
        options={{ headerShown: false }}  // ← Esconde header
      />
    </Stack.Navigator>
  );
}
```

### Com React Navigation Bottom Tabs:

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EmbeddedWebApp from './path/to/App.Embedded';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />

      {/* Tab do WebView */}
      <Tab.Screen
        name="Store"
        component={EmbeddedWebApp}
        options={{
          tabBarIcon: () => <Icon name="shop" />,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
```

---

## 🔄 Voltando aos Outros Modos

### Modo FULL (com TabBar):
```bash
npm run mode:full
```

### Modo EMBEDDED (apenas WebView):
```bash
npm run mode:embedded
```

---

## 📝 Checklist de Teste

Use este checklist ao testar:

- [ ] Ativei o modo test host: `npm run mode:testhost`
- [ ] App carregou com a tela Home
- [ ] Naveguei entre as abas (Home, Perfil, Config)
- [ ] Bottom navigation está funcionando
- [ ] Abri o WebView (aba 🌐)
- [ ] WebView ocupou a tela toda
- [ ] Header e Bottom Nav desapareceram
- [ ] Botão "Voltar" apareceu
- [ ] Mobile Bridge está funcionando no WebView
- [ ] Consegui voltar para Home usando o botão "Voltar"
- [ ] Navegação entre abas funciona normalmente

---

## 🎨 Personalizando o Test Host

Você pode modificar `App.TestHost.tsx` para:

### Adicionar mais telas:
```typescript
case 'myscreen':
  return <MyScreen />;
```

### Mudar cores:
```typescript
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FF5733',  // Sua cor
  },
});
```

### Adicionar mais abas:
```typescript
<TouchableOpacity onPress={() => setCurrentScreen('newscreen')}>
  <Text>Nova Aba</Text>
</TouchableOpacity>
```

---

## 🐛 Troubleshooting

### App não mudou após `npm run mode:testhost`
**Solução:** Recarregue com `R` + `R` ou reinicie o app completamente.

### WebView não aparece na aba 🌐
**Solução:**
1. Verifique se o Metro Bundler está rodando
2. Verifique se a URL do WebView está correta em `App.Embedded.tsx`
3. Veja o console para erros

### Botão "Voltar" não funciona
**Solução:** Pressione o botão novamente ou navegue usando as abas do bottom nav.

---

## 📚 Recursos Relacionados

- [EMBEDDED_MODE.md](./EMBEDDED_MODE.md) - Documentação do modo embedded
- [README.md](../README.md) - Documentação principal
- [App.TestHost.tsx](../App.TestHost.tsx) - Código fonte do test host
- [App.Embedded.tsx](../App.Embedded.tsx) - Código fonte do embedded

---

## 💡 Dicas

1. **Use este modo para demonstrações:** Mostre para stakeholders como ficaria integrado
2. **Teste fluxos completos:** Navegue do nativo para o web e vice-versa
3. **Experimente modificar:** Altere cores, textos e veja as mudanças
4. **Base para seu app:** Use como referência para implementar no seu projeto

---

## ✅ Conclusão

O modo Test Host demonstra que integrar o MobileBridge no seu app é simples:

1. Importe o componente `App.Embedded`
2. Use como qualquer outro componente React
3. Controle quando mostrar (navegação, tabs, etc.)
4. Esconda header/nav quando o WebView estiver ativo

**Pronto!** Agora você tem um exemplo funcional para testar e adaptar. 🚀
