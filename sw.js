/* Offline support: serve from cache immediately, refresh the cache in the
   background, so a phone with no signal still opens the app and the next
   load with signal picks up any new version. */
const CACHE = 'energy-check-v9';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './vendor/jspdf.umd.min.js',
  './vendor/jszip.min.js',
  './vendor/firebase-app-compat.js',
  './vendor/firebase-auth-compat.js',
  './vendor/firebase-database-compat.js',
  './vendor/firebase-storage-compat.js',
  './vendor/firebase-functions-compat.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const key = e.request.mode === 'navigate' ? './index.html' : e.request;
      const hit = await c.match(key, { ignoreSearch: true });
      const refresh = fetch(e.request).then(r => {
        if (r.ok) c.put(key, r.clone());
        return r;
      });
      if (hit) { refresh.catch(() => {}); return hit; }
      return refresh;
    })
  );
});
