const CACHE_VERSION = 'saturn-v2.0';
const CACHE_FILES = ['./', './index.html'];

// Install: cache new version
self.addEventListener('install', e => {
  self.skipWaiting(); // activate immediately, don't wait
  e.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(CACHE_FILES))
  );
});

// Activate: delete ALL old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // take control of all pages immediately
  );
});

// Fetch: network first, fallback to cache (ensures fresh content)
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(res => {
      // Update cache with fresh response
      const clone = res.clone();
      caches.open(CACHE_VERSION).then(cache => cache.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request)) // offline fallback
  );
});
