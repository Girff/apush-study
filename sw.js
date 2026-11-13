// Generated at build time by vite.config.ts.
const CACHE = 'p4cards-9101b1defa81';
const PRECACHE = ["./","./apple-touch-icon.png","./assets/fraunces-latin-opsz-normal-DihXLNYH.woff2","./assets/index-_G_sytQS.css","./assets/index-g1dPKxph.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./favicon.svg","./icon-192.png","./icon-512.png","./index.html","./manifest.webmanifest"];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('p4cards-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put('./', copy));
          }
          return res;
        })
        .catch(() => caches.match('./').then((hit) => hit || caches.match('./index.html'))),
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && url.pathname.includes('/assets/')) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
