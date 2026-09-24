/*!
 * HVAC Design Suite — service worker
 * Cache-first for the suite's own files (precached on install), so every
 * tool keeps working with no signal. Cross-origin requests (Google Fonts)
 * are cached opportunistically on first successful fetch and served from
 * cache thereafter; if the very first visit was offline, the page still
 * renders with its fallback font stack.
 */
const CACHE_VERSION = 'hvac-suite-v7';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/theme.css',
  './assets/app.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-16.png',
  './icons/favicon-32.png',
  './y-piece/index.html',
  './duct-sizer/index.html',
  './psychrometrics/index.html',
  './chilled-water/index.html',
  './converter/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      // cache-first for same-origin precached assets; network-first fallback otherwise
      return cached || network;
    })
  );
});
