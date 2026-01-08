/**
 * Service Worker with Workbox
 * Handles offline caching and background sync
 */

/* eslint-disable no-undef */
/* global self, importScripts, workbox */

// Import Workbox from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Configure Workbox
workbox.setConfig({
  debug: false,
});

const { precacheAndRoute } = workbox.precaching;
const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { CacheableResponsePlugin } = workbox.cacheableResponse;

// Precache static assets (populated by build process)
// This will be replaced by Vite/Workbox plugin during build
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache strategy for API requests
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60, // 1 hour
      }),
    ],
  })
);

// Cache strategy for images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache strategy for CSS and JavaScript
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache strategy for fonts
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'font-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);

// Cache strategy for SCORM packages (large files)
registerRoute(
  ({ url }) => url.pathname.includes('/scorm/'),
  new CacheFirst({
    cacheName: 'scorm-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
      }),
    ],
  })
);

// Cache strategy for video content (streaming)
registerRoute(
  ({ url }) => url.pathname.includes('/videos/') || url.pathname.includes('/media/'),
  new CacheFirst({
    cacheName: 'media-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// Offline fallback for navigation requests
const FALLBACK_HTML_URL = '/offline.html';
const CACHE_NAME = 'offline-fallbacks';

// Cache the offline fallback page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([FALLBACK_HTML_URL]);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old cache versions
            return (
              cacheName.startsWith('workbox-') ||
              cacheName === 'offline-fallbacks-old'
            );
          })
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Handle navigation requests with offline fallback
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkOnly({
    plugins: [
      {
        handlerDidError: async () => {
          const cache = await caches.open(CACHE_NAME);
          return cache.match(FALLBACK_HTML_URL);
        },
      },
    ],
  })
);

// Background sync for offline mutations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

/**
 * Sync offline data when connection is restored
 */
async function syncOfflineData() {
  console.log('[ServiceWorker] Starting background sync');

  try {
    // Open IndexedDB
    const db = await openDatabase();
    const syncQueue = await getSyncQueue(db);

    // Process sync queue
    for (const entry of syncQueue) {
      try {
        await processSyncEntry(entry);
        await markSyncEntryCompleted(db, entry.id);
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync entry:', error);
        await markSyncEntryFailed(db, entry.id, error.message);
      }
    }

    console.log('[ServiceWorker] Background sync completed');
  } catch (error) {
    console.error('[ServiceWorker] Background sync failed:', error);
    throw error;
  }
}

/**
 * Open IndexedDB
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('lms-database', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get sync queue from IndexedDB
 */
function getSyncQueue(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Process sync entry
 */
async function processSyncEntry(entry) {
  const { type, entity, entityId, payload } = entry;
  const endpoint = getEndpointForEntity(entity);

  let url = endpoint;
  let method = 'POST';

  switch (type) {
    case 'CREATE':
      method = 'POST';
      break;
    case 'UPDATE':
      method = 'PUT';
      url = `${endpoint}/${entityId}`;
      break;
    case 'DELETE':
      method = 'DELETE';
      url = `${endpoint}/${entityId}`;
      break;
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: type !== 'DELETE' ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get endpoint for entity type
 */
function getEndpointForEntity(entity) {
  const baseUrl = self.location.origin;
  switch (entity) {
    case 'course':
      return `${baseUrl}/api/courses`;
    case 'lesson':
      return `${baseUrl}/api/lessons`;
    case 'enrollment':
      return `${baseUrl}/api/enrollments`;
    case 'progress':
      return `${baseUrl}/api/progress`;
    default:
      throw new Error(`Unknown entity type: ${entity}`);
  }
}

/**
 * Mark sync entry as completed
 */
function markSyncEntryCompleted(db, entryId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.delete(entryId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Mark sync entry as failed
 */
function markSyncEntryFailed(db, entryId, error) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const getRequest = store.get(entryId);

    getRequest.onsuccess = () => {
      const entry = getRequest.result;
      if (entry) {
        entry.status = 'failed';
        entry.error = error;
        entry.attempts = (entry.attempts || 0) + 1;
        entry.lastAttemptAt = Date.now();

        const putRequest = store.put(entry);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[ServiceWorker] Initialized');
