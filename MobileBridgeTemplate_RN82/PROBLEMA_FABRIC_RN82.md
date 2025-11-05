# 🔴 Problema: Fabric Forçado no React Native 0.82

## Descoberta Crítica

Mesmo com `newArchEnabled=false` no `gradle.properties`, os logs mostram:

```javascript
Running "MobileBridgeApp" with {"fabric":true}
```

Isso indica que o **React Native 0.82 pode estar forçando o uso do Fabric**, ignorando a configuração.

## Evidências

### Configuração Atual:
```properties
# android/gradle.properties
newArchEnabled=false  ✅ CORRETO
```

### Logs do App:
```
ReactNativeJS: Running "MobileBridgeApp" with {"fabric":true}  ❌ INCORRETO!
```

### Erros Relacionados:
```
E unknown:FabricUIManager: IllegalStateException: Trying to stop surface that hasn't started yet
E unknown:ReactHost: Surface stopped
E unknown:SurfaceMountingManager: Surface was stopped
```

## Possíveis Causas

### 1. Bug do React Native 0.82
O RN 0.82 pode ter um bug que força Fabric mesmo quando desabilitado.

### 2. Cache de Build Persistente
O build pode estar usando binários cacheados da configuração anterior.

### 3. Configuração no Código Nativo
Pode haver código em `MainActivity.kt` ou `MainApplication.kt` forçando Fabric.

## Soluções a Tentar

### Solução 1: Limpar Build Completamente (TENTAR PRIMEIRO)

```bash
bash fix-fabric-final.sh
```

Este script:
- Limpa TODOS os caches (Metro, Gradle, Android)
- Mata TODOS os processos
- Build com flag explícita `-PnewArchEnabled=false`
- Reinstala o app

### Solução 2: Verificar MainActivity.kt

Editar `android/app/src/main/java/com/mobilebridgeapp/MainActivity.kt`:

```kotlin
package com.mobilebridgeapp

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "MobileBridgeApp"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, false) // ← false aqui!
}
```

O terceiro parâmetro `false` desabilita Fabric explicitamente.

### Solução 3: Downgrade para React Native 0.71

Se nada funcionar, o RN 0.82 pode ter um bug fundamental. Downgrade:

```bash
# Backup do projeto
cp -r . ../MobileBridgeTemplate_RN82_backup

# Downgrade
npm install react-native@0.71.19
npm install react@18.2.0

# Rebuild
npx react-native run-android
```

### Solução 4: Desabilitar Hermes

Fabric pode estar vinculado ao Hermes. Tentar desabilitar:

```properties
# android/gradle.properties
hermesEnabled=false
```

Depois rebuild.

### Solução 5: Usar Arquitetura Paper Explicitamente

Adicionar ao `build.gradle`:

```gradle
react {
    enableHermes = false
    enableNewArchitecture = false
}
```

## Como Verificar se Funcionou

### Após Build, Verifique os Logs:

```bash
adb logcat ReactNativeJS:V *:S | grep -i fabric
```

**Esperado (SUCCESS):**
```
# NENHUMA mensagem sobre fabric
```

**Atual (FALHA):**
```
Running "MobileBridgeApp" with {"fabric":true}
```

### Verificar Inicialização:

```bash
adb logcat | grep "Running \"MobileBridgeApp\""
```

**Deve mostrar:**
```javascript
Running "MobileBridgeApp" with {"rootTag":1,"initialProps":{},"fabric":false}
                                                                         ^^^^^^
```

## Próximos Passos

1. **Executar:** `bash fix-fabric-final.sh`
2. **Aguardar** build completar (3-5 min)
3. **Verificar** logs se `fabric:false`
4. **Se ainda true**, editar `MainActivity.kt`
5. **Se ainda true**, downgrade para RN 0.71

## Informação Importante

O React Native 0.82 pode ter ativado Fabric por padrão de forma que não pode ser desabilitada facilmente. Isso é um problema conhecido em algumas versões.

**Referências:**
- https://github.com/facebook/react-native/issues
- React Native New Architecture: https://reactnative.dev/docs/new-architecture-intro

## Status Atual

🔴 **Fabric FORÇADO mesmo com newArchEnabled=false**

Próxima ação: Executar `fix-fabric-final.sh`

Se falhar: Considerar downgrade para RN 0.71 ou 0.72
