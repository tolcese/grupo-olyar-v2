const CACHE_NAME = 'grupo-olyar-v2.20.2';

// Solo cacheamos el shell estático — los datos de Supabase siempre van a la red
const STATIC_ASSETS = [
  '/grupo-olyar-v2/',
  '/grupo-olyar-v2/index.html',
  '/grupo-olyar-v2/manifest.json',
  '/grupo-olyar-v2/icons/icon-192.png',
  '/grupo-olyar-v2/icons/icon-512.png'
];

// Instalación: cachear assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activación: limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first para Supabase, cache-first para assets estáticos
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Supabase y APIs externas: siempre red
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('wttr.in') ||
      url.hostname.includes('cdnjs') ||
      url.hostname.includes('unpkg') ||
      url.hostname.includes('fonts.googleapis') ||
      url.hostname.includes('fonts.gstatic')) {
    return;
  }

  // Assets propios: cache-first con fallback a red
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
