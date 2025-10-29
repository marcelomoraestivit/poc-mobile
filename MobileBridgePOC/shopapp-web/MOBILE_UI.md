# ShopApp - Interface Mobile Nativa

Este projeto foi refatorado para ter uma aparência e comportamento de **aplicativo mobile nativo** usando **Mantine**.

## 🎨 O que mudou?

### Componentes Refatorados

1. **HomePage**
   - Banner em Swiper (carrossel touch)
   - Grid de produtos em 2 colunas
   - Cards mobile-first com imagens otimizadas
   - Botão wishlist flutuante

2. **ProductPage**
   - NavBar nativa com botão voltar
   - Imagem em tela cheia (375px de altura)
   - Seleção de cores com botões circulares
   - Stepper para quantidade
   - Barra de ação fixa inferior
   - Toast notifications

3. **CartPage**
   - NavBar com contador de itens
   - Lista de produtos com swipe-friendly layout
   - Dialog nativo para confirmações
   - NoticeBar para frete grátis
   - Card de resumo fixo inferior
   - Empty state design

4. **App Navigation**
   - TabBar inferior (estilo iOS/Android)
   - Badge com contador no carrinho
   - Ícones nativos (Ant Design Icons)
   - Safe area support para iOS

## 📱 Componentes Mantine Usados

- **Carousel** - Carrossel de banners com indicadores
- **Card** - Cards de produtos e informações
- **SimpleGrid** - Layout responsivo em grid
- **Badge** - Badges e etiquetas
- **Button** - Botões com variantes
- **ActionIcon** - Ícones clicáveis
- **Indicator** - Contador de notificações
- **NumberInput** - Controle numérico
- **Paper** - Containers com sombra
- **Group/Stack** - Layouts flexbox
- **Text** - Tipografia com props
- **Chip** - Seleção de opções
- **Alert** - Avisos e notificações
- **Modals** - Modais de confirmação
- **Notifications** - Toasts de feedback
- **AppShell** - Layout principal

## 🚀 Como executar

### Modo Desenvolvimento:
```bash
npm run dev
```
Acesse: http://localhost:5173

### Build para produção:
```bash
npm run build
```

### Preview da build:
```bash
npm run preview
```

## 🎯 Características Mobile-Native

### Visual
- ✅ Design mobile-first (375x812px - iPhone)
- ✅ Typography nativa (-apple-system, Roboto)
- ✅ Cores e espaçamentos nativos
- ✅ Bordas arredondadas (12px, 8px)
- ✅ Sombras sutis para depth
- ✅ Safe area support (iOS notch)

### Interação
- ✅ Touch-friendly (tap targets 44px+)
- ✅ Active states em todos clicáveis
- ✅ Smooth scrolling
- ✅ Swipe gestures (Swiper)
- ✅ Haptic-like feedback (scale animations)
- ✅ Disable text selection

### Navegação
- ✅ TabBar inferior fixa
- ✅ NavBar superior com back button
- ✅ Modais nativos (Dialog)
- ✅ Transitions suaves

### Performance
- ✅ Lazy loading de imagens
- ✅ Virtualized lists (Ant Design)
- ✅ Otimização de re-renders
- ✅ CSS optimizations

## 🔧 Estrutura de Estilos

```
index.css          → Estilos globais mobile
App.css            → Layout principal + TabBar
HomePage.css       → Home com Swiper e Grid
ProductPage.css    → Detalhes do produto
CartPage.css       → Carrinho com lista
```

## 📦 Dependências Principais

```json
{
  "@mantine/core": "^7.17.8",        // UI Components Core
  "@mantine/hooks": "^7.17.8",       // React Hooks
  "@mantine/carousel": "^7.17.8",    // Carousel Component
  "@mantine/notifications": "^7.17.8", // Notifications System
  "@mantine/modals": "^7.17.8",      // Modals System
  "@tabler/icons-react": "latest",   // Ícones
  "react": "^19.1.1",                // React
  "react-dom": "^19.1.1",            // React DOM
  "react-router-dom": "^7.9.4"       // Routing
}
```

## 🎨 Paleta de Cores (Mantine Default)

```css
Primary (Blue): #228be6
Red: #fa5252
Green: #51cf66
Background: #f8f9fa
Text: #000
Dimmed Text: #868e96
Border: #e9ecef, #dee2e6
```

## 📱 Viewport Configuration

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

## ✨ Próximos Passos (Sugestões)

- [ ] Adicionar Pull-to-refresh na HomePage
- [ ] Implementar Infinite scroll
- [ ] Adicionar animações de transição de página
- [ ] Implementar gestos de swipe para voltar
- [ ] Adicionar suporte a Dark Mode
- [ ] Otimizar imagens com lazy loading
- [ ] Adicionar PWA support
- [ ] Implementar cache offline
