# Development Guide

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Adding New Features](#adding-new-features)
- [Testing](#testing)
- [Debugging](#debugging)
- [Performance Optimization](#performance-optimization)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Development Environment Setup

### Prerequisites

**Required:**
- Node.js 20+ ([Download](https://nodejs.org/))
- npm or yarn
- Git
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

**Optional but Recommended:**
- Visual Studio Code with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - React Native Tools
  - React Developer Tools

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd MobileBridgePOC
   ```

2. **Install Web App dependencies:**
   ```bash
   cd shopapp-web
   npm install
   ```

3. **Install Native App dependencies:**
   ```bash
   cd ../MobileBridgeApp
   npm install
   ```

4. **Setup Android (if developing for Android):**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

5. **Setup iOS (if developing for iOS - macOS only):**
   ```bash
   cd ios
   pod install
   cd ..
   ```

### Environment Variables

Create a `.env` file in the web app if needed:

```bash
# shopapp-web/.env
VITE_API_URL=http://localhost:3000
VITE_ENABLE_DEBUG=true
```

---

## Project Structure

### Web App Structure

```
shopapp-web/
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/            # Page components (routes)
│   │   ├── HomePage.tsx
│   │   ├── ProductPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── WishlistPage.tsx
│   │   └── SearchPage.tsx
│   ├── context/          # React Context providers
│   │   └── ShopContext.tsx
│   ├── data/            # Mock data and fixtures
│   │   └── mockData.ts
│   ├── utils/           # Utility functions
│   │   ├── notifications.ts
│   │   └── placeholderImages.ts
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── index.html
├── vite.config.ts
└── package.json
```

### Native App Structure

```
MobileBridgeApp/
├── src/
│   ├── bridge/              # Mobile Bridge implementation
│   │   └── MobileBridge.ts
│   ├── components/          # Native React components
│   │   ├── TurboWebView.tsx
│   │   ├── TabBar.tsx
│   │   ├── Toast.tsx
│   │   └── NetworkStatusIndicator.tsx
│   ├── store/              # State management
│   │   ├── CartManager.ts
│   │   └── WishlistManager.ts
│   ├── services/           # Services
│   │   └── NotificationService.ts
│   ├── network/            # Network utilities
│   │   └── NetworkManager.ts
│   ├── storage/            # Storage utilities
│   │   └── OfflineStorage.ts
│   └── sync/               # Sync management
│       └── SyncManager.ts
├── android/                # Android native project
├── ios/                    # iOS native project
├── App.tsx                 # Root component
└── package.json
```

---

## Development Workflow

### Starting Development Servers

**Terminal 1 - Web App:**
```bash
cd shopapp-web
npm run dev
```
The web server will start at `http://localhost:5174`

**Terminal 2 - Native App (Android):**
```bash
cd MobileBridgeApp
npm run android
```

**Terminal 2 - Native App (iOS):**
```bash
cd MobileBridgeApp
npm run ios
```

### Hot Reload

- **Web App:** Vite provides instant hot reload. Changes to web files reflect immediately.
- **Native App:** React Native Fast Refresh reloads components on save.
- **Bridge Changes:** Requires app restart to reload injected JavaScript.

### Device Configuration

**Android Emulator:**
- Uses `10.0.2.2` to access host machine
- Already configured in `App.tsx`

**Android Physical Device:**
1. Enable USB debugging
2. Connect via USB
3. Update URL in `App.tsx` to your machine's IP:
   ```typescript
   const webAppUrl = 'http://192.168.1.25:5174';
   ```
4. Ensure device and computer are on same network

**iOS Simulator:**
- Uses `localhost` directly
- Already configured in `App.tsx`

**iOS Physical Device:**
1. Update URL to your machine's IP
2. Ensure device and computer are on same network
3. May need to configure App Transport Security

---

## Adding New Features

### Adding a New Web Page

1. **Create the page component:**
   ```typescript
   // shopapp-web/src/pages/ProfilePage.tsx
   import { useNavigate } from 'react-router-dom';
   import { Paper, Text } from '@mantine/core';

   export default function ProfilePage() {
     const navigate = useNavigate();

     return (
       <div className="profile-page">
         <Paper p="md">
           <Text>Profile Page</Text>
         </Paper>
       </div>
     );
   }
   ```

2. **Add route to App.tsx:**
   ```typescript
   import ProfilePage from './pages/ProfilePage';

   <Routes>
     {/* ... existing routes */}
     <Route path="/profile" element={<ProfilePage />} />
   </Routes>
   ```

3. **Add navigation support to bridge (optional):**
   ```typescript
   // App.tsx
   bridge.registerHandler('navigate', async (payload) => {
     const { page, params } = payload;

     const routes: Record<string, string> = {
       // ... existing routes
       profile: '/profile',
     };

     // ... rest of handler
   });
   ```

### Adding a New Bridge Handler

1. **Register handler in native app:**
   ```typescript
   // MobileBridgeApp/App.tsx
   bridge.registerHandler('getUserProfile', async (payload) => {
     try {
       const { userId } = payload;

       // Fetch user data
       const profile = await fetchUserProfile(userId);

       return {
         success: true,
         profile
       };
     } catch (error) {
       console.error('getUserProfile error:', error);
       return {
         success: false,
         error: error.message
       };
     }
   });
   ```

2. **Use handler in web app:**
   ```typescript
   // shopapp-web/src/pages/ProfilePage.tsx
   const fetchProfile = async (userId: string) => {
     if (window.WebBridge) {
       const result = await window.WebBridge.sendToNative('getUserProfile', {
         userId
       });

       if (result.success) {
         return result.profile;
       }
     }

     // Fallback for web-only mode
     return null;
   };
   ```

3. **Add TypeScript types:**
   ```typescript
   // shopapp-web/src/types/bridge.d.ts
   interface UserProfile {
     id: string;
     name: string;
     email: string;
   }

   interface WebBridge {
     sendToNative(
       handler: 'getUserProfile',
       payload: { userId: string }
     ): Promise<{ success: boolean; profile?: UserProfile }>;
   }
   ```

4. **Document in API docs:**
   Add handler documentation to `MOBILE_BRIDGE_API.md`

### Adding a New Native Event

1. **Emit event from native:**
   ```typescript
   // MobileBridgeApp/App.tsx
   const notifyProfileUpdated = (profile: UserProfile) => {
     webViewRef.current?.injectJavaScript(`
       (function() {
         window.WebBridge?.emit('profileUpdated', ${JSON.stringify(profile)});
       })();
     `);
   };
   ```

2. **Listen in web app:**
   ```typescript
   // shopapp-web/src/pages/ProfilePage.tsx
   useEffect(() => {
     const handleProfileUpdate = (event: CustomEvent) => {
       const profile = event.detail;
       setProfile(profile);
     };

     window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);

     return () => {
       window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
     };
   }, []);
   ```

### Adding a New Manager

1. **Create manager class:**
   ```typescript
   // MobileBridgeApp/src/store/ProfileManager.ts
   import AsyncStorage from '@react-native-async-storage/async-storage';

   class ProfileManager {
     private static instance: ProfileManager;
     private profile: UserProfile | null = null;
     private listeners: Set<(profile: UserProfile | null) => void> = new Set();

     static getInstance(): ProfileManager {
       if (!ProfileManager.instance) {
         ProfileManager.instance = new ProfileManager();
       }
       return ProfileManager.instance;
     }

     async loadProfile(): Promise<void> {
       const data = await AsyncStorage.getItem('userProfile');
       if (data) {
         this.profile = JSON.parse(data);
         this.notifyListeners();
       }
     }

     async updateProfile(profile: UserProfile): Promise<void> {
       this.profile = profile;
       await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
       this.notifyListeners();
     }

     getProfile(): UserProfile | null {
       return this.profile;
     }

     subscribe(listener: (profile: UserProfile | null) => void): () => void {
       this.listeners.add(listener);
       return () => this.listeners.delete(listener);
     }

     private notifyListeners(): void {
       this.listeners.forEach(listener => listener(this.profile));
     }
   }

   export default ProfileManager;
   ```

2. **Initialize in App.tsx:**
   ```typescript
   import ProfileManager from './src/store/ProfileManager';

   const profileManager = ProfileManager.getInstance();

   useEffect(() => {
     profileManager.loadProfile();
   }, []);
   ```

3. **Add bridge handlers:**
   ```typescript
   bridge.registerHandler('getProfile', async () => {
     return {
       success: true,
       profile: profileManager.getProfile()
     };
   });

   bridge.registerHandler('updateProfile', async (payload) => {
     const { profile } = payload;
     await profileManager.updateProfile(profile);

     return { success: true };
   });
   ```

---

## Testing

### Unit Testing Web App

```bash
cd shopapp-web
npm test
```

**Example test:**
```typescript
// shopapp-web/src/pages/__tests__/ProfilePage.test.tsx
import { render, screen } from '@testing-library/react';
import ProfilePage from '../ProfilePage';

describe('ProfilePage', () => {
  it('should render profile information', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Profile Page')).toBeInTheDocument();
  });
});
```

### Unit Testing Native App

```bash
cd MobileBridgeApp
npm test
```

**Example test:**
```typescript
// MobileBridgeApp/__tests__/CartManager.test.ts
import CartManager from '../src/store/CartManager';

describe('CartManager', () => {
  it('should add item to cart', () => {
    const manager = CartManager.getInstance();
    const product = { id: '1', name: 'Test', price: 10 };

    manager.addItem(product, 1);

    expect(manager.getItemCount()).toBe(1);
  });
});
```

### Integration Testing

Test bridge communication:

```typescript
// MobileBridgeApp/__tests__/bridge.test.ts
import { MobileBridge } from '../src/bridge/MobileBridge';

describe('MobileBridge', () => {
  it('should call registered handler', async () => {
    const bridge = new MobileBridge();
    const mockHandler = jest.fn().mockResolvedValue({ success: true });

    bridge.registerHandler('testHandler', mockHandler);

    const result = await bridge.handleMessage({
      id: '1',
      handler: 'testHandler',
      payload: { test: 'data' }
    });

    expect(mockHandler).toHaveBeenCalledWith({ test: 'data' });
    expect(result.success).toBe(true);
  });
});
```

### E2E Testing

Use Detox for React Native E2E tests:

```bash
npm install --save-dev detox
```

**Example test:**
```typescript
// MobileBridgeApp/e2e/checkout.test.ts
describe('Checkout Flow', () => {
  it('should complete checkout', async () => {
    await element(by.id('product-1')).tap();
    await element(by.id('add-to-cart-btn')).tap();
    await element(by.id('cart-tab')).tap();
    await element(by.id('checkout-btn')).tap();

    // Fill address
    await element(by.id('cep-input')).typeText('12345-678');

    // Complete checkout
    await element(by.id('confirm-order-btn')).tap();

    await expect(element(by.text('Pedido Confirmado!'))).toBeVisible();
  });
});
```

---

## Debugging

### Web App Debugging

1. **Chrome DevTools for WebView:**
   - Run Android app
   - Open Chrome: `chrome://inspect`
   - Click "inspect" on your WebView
   - Use Console, Network, Elements tabs

2. **Console Logging:**
   ```typescript
   console.log('Debug info:', data);
   console.error('Error occurred:', error);
   console.table(products);
   ```

3. **React Developer Tools:**
   - Install React DevTools extension
   - Inspect component tree
   - View props and state

### Native App Debugging

1. **React Native Debugger:**
   ```bash
   npm install -g react-native-debugger
   react-native-debugger
   ```

2. **Console Logs:**
   ```typescript
   console.log('Native debug:', data);
   console.warn('Warning:', message);
   console.error('Error:', error);
   ```

3. **Flipper (Facebook's debugging tool):**
   - Install Flipper
   - Open Flipper while app is running
   - View logs, network requests, AsyncStorage

4. **Xcode Console (iOS):**
   - Open project in Xcode
   - Run app
   - View logs in console

5. **Android Studio Logcat:**
   - Open project in Android Studio
   - Run app
   - View Logcat for logs

### Bridge Debugging

Add debug logging to bridge:

```typescript
// MobileBridgeApp/src/bridge/MobileBridge.ts
handleMessage(message: BridgeMessage) {
  console.log('🌉 Bridge received:', message.handler, message.payload);

  const result = await this.handler(message.payload);

  console.log('🌉 Bridge response:', message.handler, result);

  return result;
}
```

```typescript
// shopapp-web
window.WebBridge.sendToNative = async (handler, payload) => {
  console.log('📤 Sending to native:', handler, payload);

  const result = await originalSendToNative(handler, payload);

  console.log('📥 Received from native:', handler, result);

  return result;
};
```

### Network Debugging

1. **Charles Proxy / Proxyman:**
   - Configure proxy on device
   - View all HTTP/HTTPS requests

2. **React Native Network Inspector:**
   - Shake device or press Cmd+D (iOS) / Cmd+M (Android)
   - Enable "Debug"
   - View network requests in debugger

---

## Performance Optimization

### Web App Performance

1. **Code Splitting:**
   ```typescript
   // App.tsx
   import { lazy, Suspense } from 'react';

   const ProductPage = lazy(() => import('./pages/ProductPage'));

   <Suspense fallback={<Loading />}>
     <Route path="/product/:id" element={<ProductPage />} />
   </Suspense>
   ```

2. **Image Optimization:**
   - Use WebP format
   - Lazy load images
   - Use appropriate sizes

3. **Bundle Analysis:**
   ```bash
   npm run build
   npm install -g source-map-explorer
   source-map-explorer 'dist/assets/*.js'
   ```

### Native App Performance

1. **Memoization:**
   ```typescript
   const MemoizedComponent = React.memo(Component);

   const memoizedValue = useMemo(() => {
     return expensiveOperation(data);
   }, [data]);
   ```

2. **Reduce Bridge Calls:**
   - Batch operations
   - Cache results
   - Use events instead of polling

3. **Optimize Re-renders:**
   ```typescript
   // Use useCallback for functions
   const handlePress = useCallback(() => {
     doSomething();
   }, [dependencies]);
   ```

4. **Profile Performance:**
   ```bash
   # iOS
   npx react-native run-ios --configuration Release

   # Android
   npx react-native run-android --variant=release
   ```

### Bridge Performance

1. **Minimize Payload Size:**
   ```typescript
   // Bad: Send entire product object every time
   sendToNative('updateCart', { product: fullProduct });

   // Good: Send only ID
   sendToNative('updateCart', { productId: product.id });
   ```

2. **Debounce Frequent Calls:**
   ```typescript
   import { debounce } from 'lodash';

   const debouncedUpdate = debounce((data) => {
     window.WebBridge.sendToNative('update', data);
   }, 300);
   ```

3. **Use Events for One-Way Communication:**
   ```typescript
   // Better than polling
   window.addEventListener('cartUpdated', updateUI);
   ```

---

## Common Patterns

### Singleton Pattern

Used for managers:

```typescript
class DataManager {
  private static instance: DataManager;

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  private constructor() {
    // Private to prevent direct instantiation
  }
}
```

### Observer Pattern

Used for state subscriptions:

```typescript
class StateManager {
  private listeners: Set<(state: State) => void> = new Set();

  subscribe(listener: (state: State) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(state: State): void {
    this.listeners.forEach(listener => listener(state));
  }
}
```

### Promise-based Bridge

All bridge calls return Promises:

```typescript
async function addToCart(product: Product) {
  try {
    const result = await window.WebBridge.sendToNative('addToCart', {
      product
    });
    return result;
  } catch (error) {
    console.error('Failed to add to cart:', error);
    throw error;
  }
}
```

### Context API for Web State

```typescript
const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    // Sync with native
    window.addEventListener('cartUpdated', (event) => {
      setCart(event.detail.items);
    });
  }, []);

  return (
    <ShopContext.Provider value={{ cart, setCart }}>
      {children}
    </ShopContext.Provider>
  );
}
```

---

## Troubleshooting

### Common Issues

**1. WebView shows blank page**
- Check web server is running
- Verify URL is correct
- Check network security config (Android)
- View console in Chrome DevTools

**2. Bridge is undefined**
- Verify injectedJavaScript is executing
- Check for JavaScript errors
- Ensure WebView is loaded before calling bridge

**3. Images not loading**
- Check network security config
- Verify image URLs are accessible
- Consider using data URLs or local assets

**4. Hot reload not working**
- Restart Metro bundler
- Clear cache: `npm start -- --reset-cache`
- Rebuild app

**5. Build failures**
- Clean build folders:
  ```bash
  # Android
  cd android && ./gradlew clean && cd ..

  # iOS
  cd ios && pod deintegrate && pod install && cd ..
  ```
- Check Node version (should be 20+)
- Delete node_modules and reinstall

**6. AsyncStorage errors**
- Check permissions
- Verify AsyncStorage is imported correctly
- Clear app data and reinstall

---

## Contributing

### Code Style

Follow the existing code style:

```typescript
// Use TypeScript
interface Product {
  id: string;
  name: string;
}

// Use arrow functions
const addToCart = async (product: Product) => {
  // ...
};

// Use async/await over .then()
try {
  const result = await fetchData();
} catch (error) {
  console.error(error);
}
```

### Commit Messages

Use conventional commits:

```
feat: add user profile page
fix: resolve cart quantity update issue
docs: update API documentation
refactor: simplify bridge message handling
test: add unit tests for CartManager
```

### Pull Request Process

1. Create a feature branch:
   ```bash
   git checkout -b feature/user-profile
   ```

2. Make your changes

3. Run tests:
   ```bash
   npm test
   ```

4. Commit changes:
   ```bash
   git add .
   git commit -m "feat: add user profile page"
   ```

5. Push to remote:
   ```bash
   git push origin feature/user-profile
   ```

6. Create pull request on GitHub

7. Wait for review and address feedback

### Code Review Checklist

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Bridge handlers are documented
- [ ] Performance is acceptable
- [ ] Works on both Android and iOS

---

## Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Mantine UI Documentation](https://mantine.dev/)

---

**Last Updated:** 2025-10-24
