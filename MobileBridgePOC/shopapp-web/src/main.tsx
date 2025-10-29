import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import * as serviceWorker from './utils/serviceWorker'

console.log('ShopApp React: main.tsx loading');
console.log('ShopApp React: root element:', document.getElementById('root'));

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('ShopApp React: Root element not found!');
} else {
  console.log('ShopApp React: Creating React root...');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log('ShopApp React: React app rendered');
}

// Register service worker for offline support
serviceWorker.register({
  onSuccess: () => {
    console.log('Service Worker registered successfully');
  },
  onUpdate: (registration) => {
    console.log('Service Worker updated');
    // Show update notification
    if (confirm('Nova versão disponível! Deseja atualizar?')) {
      const waitingWorker = registration.waiting;
      if (waitingWorker) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  },
  onError: (error) => {
    console.error('Service Worker registration failed:', error);
  },
});

// Setup event listeners
serviceWorker.setupEventListeners();
