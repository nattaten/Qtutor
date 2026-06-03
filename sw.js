const CACHE_NAME = 'qtutor-app-v4'; // ขยับเป็น v4 เพื่อเคลียร์แคชเก่า
const assets = [
  '/Qtutor/',
  '/Qtutor/index.html',
  '/Qtutor/answers.html',
  '/Qtutor/dashboard.html',
  '/Qtutor/ranking.html',
  '/Qtutor/score.html',
  '/Qtutor/videos.html',
  '/Qtutor/style.css',
  '/Qtutor/app.js',
  '/Qtutor/manifest.json',
  '/Qtutor/logo.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});