# Mobile Bridge API Documentation

## Overview

The Mobile Bridge API provides a bidirectional communication channel between the React web application and the React Native container. This document describes all available handlers, events, and data structures.

## Table of Contents

- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
  - [Navigation](#navigation)
  - [Cart Management](#cart-management)
  - [Wishlist Management](#wishlist-management)
  - [Orders](#orders)
  - [Notifications](#notifications)
  - [Storage](#storage)
  - [Device & Network](#device--network)
- [Events](#events)
- [Data Types](#data-types)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Getting Started

### Checking Bridge Availability

Always check if the Mobile Bridge is available before using it:

```typescript
if (window.WebBridge) {
  // Bridge is available
  await window.WebBridge.sendToNative('handlerName', payload);
} else {
  // Fallback for web-only mode
  console.warn('Mobile Bridge not available');
}
```

### Basic Usage Pattern

```typescript
// Sending a message to native
const result = await window.WebBridge.sendToNative('handlerName', {
  param1: 'value1',
  param2: 'value2'
});

// Listening to events from native
window.addEventListener('eventName', (event) => {
  const data = event.detail;
  console.log('Event received:', data);
});
```

## Core Concepts

### Message Flow

```
Web App                Mobile Bridge              Native Handler
   |                         |                          |
   |--sendToNative()-------->|                          |
   |                         |--registerHandler()------>|
   |                         |                          |
   |                         |<-------Promise-----------|
   |<------resolve()---------|                          |
   |                         |                          |
```

### Promise-Based API

All `sendToNative` calls return a Promise that resolves with the handler's response:

```typescript
try {
  const result = await window.WebBridge.sendToNative('getCart', {});
  console.log('Cart:', result);
} catch (error) {
  console.error('Failed to get cart:', error);
}
```

### Event System

Native code can emit events that the web app listens to:

```typescript
// Native emits event
window.WebBridge.emit('cartUpdated', { count: 5, total: 199.99 });

// Web listens
window.addEventListener('cartUpdated', (event) => {
  updateCartUI(event.detail);
});
```

## API Reference

### Navigation

#### `navigate`

Navigate to a specific page in the web application.

**Parameters:**
```typescript
{
  page: 'home' | 'product' | 'cart' | 'checkout' | 'wishlist' | 'search';
  params?: {
    id?: string;        // Product ID for product page
    category?: string;  // Category filter for home page
    query?: string;     // Search query for search page
  };
}
```

**Returns:**
```typescript
{
  success: boolean;
  url: string;  // The constructed URL
}
```

**Example:**
```typescript
// Navigate to product page
await window.WebBridge.sendToNative('navigate', {
  page: 'product',
  params: { id: 'prod1' }
});

// Navigate to home with category filter
await window.WebBridge.sendToNative('navigate', {
  page: 'home',
  params: { category: 'electronics' }
});
```

---

### Cart Management

#### `addToCart`

Add a product to the shopping cart.

**Parameters:**
```typescript
{
  product: Product;           // Full product object
  quantity: number;           // Quantity to add (default: 1)
  selectedColor?: string;     // Selected color ID
  selectedSize?: string;      // Selected size ID
}
```

**Returns:**
```typescript
{
  success: boolean;
  item: CartItem;
  cart: {
    items: CartItem[];
    count: number;
    total: number;
  };
}
```

**Example:**
```typescript
const result = await window.WebBridge.sendToNative('addToCart', {
  product: {
    id: 'prod1',
    name: 'Smartphone XYZ',
    price: 1299.99,
    // ... other product fields
  },
  quantity: 2,
  selectedColor: 'blue',
  selectedSize: 'medium'
});

console.log(`Added ${result.item.quantity} items. Cart total: ${result.cart.total}`);
```

**Triggers Event:** `cartUpdated`

---

#### `getCart`

Retrieve the current cart contents.

**Parameters:**
```typescript
{} // No parameters required
```

**Returns:**
```typescript
{
  items: CartItem[];
  count: number;        // Total number of items
  subtotal: number;     // Sum before discount
  discount: number;     // Discount amount (from coupon)
  total: number;        // Final total (subtotal - discount)
  couponCode?: string;  // Applied coupon code
}
```

**Example:**
```typescript
const cart = await window.WebBridge.sendToNative('getCart', {});
console.log(`You have ${cart.count} items totaling ${cart.total}`);
```

---

#### `updateCartQuantity`

Update the quantity of an item in the cart.

**Parameters:**
```typescript
{
  productId: string;
  quantity: number;          // New quantity (0 to remove)
  selectedColor?: string;    // Required if product has color variants
  selectedSize?: string;     // Required if product has size variants
}
```

**Returns:**
```typescript
{
  success: boolean;
  cart: {
    items: CartItem[];
    count: number;
    total: number;
  };
}
```

**Example:**
```typescript
// Increase quantity
await window.WebBridge.sendToNative('updateCartQuantity', {
  productId: 'prod1',
  quantity: 3,
  selectedColor: 'blue'
});

// Remove item (set quantity to 0)
await window.WebBridge.sendToNative('updateCartQuantity', {
  productId: 'prod1',
  quantity: 0
});
```

**Triggers Event:** `cartUpdated`

---

#### `removeFromCart`

Remove a specific item from the cart.

**Parameters:**
```typescript
{
  productId: string;
  selectedColor?: string;    // Required if product has color variants
  selectedSize?: string;     // Required if product has size variants
}
```

**Returns:**
```typescript
{
  success: boolean;
  cart: {
    items: CartItem[];
    count: number;
    total: number;
  };
}
```

**Example:**
```typescript
await window.WebBridge.sendToNative('removeFromCart', {
  productId: 'prod1',
  selectedColor: 'blue',
  selectedSize: 'medium'
});
```

**Triggers Event:** `cartUpdated`

---

#### `clearCart`

Remove all items from the cart.

**Parameters:**
```typescript
{} // No parameters required
```

**Returns:**
```typescript
{
  success: boolean;
}
```

**Example:**
```typescript
await window.WebBridge.sendToNative('clearCart', {});
```

**Triggers Event:** `cartUpdated`

---

#### `applyCoupon`

Apply a discount coupon to the cart.

**Parameters:**
```typescript
{
  code: string;  // Coupon code (e.g., "SAVE10", "FREESHIP")
}
```

**Returns:**
```typescript
{
  success: boolean;
  discount: number;      // Discount amount (if successful)
  message: string;       // Success or error message
  couponCode?: string;   // Applied coupon code
}
```

**Example:**
```typescript
const result = await window.WebBridge.sendToNative('applyCoupon', {
  code: 'SAVE10'
});

if (result.success) {
  console.log(`Saved ${result.discount}! ${result.message}`);
} else {
  console.log(`Error: ${result.message}`);
}
```

**Built-in Coupons:**
- `SAVE10` - 10% discount
- `SAVE20` - 20% discount
- `FREESHIP` - Free shipping

**Triggers Event:** `cartUpdated`

---

### Wishlist Management

#### `toggleWishlist`

Add or remove a product from the wishlist.

**Parameters:**
```typescript
{
  product: Product;  // Full product object
}
```

**Returns:**
```typescript
{
  inWishlist: boolean;  // true if added, false if removed
  count: number;        // Total wishlist items
}
```

**Example:**
```typescript
const result = await window.WebBridge.sendToNative('toggleWishlist', {
  product: {
    id: 'prod1',
    name: 'Smartphone XYZ',
    price: 1299.99,
    // ... other product fields
  }
});

console.log(result.inWishlist ? 'Added to wishlist' : 'Removed from wishlist');
```

**Triggers Event:** `wishlistUpdated`

---

#### `getWishlist`

Retrieve all items in the wishlist.

**Parameters:**
```typescript
{} // No parameters required
```

**Returns:**
```typescript
{
  items: Product[];
  count: number;
}
```

**Example:**
```typescript
const wishlist = await window.WebBridge.sendToNative('getWishlist', {});
console.log(`You have ${wishlist.count} items in your wishlist`);
```

---

#### `isInWishlist`

Check if a product is in the wishlist.

**Parameters:**
```typescript
{
  productId: string;
}
```

**Returns:**
```typescript
{
  inWishlist: boolean;
}
```

**Example:**
```typescript
const result = await window.WebBridge.sendToNative('isInWishlist', {
  productId: 'prod1'
});

const icon = result.inWishlist ? '❤️' : '🤍';
```

---

### Orders

#### `createOrder`

Create a new order from the current cart.

**Parameters:**
```typescript
{
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  payment: {
    method: 'credit_card' | 'pix';
    cardNumber?: string;      // Required for credit_card
    cardName?: string;        // Required for credit_card
    cardExpiry?: string;      // Required for credit_card
    cardCVV?: string;         // Required for credit_card
    installments?: string;    // Optional (default: '1')
  };
}
```

**Returns:**
```typescript
{
  success: boolean;
  orderId: string;       // Generated order ID
  order?: {
    id: string;
    items: CartItem[];
    total: number;
    address: AddressData;
    payment: PaymentData;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
    createdAt: number;   // Timestamp
  };
  message?: string;      // Error message if failed
}
```

**Example:**
```typescript
const result = await window.WebBridge.sendToNative('createOrder', {
  address: {
    cep: '12345-678',
    street: 'Rua Principal',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP'
  },
  payment: {
    method: 'credit_card',
    cardNumber: '1234567890123456',
    cardName: 'JOAO SILVA',
    cardExpiry: '12/25',
    cardCVV: '123',
    installments: '3'
  }
});

if (result.success) {
  console.log(`Order created: ${result.orderId}`);
}
```

**Triggers Event:** `cartUpdated` (cart is cleared)

---

### Notifications

#### `showNotification`

Display a native toast notification.

**Parameters:**
```typescript
{
  title: string;
  message: string;
  color: 'green' | 'red' | 'blue' | 'yellow';
}
```

**Color Mapping:**
- `green` → Success notification
- `red` → Error notification
- `blue` → Info notification
- `yellow` → Warning notification

**Returns:**
```typescript
{
  success: boolean;
}
```

**Example:**
```typescript
// Success notification
await window.WebBridge.sendToNative('showNotification', {
  title: 'Sucesso!',
  message: 'Produto adicionado ao carrinho',
  color: 'green'
});

// Error notification
await window.WebBridge.sendToNative('showNotification', {
  title: 'Erro',
  message: 'Falha ao processar pagamento',
  color: 'red'
});
```

---

### Storage

#### `setStorageItem`

Store data in native persistent storage (AsyncStorage).

**Parameters:**
```typescript
{
  key: string;
  value: any;  // Will be JSON stringified
}
```

**Returns:**
```typescript
{
  success: boolean;
}
```

**Example:**
```typescript
await window.WebBridge.sendToNative('setStorageItem', {
  key: 'userPreferences',
  value: {
    theme: 'dark',
    language: 'pt-BR',
    notifications: true
  }
});
```

---

#### `getStorageItem`

Retrieve data from native persistent storage.

**Parameters:**
```typescript
{
  key: string;
}
```

**Returns:**
```typescript
{
  value: any;  // Parsed JSON value, or null if not found
}
```

**Example:**
```typescript
const result = await window.WebBridge.sendToNative('getStorageItem', {
  key: 'userPreferences'
});

const preferences = result.value || { theme: 'light' };
```

---

#### `removeStorageItem`

Remove an item from native persistent storage.

**Parameters:**
```typescript
{
  key: string;
}
```

**Returns:**
```typescript
{
  success: boolean;
}
```

**Example:**
```typescript
await window.WebBridge.sendToNative('removeStorageItem', {
  key: 'temporaryData'
});
```

---

### Device & Network

#### `getDeviceInfo`

Get information about the device.

**Parameters:**
```typescript
{} // No parameters required
```

**Returns:**
```typescript
{
  platform: 'ios' | 'android';
  version: string;      // OS version
  isTablet: boolean;
}
```

**Example:**
```typescript
const device = await window.WebBridge.sendToNative('getDeviceInfo', {});
console.log(`Running on ${device.platform} ${device.version}`);

if (device.isTablet) {
  // Show tablet-optimized layout
}
```

---

#### `getNetworkStatus`

Get the current network connectivity status.

**Parameters:**
```typescript
{} // No parameters required
```

**Returns:**
```typescript
{
  isOnline: boolean;
  timestamp: number;  // When status was checked
}
```

**Example:**
```typescript
const status = await window.WebBridge.sendToNative('getNetworkStatus', {});

if (!status.isOnline) {
  showOfflineWarning();
}
```

---

## Events

Events are emitted by the native layer and can be listened to in the web app.

### `cartUpdated`

Fired whenever the cart changes (add, remove, update, clear, apply coupon).

**Event Detail:**
```typescript
{
  items: CartItem[];
  count: number;
  total: number;
  subtotal: number;
  discount: number;
  couponCode?: string;
}
```

**Example:**
```typescript
window.addEventListener('cartUpdated', (event) => {
  const { count, total } = event.detail;
  updateCartBadge(count);
  updateCartTotal(total);
});
```

---

### `wishlistUpdated`

Fired whenever the wishlist changes.

**Event Detail:**
```typescript
{
  items: Product[];
  count: number;
}
```

**Example:**
```typescript
window.addEventListener('wishlistUpdated', (event) => {
  const { count } = event.detail;
  updateWishlistBadge(count);
});
```

---

### `networkStatusChanged`

Fired when network connectivity changes.

**Event Detail:**
```typescript
{
  isOnline: boolean;
  timestamp: number;
}
```

**Example:**
```typescript
window.addEventListener('networkStatusChanged', (event) => {
  const { isOnline } = event.detail;

  if (isOnline) {
    hideOfflineBanner();
    syncPendingActions();
  } else {
    showOfflineBanner();
  }
});
```

---

## Data Types

### Product

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  brand: string;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  colors?: Array<{
    id: string;
    name: string;
    value: string;  // Hex color
  }>;
  sizes?: Array<{
    id: string;
    name: string;
  }>;
  features?: string[];
}
```

### CartItem

```typescript
interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  addedAt: number;  // Timestamp
}
```

### AddressData

```typescript
interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}
```

### PaymentData

```typescript
interface PaymentData {
  method: 'credit_card' | 'pix';
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCVV?: string;
  installments?: string;
}
```

---

## Error Handling

### Try-Catch Pattern

Always wrap bridge calls in try-catch:

```typescript
try {
  const result = await window.WebBridge.sendToNative('addToCart', payload);
  if (result.success) {
    showSuccessMessage();
  }
} catch (error) {
  console.error('Bridge error:', error);
  showErrorMessage('Failed to add item to cart');
}
```

### Timeout Handling

Bridge calls have a 30-second timeout. Handle timeouts gracefully:

```typescript
try {
  const result = await Promise.race([
    window.WebBridge.sendToNative('createOrder', orderData),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 10000)
    )
  ]);
} catch (error) {
  if (error.message === 'Timeout') {
    showTimeoutError();
  }
}
```

### Fallback for Web-Only Mode

Provide fallbacks when bridge is unavailable:

```typescript
async function addToCart(product, quantity) {
  if (window.WebBridge) {
    return await window.WebBridge.sendToNative('addToCart', {
      product,
      quantity
    });
  } else {
    // Fallback: use local storage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({ product, quantity });
    localStorage.setItem('cart', JSON.stringify(cart));
    return { success: true, cart };
  }
}
```

---

## Best Practices

### 1. Check Bridge Availability

```typescript
// Good
if (window.WebBridge) {
  await window.WebBridge.sendToNative('handler', payload);
}

// Bad
await window.WebBridge.sendToNative('handler', payload);  // Will crash if undefined
```

### 2. Use TypeScript Types

```typescript
// Define your own types based on the API
interface AddToCartPayload {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

async function addToCart(payload: AddToCartPayload) {
  return await window.WebBridge.sendToNative('addToCart', payload);
}
```

### 3. Handle Errors Gracefully

```typescript
try {
  await window.WebBridge.sendToNative('addToCart', payload);
  notifications.success('Added to cart');
} catch (error) {
  console.error(error);
  notifications.error('Failed to add to cart. Please try again.');
}
```

### 4. Debounce Frequent Calls

```typescript
import { debounce } from 'lodash';

const updateQuantity = debounce(async (productId, quantity) => {
  await window.WebBridge.sendToNative('updateCartQuantity', {
    productId,
    quantity
  });
}, 500);
```

### 5. Subscribe to Events Early

```typescript
// In App.tsx or main component
useEffect(() => {
  const handleCartUpdate = (event) => {
    setCartCount(event.detail.count);
  };

  window.addEventListener('cartUpdated', handleCartUpdate);

  return () => {
    window.removeEventListener('cartUpdated', handleCartUpdate);
  };
}, []);
```

### 6. Validate Payloads

```typescript
async function addToCart(product, quantity) {
  if (!product || !product.id) {
    throw new Error('Invalid product');
  }

  if (quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  return await window.WebBridge.sendToNative('addToCart', {
    product,
    quantity
  });
}
```

### 7. Use Semantic Event Names

```typescript
// Listen for specific events
window.addEventListener('cartUpdated', handleCartUpdate);
window.addEventListener('wishlistUpdated', handleWishlistUpdate);
window.addEventListener('networkStatusChanged', handleNetworkChange);
```

### 8. Clean Up Event Listeners

```typescript
useEffect(() => {
  const handler = (event) => { /* ... */ };
  window.addEventListener('cartUpdated', handler);

  // Always clean up
  return () => window.removeEventListener('cartUpdated', handler);
}, []);
```

---

## Testing

### Testing in Chrome DevTools

1. Open app in Android emulator
2. Navigate to `chrome://inspect`
3. Click "inspect" on your WebView
4. Test bridge calls in console:

```javascript
// Test adding to cart
await window.WebBridge.sendToNative('addToCart', {
  product: {
    id: 'test',
    name: 'Test Product',
    price: 99.99,
    // ... other required fields
  },
  quantity: 1
});

// Test notification
await window.WebBridge.sendToNative('showNotification', {
  title: 'Test',
  message: 'Bridge is working!',
  color: 'green'
});
```

### Unit Testing

Mock the bridge in your tests:

```typescript
// Mock setup
beforeEach(() => {
  window.WebBridge = {
    sendToNative: jest.fn().mockResolvedValue({ success: true })
  };
});

// Test
it('should add item to cart', async () => {
  await addToCart(mockProduct, 1);

  expect(window.WebBridge.sendToNative).toHaveBeenCalledWith('addToCart', {
    product: mockProduct,
    quantity: 1
  });
});
```

---

## Troubleshooting

### Bridge is undefined

**Problem:** `window.WebBridge is undefined`

**Solution:**
- Check that injectedJavaScript is being executed
- Verify WebView is loaded before calling bridge
- Check for JavaScript errors in DevTools

### Handlers not responding

**Problem:** Bridge call hangs or times out

**Solution:**
- Verify handler is registered in native code
- Check native logs for errors
- Ensure payload matches expected structure

### Events not firing

**Problem:** Event listeners not triggered

**Solution:**
- Verify event listener is added before event fires
- Check event name spelling
- Ensure WebView can execute injected JavaScript

---

## Additional Resources

- [Mobile Bridge Implementation (MobileBridge.ts)](/mnt/c/poc/MobileBridgePOC/MobileBridgeApp/src/bridge/MobileBridge.ts)
- [Architecture Guide (ARCHITECTURE.md)](/mnt/c/poc/MobileBridgePOC/ARCHITECTURE.md)
- [Main README (README.md)](/mnt/c/poc/MobileBridgePOC/README.md)

---

**Last Updated:** 2025-10-24
