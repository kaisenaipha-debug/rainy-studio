var CACHE = 'rainy-audio-v1';
var AUDIO_RE = /\/audio\/.*\.mp3$/;

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var req = e.request;
  // 只处理同源音频请求（缓存已听过的歌，断网也能播）
  if (req.method !== 'GET' || !AUDIO_RE.test(req.url)) {
    // 其他请求走网络，失败时兜底离线提示
    e.respondWith(fetch(req).catch(function() {
      return new Response('Offline', {status: 503});
    }));
    return;
  }
  e.respondWith(
    caches.match(req).then(function(cached) {
      if (cached) return cached;
      return fetch(req).then(function(res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var clone = res.clone();
          caches.open(CACHE).then(function(c) { c.put(req, clone); });
        }
        return res;
      }).catch(function() { return new Response('Offline', {status: 503}); });
    })
  );
});
