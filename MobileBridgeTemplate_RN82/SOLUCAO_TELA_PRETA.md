# Solução para Tela Preta no App.TestHost.tsx

## Problema
Ao tentar abrir o app App.TestHost.tsx, a tela fica toda preta.

## Causas Possíveis
1. **Erro silencioso no código** - Um erro pode estar ocorrendo mas não sendo exibido
2. **Cache do Metro Bundler** - Cache desatualizado pode causar problemas
3. **Dependências não carregadas** - SafeAreaView ou Icons podem não estar carregando
4. **Erro no AuthService** - A inicialização pode estar falhando

## Soluções Implementadas

### 1. Adicionado ErrorBoundary
Agora o app tem um ErrorBoundary que captura erros do React e exibe uma mensagem amigável.

### 2. Adicionado Logs de Debug
Logs foram adicionados em pontos críticos:
- `[App.TestHost] Component mounted`
- `[App.TestHost] Initializing AuthService...`
- `[App.TestHost] Authentication status: true/false`
- `[App.TestHost] Rendering main app, currentScreen: home`

### 3. Tela de Erro Melhorada
Se houver erro durante a inicialização, uma tela amigável será exibida com:
- ⚠️ Ícone de erro
- Mensagem do erro
- Botão "Tentar Novamente"

### 4. Cache Limpo
O Metro Bundler foi reiniciado com cache limpo.

## Como Testar

### Passo 1: Verificar se Metro está rodando
```bash
# O Metro deve estar rodando (já iniciado com --reset-cache)
# Se não estiver, execute:
npm start -- --reset-cache
```

### Passo 2: Recarregar o App
No seu dispositivo/emulador Android:
1. Pressione **R + R** (duas vezes a tecla R) para recarregar
2. Ou abra o menu de desenvolvedor (agite o dispositivo) e selecione "Reload"

### Passo 3: Verificar Logs
Abra o LogCat para ver os logs:
```bash
# Terminal WSL/Linux
adb logcat *:S ReactNative:V ReactNativeJS:V

# Procure por mensagens que começam com [App.TestHost]
```

### Passo 4: O que Esperar

#### Se tudo estiver OK:
Você verá no LogCat:
```
[App.TestHost] Component mounted
[App.TestHost] Initializing AuthService...
[App.TestHost] Authentication status: false
[App.TestHost] Auth check completed
[App.TestHost] Rendering main app, currentScreen: home
```

E no app:
- **Tela de Login** com campos de email e senha
- Card vermelho com informações do usuário de teste
- Botão "Usar credenciais de teste"

#### Se houver erro:
Você verá:
- **Tela branca com erro** mostrando a mensagem do erro
- Botão "Tentar Novamente"
- Logs no LogCat indicando onde o erro ocorreu

## Próximos Passos

Se ainda estiver com tela preta:

### 1. Verificar se é problema de import
```bash
# Execute este script de diagnóstico
bash diagnostico-login.sh
```

### 2. Verificar se SafeAreaView está configurado
O app precisa de `react-native-safe-area-context` instalado:
```bash
npm list react-native-safe-area-context
# Deve mostrar: react-native-safe-area-context@5.6.1
```

### 3. Verificar se Icons estão configurados
```bash
npm list react-native-vector-icons
# Deve mostrar: react-native-vector-icons@10.3.0
```

### 4. Limpar build nativo (Android)
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### 5. Reinstalar dependências
```bash
rm -rf node_modules
npm install
cd android && ./gradlew clean && cd ..
npm run android
```

## Logs Úteis

### Ver todos os logs do React Native:
```bash
adb logcat *:S ReactNative:V ReactNativeJS:V
```

### Ver apenas erros:
```bash
adb logcat *:E
```

### Ver logs do App.TestHost:
```bash
adb logcat | grep "App.TestHost"
```

## Estrutura do App

```
App.TestHost.tsx
├── ErrorBoundary (captura erros do React)
├── SafeAreaView (área segura)
    ├── [Verificação de Erro] → Tela de Erro
    ├── [Loading] → Spinner de carregamento
    ├── [Não Autenticado] → LoginScreen
    └── [Autenticado] → App Principal
        ├── Header (vermelho)
        ├── Content (Home/Profile/Settings)
        ├── WebView (escondido quando não ativo)
        └── Bottom Navigation
```

## Credenciais de Teste

Após a tela de login aparecer, use:
- **Email:** `usuario@teste.com`
- **Senha:** `senha123`

Ou clique no botão "Usar credenciais de teste" para preencher automaticamente.

## Suporte

Se o problema persistir:
1. Capture os logs completos: `adb logcat > logs.txt`
2. Tire screenshot da tela preta
3. Verifique se há erro no Metro Bundler (terminal onde está rodando `npm start`)
