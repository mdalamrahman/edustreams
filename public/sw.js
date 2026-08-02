const CACHE_NAME = 'edustream-video-v1';

// Install Event
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installed video cache engine:', CACHE_NAME);
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating new cache layer...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Intercept video & stream range requests
// Handles both local proxy paths (/stream/) and direct HF Space URLs
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Match Telegram stream/download endpoints:
  // - /stream/{chat_id}/{msg_id} (local proxy or HF Space)
  // - /api/download/{chat_id}/{msg_id} (local proxy or HF Space)
  // - *.hf.space/stream/* or *.hf.space/api/download/* (direct HF)
  const isStreamRequest =
    requestUrl.pathname.includes('/stream/') ||
    requestUrl.pathname.includes('/api/download/');

  if (isStreamRequest) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          console.log('[ServiceWorker] Serving offline cached media segment:', requestUrl.pathname);
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200 || networkResponse.status === 206) {
            // Clone and cache media stream
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('[ServiceWorker] Network offline. Attempting fallback match...');
          return cachedResponse || new Response('Offline video stream unavailable', { status: 503 });
        });
      })
    );
  }
});
