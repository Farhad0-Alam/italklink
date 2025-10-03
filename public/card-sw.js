// Business Card PWA Service Worker with Push Notifications
const CACHE_NAME = '2talklink-card-v1';
const RUNTIME_CACHE = '2talklink-runtime';

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/icon-192x192.png',
        '/icon-512x512.png',
      ]).catch(err => {
        console.error('[Service Worker] Cache addAll failed:', err);
      });
    })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome extensions and other protocols
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response for caching
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  let notificationData = {
    title: 'New Update',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'default-notification',
    data: {
      url: '/'
    }
  };
  
  // Parse push data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.message || payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.tag || notificationData.tag,
        data: {
          url: payload.url || payload.data?.url || notificationData.data.url,
          ...payload.data
        },
        image: payload.image,
        vibrate: payload.vibrate || [200, 100, 200],
        requireInteraction: payload.requireInteraction || false,
      };
    } catch (error) {
      console.error('[Service Worker] Error parsing push data:', error);
      // Use text data if JSON parsing fails
      notificationData.body = event.data.text();
    }
  }
  
  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      image: notificationData.image,
      vibrate: notificationData.vibrate,
      requireInteraction: notificationData.requireInteraction,
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  
  event.notification.close();
  
  // Get the URL from notification data
  const urlToOpen = event.notification.data?.url || '/';
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[Service Worker] Push subscription changed');
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: getApplicationServerKey()
    }).then((subscription) => {
      console.log('[Service Worker] New push subscription:', subscription);
      // TODO: Send new subscription to backend
      return fetch('/api/push/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
    })
  );
});

// Get VAPID application server key
function getApplicationServerKey() {
  // This should match the VAPID public key used in the frontend
  // In production, this should be stored as an environment variable
  const vapidPublicKey = 'BMh1TfHB-pOyNPqSrRMV_Rm_LvbBsaEgLKYLnB2LvDxALh8-YC8T_XtqpGFSPZvZz8hL9qDJCRfL_Ew7Hkp3Nuo';
  return urlBase64ToUint8Array(vapidPublicKey);
}

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

console.log('[Service Worker] Loaded and ready for push notifications');
