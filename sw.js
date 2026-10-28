const CACHE = 'gymlog-v3';
const IMG_CACHE = 'gymlog-exercises-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (/wger\.de|\.(png|jpg|jpeg|webp|gif|svg)(\?|$)/i.test(url.pathname + url.search)) {
    e.respondWith(caches.open(IMG_CACHE).then(c =>
      c.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
        if (resp && resp.status === 200) c.put(e.request, resp.clone());
        return resp;
      }).catch(() => cached))
    ));
    return;
  }
  e.respondWith(caches.open(CACHE).then(c =>
    c.match(e.request).then(cached => {
      const fetched = fetch(e.request).then(resp => {
        if (resp && resp.status === 200) c.put(e.request, resp.clone());
        return resp;
      }).catch(() => cached);
      return cached || fetched;
    })
  ));
});
