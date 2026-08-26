const CACHE = 'bodesa-v3';
const ASSETS = ['./','./index.html','./manifest.json','./favicon.png','./icon-96.png','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Siempre red primero para HTML — nunca sirve caché vieja
  if (e.request.mode === 'navigate' || e.request.url.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Caché primero para assets (imágenes, iconos)
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
