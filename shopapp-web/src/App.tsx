import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { ShopProvider } from './context/ShopContext';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import SearchPage from './pages/SearchPage';
import WishlistPage from './pages/WishlistPage';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';
import './App.css';

function AppContent() {
  console.log('ShopApp React: AppContent rendering');

  return (
    <div className="app-mobile">
      <main className="main-mobile">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h2>Perfil</h2>
              <p>Funcionalidade não implementada na POC</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  console.log('ShopApp React: App component mounting');

  // Check if running in WebView on mount
  useEffect(() => {
    console.log('=== Bridge Detection ===');
    console.log('window.ReactNativeWebView:', (window as any).ReactNativeWebView);
    console.log('window.WebBridge:', (window as any).WebBridge);
    console.log('Is in WebView?', !!(window as any).ReactNativeWebView);

    // Test sending a message
    if ((window as any).ReactNativeWebView) {
      console.log('Sending test message to native...');
      try {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({
          type: 'test',
          data: { message: 'Hello from React web app!' }
        }));
        console.log('Test message sent!');
      } catch (error) {
        console.error('Error sending test message:', error);
      }
    }
  }, []);

  return (
    <MantineProvider>
      <ModalsProvider>
        <Notifications position="top-center" />
        <ShopProvider>
          <HashRouter>
            <AppContent />
          </HashRouter>
        </ShopProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}
