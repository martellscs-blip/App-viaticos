const CACHE = 'bodesa-v2';
const ASSETS = ['./','./index.html','./manifest.json','./favicon.png','./icon-96.png','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(ASSETS))
      .then(()=>self.skipWaiting())  // activa inmediatamente sin esperar
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())  // toma control de todas las pestañas
  );
});

self.addEventListener('fetch',e=>{
  // Network first para index.html → siempre intenta versión fresca
  if(e.request.url.includes('index.html')||e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request)
        .then(r=>{
          const clone=r.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
          return r;
        })
        .catch(()=>caches.match(e.request))
    );
    return;
  }
  // Cache first para el resto
  e.respondWith(
    caches.match(e.request).then(cached=>cached||fetch(e.request))
  );
});
