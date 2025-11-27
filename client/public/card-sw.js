// Service Worker for Business Card PWA
const CACHE_NAME = 'business-card-v1';
const CARD_CACHE_PREFIX = 'card-';

// Cache essential resources
const STATIC_RESOURCES = [
  '/',
  '/share',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_RESOURCES))
  );
  self.skipWaiting();
});

// Fetch event - cache card data and serve offline
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Network-first strategy for HTML pages (share pages)
  if (url.pathname.includes('/share') && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) {
            return response;
          }
          
          const responseClone = response.clone();
          const cardId = extractCardId(url);
          
          if (cardId) {
            caches.open(CARD_CACHE_PREFIX + cardId)
              .then(cache => cache.put(event.request, responseClone));
          }
          
          return response;
        })
        .catch(() => {
          // Fall back to cache on network error
          return caches.match(event.request)
            .then(response => response || new Response('Offline - Page not available', { status: 503 }));
        })
    );
    return;
  }
  
  // Cache-first strategy for static resources
  if (event.request.method === 'GET' && 
      (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/i) || 
       url.pathname.includes('/api/'))) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
        .catch(() => new Response('Offline', { status: 503 }))
    );
    return;
  }
  
  // Network-only for API requests that aren't GET
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => new Response(JSON.stringify({ error: 'Offline' }), { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }))
    );
    return;
  }
  
  // Default fetch strategy
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request) || new Response('Offline', { status: 503 }))
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && !cacheName.startsWith(CARD_CACHE_PREFIX)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Extract card ID from URL
function extractCardId(url) {
  const hash = url.hash;
  return hash ? hash.slice(1) : null;
}

// Handle background sync for offline contacts
self.addEventListener('sync', event => {
  if (event.tag === 'contact-sync') {
    event.waitUntil(syncContacts());
  }
});

function syncContacts() {
  // Handle contact synchronization when back online
  return Promise.resolve();
}

// Handle notification clicks for business card interactions
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const data = event.notification.data;
  if (data && data.cardUrl) {
    event.waitUntil(
      clients.openWindow(data.cardUrl)
    );
  }
});