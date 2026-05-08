const CACHE = 'xwind-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k!==CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Network-first for API calls, cache-first for assets
  const isApi = e.request.url.includes('aviationweather.gov')
    || e.request.url.includes('arcgis.com')
    || e.request.url.includes('ourairports.com')
    || e.request.url.includes('tgftp.nws.noaa.gov');

  if (isApi) {
    e.respondWith(fetch(e.request).catch(() => new Response('', {status:503})));
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
