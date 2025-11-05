# 🧪 Como Testar a Tela de Login

## Passo 1: Limpar tudo e começar do zero

### No PowerShell (Windows):

```powershell
# 1. Matar processos na porta 8081
Get-Process -Id (Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Limpar cache do Metro
npm start -- --reset-cache
```

Aguarde até ver:
```
Welcome to Metro
Fast - Scalable - Integrated
```

## Passo 2: Em OUTRO terminal PowerShell

```powershell
# Rodar o app Android
npx react-native run-android
```

## O que deve acontecer:

1. ✅ App abre no emulador/dispositivo
2. ✅ Mostra tela "Verificando autenticação..." por 1-2 segundos
3. ✅ **Tela de login aparece** com:
   - Logo 🛍️
   - "Mobile Bridge App"
   - Campos Email e Senha
   - Botão "💡 Usar credenciais de teste"
   - Card azul com dados do usuário teste

## Testando o Login:

1. Clique em "💡 Usar credenciais de teste"
2. Campos são preenchidos automaticamente
3. Clique em "Entrar"
4. Loading aparece
5. Redireciona para WebView

## ❌ Se a tela de login NÃO aparecer:

Abra o React Native DevTools:
- Pressione `m` no terminal do Metro
- Ou shake o dispositivo → "Debug"

Veja os logs no console:
```javascript
[App] User authenticated: ...  // Se aparecer = já está logado
[App] Auth check error: ...     // Se aparecer = erro de autenticação
```

### Para forçar logout e ver a tela de login:

No console do DevTools:
```javascript
import { AuthService } from './src/services/AuthService';
AuthService.logout().then(() => console.log('Logout feito'));
```

Ou delete o app e instale novamente:
```powershell
adb uninstall com.mobilebridgeapp
npx react-native run-android
```

## 🐛 Problemas Comuns:

### 1. Metro não inicia
```powershell
# Limpar tudo
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force android/build
npm install
```

### 2. App abre mas fica em branco
- Verifique logs do Metro
- Verifique se há erros vermelhos no console
- Recarregue o app (RR no terminal do Metro)

### 3. Erro "Cannot find module"
```powershell
npm install
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### 4. App mostra WebView direto (sem login)
Isso significa que você JÁ está logado (token salvo).
Para ver a tela de login novamente:

```powershell
# Delete o app e reinstale
adb uninstall com.mobilebridgeapp
npx react-native run-android
```

## 📱 Verificar se está funcionando:

No console do React Native DevTools, após o app iniciar, você deve ver:

```
[Auth] Service initialized, user: usuario@teste.com  ← Se já logado
[App] User authenticated: usuario@teste.com          ← Se já logado

OU

[Auth] Service initialized, user: undefined          ← Se não logado
```

Se ver "undefined", a tela de login DEVE aparecer.
