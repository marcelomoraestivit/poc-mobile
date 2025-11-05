# Build de Produção (Release)

## Problema: Caminho muito longo no Windows

O build de produção está falando devido a limitação do Windows com caminhos > 260 caracteres.

**Erro:**
```
ninja: error: Filename longer than 260 characters
```

## Soluções

### Opção 1: Habilitar Caminhos Longos no Windows (Recomendado)

#### Passo 1: Habilitar no Registro do Windows

1. Abra **PowerShell como Administrador**
2. Execute:

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
    -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

#### Passo 2: Habilitar no Git

```bash
git config --global core.longpaths true
```

#### Passo 3: Reiniciar o Terminal

Feche e abra novamente o terminal.

#### Passo 4: Tentar Build Novamente

```bash
npm run android -- --mode=release
```

---

### Opção 2: Mover Projeto para Caminho Mais Curto (Workaround)

Se a Opção 1 não funcionar, mova o projeto:

**De:**
```
C:\github_tivit\poc-mobile\MobileBridgeTemplate_RN82
```

**Para:**
```
C:\rn\app
```

```bash
# Mover projeto
cd C:\
mkdir rn
xcopy "C:\github_tivit\poc-mobile\MobileBridgeTemplate_RN82" "C:\rn\app" /E /I /H

# Navegar para novo local
cd C:\rn\app

# Reinstalar dependências
npm install

# Limpar cache
npm run android -- --reset-cache

# Build de release
npm run android -- --mode=release
```

---

### Opção 3: Testar Logs em Desenvolvimento (Mais Fácil)

Você pode **simular** o comportamento de produção em modo desenvolvimento:

#### Criar arquivo `.env`

```bash
# .env
DEV_MODE=false
```

#### Modificar Logger.ts temporariamente

```typescript
// Antes:
const isDevelopment = __DEV__;

// Depois (para testar):
const isDevelopment = false; // Força modo produção
```

Assim você pode testar como os logs se comportam sem fazer build de release!

**Depois de testar, reverta:**
```typescript
const isDevelopment = __DEV__;
```

---

## Como Verificar se Logs Foram Removidos

### Em Desenvolvimento
```bash
npm run android
```

Você verá logs no console Metro:
```
[Auth] Service initialized, user: usuario@teste.com
[App.TestHost] Component mounted
```

### Em Produção (Release Build)
```bash
npm run android -- --mode=release
```

**NÃO** verá logs informativos no logcat (apenas erros críticos se houver).

Para verificar:
```bash
adb logcat | grep -i "Auth\|TestHost"
```

Não deverá aparecer nada (exceto erros).

---

## APK de Produção

### Gerar APK Release

```bash
cd android
./gradlew assembleRelease
```

APK gerado em:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Instalar APK

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## Bundle AAB para Google Play

```bash
cd android
./gradlew bundleRelease
```

Bundle gerado em:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## Configuração de Assinatura (Signing)

Para gerar APK/AAB assinado para produção, configure:

### 1. Gerar Keystore

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configurar gradle.properties

Adicione em `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=****
MYAPP_RELEASE_KEY_PASSWORD=****
```

### 3. Configurar build.gradle

Em `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

---

## Resumo: Testar Sistema de Logs

### Método Rápido (Sem Build Release)

1. Edite `src/utils/Logger.ts`:
   ```typescript
   const isDevelopment = false; // Forçar modo produção
   ```

2. Recarregue app (R+R)

3. Verifique que logs sumiram

4. Reverta mudança:
   ```typescript
   const isDevelopment = __DEV__;
   ```

### Método Completo (Build Release)

1. Resolva problema de caminho longo (Opção 1 ou 2)
2. Execute: `npm run android -- --mode=release`
3. Verifique logcat (não deve ter logs informativos)

---

## Verificar Modo DEV/PROD

No código:

```typescript
import { Logger } from './src/utils/Logger';

if (__DEV__) {
  Logger.log('Modo: DESENVOLVIMENTO'); // ✅ Aparece em dev
} else {
  Logger.log('Modo: PRODUÇÃO'); // ❌ Não aparece em prod
}
```

---

## Avisos (Warnings)

Os warnings de deprecated que aparecem são **normais** e vêm de bibliotecas third-party (react-native-webview, safe-area-context, etc).

Eles **NÃO afetam** o funcionamento do app. São apenas avisos de que as bibliotecas usam APIs antigas que serão removidas em versões futuras do React Native.

---

## Troubleshooting

### Build muito lento
```bash
# Limpar cache
cd android
./gradlew clean

# Build incremental desabilitado
./gradlew assembleRelease --no-build-cache
```

### Erro de memória
Adicione em `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### Erro de NDK/CMake
Certifique-se que o NDK está instalado:
- Abra Android Studio
- Tools → SDK Manager → SDK Tools
- Marque "NDK (Side by side)" e "CMake"
- Apply

---

**Recomendação:** Use a **Opção 3** (testar em dev mode) para verificar rapidamente como os logs se comportam sem fazer build de release!
