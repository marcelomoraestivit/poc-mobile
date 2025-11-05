# Sistema de Autenticação JWT

Este documento descreve o sistema de autenticação implementado no Mobile Bridge App.

## 📋 Visão Geral

O sistema de autenticação foi implementado para controlar o acesso à aplicação WebView. Usuários precisam fazer login antes de acessar o conteúdo da aplicação.

### Componentes Principais

1. **LoginScreen** (`src/screens/LoginScreen.tsx`)
   - Tela de login com email e senha
   - Validação de credenciais
   - Botão helper para preencher credenciais de teste

2. **AuthService** (`src/services/AuthService.ts`)
   - Gerenciamento de autenticação
   - Geração e validação de tokens JWT
   - Armazenamento seguro de credenciais

3. **JWTGenerator** (`src/utils/JWTGenerator.ts`)
   - Geração de tokens JWT
   - Decodificação e validação de tokens
   - Tokens de acesso (1 hora) e refresh (7 dias)

## 👤 Usuários de Teste

O sistema possui dois usuários de teste pré-configurados:

### Usuário 1 (Padrão)
```
Email: usuario@teste.com
Senha: senha123
Nome: Usuário Teste
```

### Usuário 2 (Admin)
```
Email: admin@teste.com
Senha: admin123
Nome: Admin Teste
```

## 🔐 Fluxo de Autenticação

### 1. Inicialização do App

```
App Inicia
    ↓
Verifica autenticação salva
    ↓
Se autenticado → Vai para WebView
Se não → Mostra tela de login
```

### 2. Login

```
Usuário preenche email/senha
    ↓
Valida credenciais
    ↓
Gera JWT Token (access + refresh)
    ↓
Salva em SecureStorage
    ↓
Redireciona para WebView
```

### 3. Token JWT

O token JWT gerado contém:

```json
{
  "userId": "user_1234567890",
  "email": "usuario@teste.com",
  "name": "Usuário Teste",
  "iat": 1698765432,  // Issued at
  "exp": 1698769032   // Expiration (1h)
}
```

Estrutura do token:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEyMzQ1Njc4OTAiLCJlbWFpbCI6InVzdWFyaW9AdGVzdGUuY29tIiwibmFtZSI6IlVzdcOhcmlvIFRlc3RlIiwiaWF0IjoxNjk4NzY1NDMyLCJleHAiOjE2OTg3NjkwMzJ9.signature
```

## 🔧 API do Mobile Bridge

### Obter Token de Autenticação

```javascript
// Na WebView
const response = await window.MobileBridge.call('getAuthToken');
console.log('Token:', response.token);
console.log('User:', response.user);
```

Resposta:
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "user_1234567890",
    "email": "usuario@teste.com",
    "name": "Usuário Teste"
  }
}
```

### Fazer Logout

```javascript
// Na WebView
const response = await window.MobileBridge.call('logout');
if (response.success) {
  console.log('Logout realizado com sucesso');
}
```

## 🛠️ Desenvolvimento

### Adicionar Novo Usuário de Teste

Edite `src/services/AuthService.ts:67-70`:

```typescript
const TEST_USERS = [
  { email: 'usuario@teste.com', password: 'senha123', name: 'Usuário Teste' },
  { email: 'admin@teste.com', password: 'admin123', name: 'Admin Teste' },
  // Adicione aqui
  { email: 'novo@teste.com', password: 'senha456', name: 'Novo Usuário' },
];
```

### Customizar Duração do Token

Edite `src/services/AuthService.ts:91`:

```typescript
// Alterar de 1 hora para 2 horas
const accessToken = JWTGenerator.generateToken(userId, testUser.email, testUser.name, 2);
```

### Integrar com Backend Real

Para usar um backend real, substitua a validação mock em `AuthService.loginWithEmail()`:

```typescript
// Remover validação TEST_USERS
const response = await fetch('https://api.example.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { user, tokens } = await response.json();
```

## 🔒 Segurança

### Armazenamento Seguro

Os tokens são armazenados usando `SecureStorage`, que usa:
- **iOS**: Keychain
- **Android**: EncryptedSharedPreferences

### Validação de Token

O token é validado automaticamente:
- Ao iniciar o app
- Antes de cada requisição
- Refresh automático quando expira

### Proteção da WebView

A WebView só é carregada após autenticação bem-sucedida:

```typescript
if (!isAuthenticated) {
  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}

return <TurboWebView source={{ uri: webAppUrl }} />;
```

## 📱 Uso na WebView

### Incluir Token em Requisições HTTP

```javascript
// Obter token
const { token } = await window.MobileBridge.call('getAuthToken');

// Usar em requisições
fetch('https://api.example.com/products', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Verificar Autenticação

```javascript
const { user } = await window.MobileBridge.call('getAuthToken');

if (user) {
  console.log('Usuário autenticado:', user.name);
} else {
  console.log('Não autenticado');
  // Pode chamar logout para forçar novo login
  await window.MobileBridge.call('logout');
}
```

## 🧪 Testes

### Testar Login

1. Inicie o app
2. Será exibida a tela de login
3. Clique em "💡 Usar credenciais de teste"
4. Clique em "Entrar"
5. Deve redirecionar para a WebView

### Testar Persistência

1. Faça login
2. Feche o app completamente
3. Abra o app novamente
4. Deve ir direto para a WebView (sem login)

### Testar Logout

No console do React Native DevTools:

```javascript
// Fazer logout programaticamente
await AuthService.logout();
```

Ou via WebView:

```javascript
await window.MobileBridge.call('logout');
```

## 📝 Notas

- **Produção**: Em produção, use uma biblioteca JWT robusta como `jsonwebtoken`
- **HTTPS**: Sempre use HTTPS para transmitir tokens
- **Expiração**: Tokens expiram após 1 hora (configurável)
- **Refresh**: Tokens de refresh são válidos por 7 dias
- **Biometria**: Suporte a biometria pode ser adicionado (comentado no código)

## 🔄 Próximos Passos

1. Integrar com backend real
2. Implementar refresh token automático
3. Adicionar autenticação biométrica
4. Adicionar login social (Google, Apple)
5. Implementar "Lembrar-me" com SecureStorage
6. Adicionar recuperação de senha
7. Implementar 2FA (autenticação de dois fatores)
