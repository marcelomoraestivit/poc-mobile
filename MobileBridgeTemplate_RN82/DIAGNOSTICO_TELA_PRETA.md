# Diagnóstico: Tela Preta Persistente

## Problema
A tela fica completamente preta, mesmo com o app renderizando corretamente segundo os logs.

## Evidências dos Logs

### App Complexo (App.TestHost.tsx)
```
[App.TestHost] Component mounted
[App.TestHost] Initializing AuthService...
[App.TestHost] Authentication status: true
[App.TestHost] User authenticated: usuario@teste.com
[App.TestHost] Auth check completed
[App.TestHost] Rendering main app, currentScreen: home
[App.TestHost] Rendering HomeScreen
```

### App Simplificado (App.TestHost.Simple.tsx)
```
[Simple] App rendering
```

## Conclusão
O código React está **executando perfeitamente**, mas nada aparece na tela. Isso indica um **problema de renderização nativa** no Android.

## Possíveis Causas

### 1. Problema com a Activity Principal
O `MainActivity.kt` pode estar com configuração incorreta que impede a renderização.

### 2. Problema com o ReactRootView
A view raiz do React pode não estar sendo anexada corretamente à activity.

### 3. Problema com o Fabric (New Architecture)
Os logs mostram `"fabric":true`, indicando que o app está usando a nova arquitetura do React Native, que pode ter problemas de compatibilidade.

### 4. Problema com Overlay/Window
Pode haver uma overlay transparente ou window bloqueando a visualização.

### 5. Build Nativo Corrompido
O build nativo pode estar usando cache antigo ou ter sido corrompido.

## Soluções a Tentar

### Solução 1: Desabilitar Fabric (Nova Arquitetura)
Editar `android/gradle.properties`:
```properties
# Desabilitar nova arquitetura
newArchEnabled=false
```

### Solução 2: Verificar MainActivity.kt
Arquivo: `android/app/src/main/java/com/mobilebridgeapp/MainActivity.kt`

Deve ter:
```kotlin
override fun createReactActivityDelegate(): ReactActivityDelegate {
    return MainActivityDelegate(this, mainComponentName)
}

class MainActivityDelegate(activity: ReactActivity, mainComponentName: String) :
    ReactActivityDelegate(activity, mainComponentName) {

    override fun getLaunchOptions(): Bundle? {
        val bundle = Bundle()
        // Configurações adicionais se necessário
        return bundle
    }
}
```

### Solução 3: Limpar Completamente o Projeto

```bash
# 1. Limpar cache npm
rm -rf node_modules
npm install

# 2. Limpar build Android
cd android
./gradlew clean
cd ..

# 3. Limpar cache Metro
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*
rm -rf /tmp/react-*

# 4. Desinstalar app do dispositivo
adb uninstall com.mobilebridgeapp

# 5. Reconstruir e instalar
npx react-native run-android
```

### Solução 4: Verificar AndroidManifest.xml
Arquivo: `android/app/src/main/AndroidManifest.xml`

Verificar se tem:
```xml
<application
    android:name=".MainApplication"
    android:theme="@style/AppTheme">

    <activity
        android:name=".MainActivity"
        android:windowSoftInputMode="adjustResize"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode">
```

### Solução 5: Verificar AppTheme
Arquivo: `android/app/src/main/res/values/styles.xml`

Deve ter fundo branco ou transparente:
```xml
<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
    <item name="android:windowBackground">@android:color/white</item>
</style>
```

### Solução 6: Testar com App.tsx Original
```bash
# No index.js, trocar para:
import App from './App';
```

E testar com o App.tsx original que vem com React Native.

### Solução 7: Verificar se há erro no Logcat
```bash
adb logcat *:E | grep -i "error\|exception\|fatal"
```

## Próximos Passos

1. ✅ Criado app simplificado - **FALHOU** (tela continua preta)
2. ⏳ Reconstruir app Android completamente
3. ⏳ Verificar MainActivity.kt
4. ⏳ Desabilitar Fabric se necessário
5. ⏳ Verificar styles.xml

## Comandos de Diagnóstico

```bash
# Ver todos os erros
adb logcat *:E

# Ver específico do React Native
adb logcat ReactNative:V ReactNativeJS:V *:S

# Ver renderização
adb logcat SurfaceFlinger:V *:S

# Verificar se a Surface está sendo criada
adb logcat | grep -i "surface"

# Screenshot para ver o que o Android vê
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

## Status Atual
🔴 **PROBLEMA NÃO RESOLVIDO**
- Código React: ✅ Funcionando
- Renderização Nativa: ❌ **FALHA**

Próximo: Reconstruir app Android completamente.
