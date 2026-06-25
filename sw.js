// Service Worker — caches all app files so it works offline
const CACHE = 'lid-practice-v1';
const FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './questions.json',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// On install: cache all files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

// On fetch: serve from cache, fall back to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
