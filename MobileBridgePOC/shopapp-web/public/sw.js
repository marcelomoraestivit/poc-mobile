/**
 * Service Worker for Offline-First functionality
 * Caches static assets and API responses
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `shopapp-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

// Route patterns and their cache strategies
const ROUTE_PATTERNS = [
  {
    pattern: /\.(js|css|woff2?|ttf|otf|eot)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  {
    pattern: /\.(png|jpg|jpeg|gif|svg|webp|ico)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  {
    pattern: /^https?:\/\/[^/]+\/(api|data)\//,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 5 * 60 * 1000, // 5 minutes
  },
];

// Install event - cache precache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...', CACHE_NAME);

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Precaching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...', CACHE_NAME);

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old caches
              return cacheName.startsWith('shopapp-') && cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Claim all clients
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin && !url.href.includes('localhost')) {
    return;
  }

  // Find matching route pattern
  const route = ROUTE_PATTERNS.find((r) => r.pattern.test(url.pathname || url.href));

  if (!route) {
    // Default: network first for HTML pages
    event.respondWith(handleNetworkFirst(request));
    return;
  }

  // Use appropriate strategy
  switch (route.strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      event.respondWith(handleCacheFirst(request, route.maxAge));
      break;

    case CACHE_STRATEGIES.NETWORK_FIRST:
      event.respondWith(handleNetworkFirst(request, route.maxAge));
      break;

    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      event.respondWith(handleStaleWhileRevalidate(request, route.maxAge));
      break;

    case CACHE_STRATEGIES.NETWORK_ONLY:
      event.respondWith(fetch(request));
      break;

    case CACHE_STRATEGIES.CACHE_ONLY:
      event.respondWith(caches.match(request));
      break;

    default:
      event.respondWith(handleNetworkFirst(request));
  }
});

/**
 * Cache First Strategy
 * Returns cached response if available, otherwise fetches from network
 */
async function handleCacheFirst(request, maxAge) {
  const cached = await caches.match(request);

  if (cached) {
    // Check if cache is still fresh
    const cachedTime = await getCacheTime(request.url);
    if (cachedTime && Date.now() - cachedTime < maxAge) {
      console.log('[SW] Cache hit (fresh):', request.url);
      return cached;
    }
  }

  try {
    console.log('[SW] Fetching from network:', request.url);
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      await setCacheTime(request.url, Date.now());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, returning stale cache:', request.url);
    // Return stale cache if network fails
    if (cached) {
      return cached;
    }

    throw error;
  }
}

/**
 * Network First Strategy
 * Tries network first, falls back to cache if offline
 */
async function handleNetworkFirst(request, maxAge) {
  try {
    console.log('[SW] Fetching from network:', request.url);
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      if (maxAge) {
        await setCacheTime(request.url, Date.now());
      }
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);

    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    // If this is a navigation request, return offline page
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(OFFLINE_URL);
      if (offlinePage) {
        return offlinePage;
      }
    }

    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 * Returns cached response immediately while fetching fresh data in background
 */
async function handleStaleWhileRevalidate(request, maxAge) {
  const cached = await caches.match(request);

  // Fetch fresh data in background
  const fetchPromise = fetch(request).then(async (response) => {
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      if (maxAge) {
        await setCacheTime(request.url, Date.now());
      }
    }
    return response;
  });

  // Return cache immediately if available
  if (cached) {
    console.log('[SW] Returning cached, revalidating:', request.url);
    return cached;
  }

  // Otherwise wait for network
  return fetchPromise;
}

/**
 * Store cache time in IndexedDB
 */
async function setCacheTime(url, time) {
  try {
    const db = await openCacheDB();
    const tx = db.transaction('cache-times', 'readwrite');
    const store = tx.objectStore('cache-times');
    await store.put({ url, time });
  } catch (error) {
    console.error('[SW] Failed to set cache time:', error);
  }
}

/**
 * Get cache time from IndexedDB
 */
async function getCacheTime(url) {
  try {
    const db = await openCacheDB();
    const tx = db.transaction('cache-times', 'readonly');
    const store = tx.objectStore('cache-times');
    const result = await store.get(url);
    return result?.time;
  } catch (error) {
    console.error('[SW] Failed to get cache time:', error);
    return null;
  }
}

/**
 * Open IndexedDB for cache metadata
 */
function openCacheDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sw-cache-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('cache-times')) {
        db.createObjectStore('cache-times', { keyPath: 'url' });
      }
    };
  });
}

// Background sync for pending actions (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-actions') {
    console.log('[SW] Background sync triggered');

    event.waitUntil(
      // Notify the app to sync pending actions
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'BACKGROUND_SYNC',
            action: 'sync-pending-actions',
          });
        });
      })
    );
  }
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLAIM_CLIENTS':
      self.clients.claim();
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(cacheNames.map((name) => caches.delete(name)));
        })
      );
      break;

    case 'CACHE_URLS':
      if (payload?.urls) {
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(payload.urls);
          })
        );
      }
      break;

    default:
      console.log('[SW] Unknown message type:', type);
  }
});

console.log('[SW] Service Worker loaded');
