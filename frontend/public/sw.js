const CACHE_NAME = 'neuralpath-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip API and socket requests
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) return;

  // Cache first for static assets
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(cached => cached ||
        fetch(request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Network first for HTML/navigation
  event.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok && request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('/index.html')))
  );
});

// Background sync for offline submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'submit-answer') {
    event.waitUntil(syncOfflineAnswers());
  }
});

async function syncOfflineAnswers() {
  // In production: sync queued answers from IndexedDB
  console.log('Syncing offline answers...');
}
