// BusBuddy Service Worker
// ⚠️ DEPLOY CHECKLIST: Bump CACHE name every time index.html changes
const CACHE = 'bb-v9';

// Never cache these — they must always go to the network
const BYPASS = [
  'generativelanguage.googleapis.com',  // Gemini AI API
  'arrivelah2.busrouter.sg',            // Live bus arrival data
  'api.anthropic.com',                  // (legacy, kept for safety)
  'datamall2.mytransport.sg'            // LTA direct (custom proxy fallback)
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.add('./index.html'))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Let API calls go to network unintercepted
  if (BYPASS.some(h => url.hostname.includes(h))) return;

  // Navigate requests → serve cached shell
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html')
        .then(r => r || fetch(e.request))
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache-first for all other assets
  e.respondWith(
    caches.match(e.request)
      .then(r => r || fetch(e.request).then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }))
  );
});