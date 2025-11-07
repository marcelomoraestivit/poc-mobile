/**
 * Service Worker Registration Utility
 */

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

/**
 * Register service worker
 */
export async function register(config?: ServiceWorkerConfig): Promise<void> {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported in this browser');
    return;
  }

  // Don't register in development (unless explicitly enabled)
  const isDev = import.meta.env.DEV;
  if (isDev && !import.meta.env.VITE_ENABLE_SW) {
    console.log('Service Worker disabled in development mode');
    return;
  }

  try {
    // Wait for page to load
    await new Promise<void>((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', () => resolve());
      }
    });

    console.log('Registering Service Worker...');

    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      if (!newWorker) {
        return;
      }

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New service worker available
            console.log('New Service Worker available');

            if (config?.onUpdate) {
              config.onUpdate(registration);
            } else {
              // Default: show update notification
              showUpdateNotification(registration);
            }
          } else {
            // Service worker installed for the first time
            console.log('Service Worker installed');

            if (config?.onSuccess) {
              config.onSuccess(registration);
            }
          }
        }
      });
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', handleSWMessage);

    // Setup periodic background sync (if supported)
    if ('sync' in registration) {
      try {
        await (registration as any).sync.register('sync-pending-actions');
        console.log('Background sync registered');
      } catch (error) {
        console.warn('Background sync not supported');
      }
    }
  } catch (error) {
    console.error('Service Worker registration failed:', error);

    if (config?.onError) {
      config.onError(error as Error);
    }
  }
}

/**
 * Unregister service worker
 */
export async function unregister(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    console.log('Service Worker unregistered');
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
  }
}

/**
 * Update service worker
 */
export async function update(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    console.log('Service Worker updated');
  } catch (error) {
    console.error('Service Worker update failed:', error);
  }
}

/**
 * Show update notification
 */
function showUpdateNotification(registration: ServiceWorkerRegistration): void {
  const message = 'Nova versão disponível! Recarregar para atualizar?';

  if (confirm(message)) {
    const waitingWorker = registration.waiting;

    if (waitingWorker) {
      // Tell the waiting worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });

      // Reload when the new worker is activated
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  }
}

/**
 * Handle messages from service worker
 */
function handleSWMessage(event: MessageEvent): void {
  const { type, action, payload } = event.data;

  console.log('[SW Message]', type, action);

  switch (type) {
    case 'BACKGROUND_SYNC':
      if (action === 'sync-pending-actions') {
        // Trigger sync of pending actions
        window.dispatchEvent(new CustomEvent('sw:sync-request'));
      }
      break;

    case 'CACHE_UPDATED':
      console.log('Cache updated:', payload);
      break;

    default:
      console.log('Unknown SW message:', type);
  }
}

/**
 * Send message to service worker
 */
export async function sendMessage(message: any): Promise<void> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    console.warn('No active service worker');
    return;
  }

  navigator.serviceWorker.controller.postMessage(message);
}

/**
 * Clear all caches
 */
export async function clearCaches(): Promise<void> {
  await sendMessage({ type: 'CLEAR_CACHE' });

  // Also clear browser caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    console.log('All caches cleared');
  }
}

/**
 * Precache URLs
 */
export async function precacheURLs(urls: string[]): Promise<void> {
  await sendMessage({
    type: 'CACHE_URLS',
    payload: { urls },
  });
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  caches: string[];
  totalSize: number;
}> {
  if (!('caches' in window)) {
    return { caches: [], totalSize: 0 };
  }

  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return {
    caches: cacheNames,
    totalSize,
  };
}

/**
 * Check if service worker is active
 */
export function isActive(): boolean {
  return (
    'serviceWorker' in navigator && navigator.serviceWorker.controller !== null
  );
}

/**
 * Wait for service worker to be ready
 */
export async function waitForReady(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  return await navigator.serviceWorker.ready;
}

/**
 * Setup service worker event listeners
 */
export function setupEventListeners(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('[SW] Online');
    sendMessage({ type: 'NETWORK_STATUS', payload: { online: true } });
  });

  window.addEventListener('offline', () => {
    console.log('[SW] Offline');
    sendMessage({ type: 'NETWORK_STATUS', payload: { online: false } });
  });

  // Listen for sync requests from SW
  window.addEventListener('sw:sync-request', () => {
    console.log('[SW] Sync requested');
    // Trigger Mobile Bridge sync if available
    if (window.WebBridge) {
      window.dispatchEvent(new CustomEvent('triggerSync'));
    }
  });
}
