// オフラインでも あそべるように ファイルを ほぞんする
const VER = 'sansu-v2';
const FILES = ['./', './index.html', './keisan/', './keisan/index.html', './waru/', './waru/index.html',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin === location.origin){
    // ネットが あれば あたらしい ものを、なければ ほぞんした ものを つかう
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(VER).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
  } else if (isFont){
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
      const copy = res.clone(); caches.open(VER).then(c => c.put(req, copy)); return res;
    })));
  }
});
