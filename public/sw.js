const CACHE_NAME = 'edustream-video-v2';

// Install Event - Skip waiting immediately
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installed updated cache engine:', CACHE_NAME);
  self.skipWaiting();
});

// Activate Event - Purge all old caches (including edustream-video-v1)
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating new cache layer and purging old caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          console.log('[ServiceWorker] Deleting old cache:', cache);
          return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
// CRITICAL FIX: Bypass video stream requests (/stream/) and range requests!
// Browser HTML5 <video> requires native 206 Partial Content range responses
// which CacheStorage API prohibits. Passing through directly to network.
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.pathname.includes('/stream/') || event.request.headers.has('range')) {
    // Let browser handle native network range request directly
    return;
  }
});
