const CACHE_NAME = 'sipetak-pwa-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/img/logo-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).catch(() => {
          if (event.request.mode === 'navigate') {
            // Return a simple offline fallback or custom offline page if you have one
            // We'll return a basic text response for now as a fallback
            return new Response(
              '<html><body><h1>Offline</h1><p>Anda sedang offline, silakan periksa koneksi internet Anda.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
