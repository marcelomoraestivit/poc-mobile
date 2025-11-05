#!/bin/bash
echo "=== Verificando status do App.TestHost.tsx ==="
echo ""
echo "1. Verificando index.js:"
grep -n "App.TestHost" index.js
echo ""
echo "2. Verificando se EmbeddedWebApp está exportado:"
grep -n "export default" App.Embedded.tsx
echo ""
echo "3. Verificando se LoginScreen está exportado:"
grep -n "export default" src/screens/LoginScreen.tsx
echo ""
echo "4. Verificando se AuthService existe:"
ls -la src/services/AuthService.ts 2>&1
echo ""
echo "5. Metro Bundler Status:"
pgrep -f "react-native start" || echo "Metro não está rodando"
