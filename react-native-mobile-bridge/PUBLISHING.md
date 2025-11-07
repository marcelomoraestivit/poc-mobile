# Guia de Publicação

## Como publicar a biblioteca no NPM

### 1. Preparação

Antes de publicar, certifique-se de que:

```bash
# 1. Todas as dependências estão instaladas
npm install

# 2. O código compila sem erros
npm run build

# 3. Testes passam (se houver)
npm test

# 4. Lint está ok
npm run lint
```

### 2. Versioning

Atualize a versão no `package.json`:

```bash
# Patch version (bug fixes): 1.0.0 -> 1.0.1
npm version patch

# Minor version (new features): 1.0.0 -> 1.1.0
npm version minor

# Major version (breaking changes): 1.0.0 -> 2.0.0
npm version major
```

### 3. Build

```bash
npm run build
```

Isso irá gerar a pasta `lib/` com o código compilado.

### 4. Testar localmente

Antes de publicar, teste a biblioteca localmente:

```bash
# Na pasta da biblioteca
npm pack

# Isso cria um arquivo .tgz
# Em outro projeto, instale:
npm install /path/to/react-native-mobile-bridge-1.0.0.tgz
```

### 5. Publicar no NPM

```bash
# Login no NPM (primeira vez)
npm login

# Publicar
npm publish

# Ou para versões beta/alpha
npm publish --tag beta
```

### 6. Verificar publicação

```bash
# Ver informações do package
npm info react-native-mobile-bridge

# Instalar em outro projeto
npm install react-native-mobile-bridge
```

## Uso Local (sem publicar)

### Método 1: npm link

```bash
# Na pasta da biblioteca
npm run build
npm link

# No projeto que vai usar
npm link react-native-mobile-bridge
```

### Método 2: Local path

```bash
# No projeto que vai usar
npm install /caminho/completo/para/react-native-mobile-bridge
```

### Método 3: Git dependency

```json
// package.json do seu projeto
{
  "dependencies": {
    "react-native-mobile-bridge": "git+https://github.com/usuario/react-native-mobile-bridge.git"
  }
}
```

## Estrutura de Arquivos Publicados

O que será publicado (definido em `.npmignore`):

```
react-native-mobile-bridge/
├── lib/                    # Código compilado (gerado por tsc)
│   ├── index.js
│   ├── index.d.ts
│   ├── bridge/
│   ├── components/
│   ├── network/
│   ├── storage/
│   ├── sync/
│   └── utils/
├── package.json
├── README.md
├── LICENSE
└── EXAMPLE.md
```

O que **não** será publicado:

- `src/` (código fonte TypeScript)
- `node_modules/`
- Arquivos de configuração (tsconfig.json, etc.)
- Arquivos de teste

## Checklist antes de publicar

- [ ] Versão atualizada em package.json
- [ ] Changelog atualizado (se houver)
- [ ] README atualizado
- [ ] Build compilado sem erros
- [ ] Testes passando
- [ ] Dependências corretas em package.json
- [ ] .npmignore configurado corretamente
- [ ] Testado localmente em um projeto

## Atualização contínua

Para manter a biblioteca atualizada:

1. **Fazer alterações no código fonte** (`src/`)
2. **Rebuild**: `npm run build`
3. **Atualizar versão**: `npm version patch/minor/major`
4. **Publicar**: `npm publish`

## Troubleshooting

### Erro: "You do not have permission to publish"

```bash
# Verificar quem está logado
npm whoami

# Re-login
npm logout
npm login
```

### Erro: "package name already exists"

Altere o nome em `package.json` para algo único:

```json
{
  "name": "@seu-usuario/react-native-mobile-bridge"
}
```

### Build não atualiza

```bash
# Limpar e rebuildar
rm -rf lib/
npm run build
```

## Private NPM Registry

Se você usa um registry privado (como npm enterprise ou Verdaccio):

```bash
# Configurar registry
npm config set registry https://seu-registry.com

# Publicar
npm publish --registry https://seu-registry.com
```

## Scoped Packages

Para publicar como scoped package (@seu-org/nome):

```json
// package.json
{
  "name": "@seu-org/react-native-mobile-bridge",
  "publishConfig": {
    "access": "public"
  }
}
```

```bash
npm publish --access public
```
