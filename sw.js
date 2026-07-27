self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});

// Keep the page alive and handle background audio
self.addEventListener('fetch', function(e) {
  // Pass through all requests normally
  e.respondWith(fetch(e.request).catch(function() {
    return new Response('Offline', {status: 503});
  }));
});
