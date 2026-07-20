const CACHE_NAME = 'chamcong-v1';
const ASSETS = [
  './',
  './index.html',
  './icon.png'
];

// Cài đặt và lưu các file vào bộ nhớ đệm (Cache) của điện thoại
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Kích hoạt App chạy độc lập không phụ thuộc vào mạng
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

// Cơ chế chạy Offline: Nếu mất mạng, tự động lấy giao diện từ bộ nhớ Cache ra dùng
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
