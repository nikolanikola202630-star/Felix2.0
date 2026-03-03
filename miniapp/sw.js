/**
 * Felix Academy - Service Worker
 * Offline support и кэширование для премиум производительности
 */

const CACHE_VERSION = 'felix-academy-v1.0.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_API = `${CACHE_VERSION}-api`;

// Статические файлы для кэширования
const STATIC_ASSETS = [
  '/miniapp/index.html',
  '/miniapp/catalog.html',
  '/miniapp/course.html',
  '/miniapp/lesson.html',
  '/miniapp/my-courses.html',
  '/miniapp/profile.html',
  '/miniapp/css/flagship-premium.css',
  '/miniapp/js/app.js',
  'https://telegram.org/js/telegram-web-app.js'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => key.startsWith('felix-academy-') && key !== CACHE_STATIC && key !== CACHE_DYNAMIC && key !== CACHE_API)
            .map(key => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API запросы - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Кэшируем успешные ответы
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_API).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback на кэш при ошибке сети
          return caches.match(request);
        })
    );
    return;
  }

  // Статические файлы - Cache First
  if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request)
            .then(fetchResponse => {
              return caches.open(CACHE_STATIC).then(cache => {
                cache.put(request, fetchResponse.clone());
                return fetchResponse;
              });
            });
        })
    );
    return;
  }

  // Динамический контент - Network First с кэшем
  event.respondWith(
    fetch(request)
      .then(response => {
        // Кэшируем только GET запросы
        if (request.method === 'GET' && response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_DYNAMIC).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback на кэш
        return caches.match(request)
          .then(response => {
            if (response) {
              return response;
            }
            // Offline страница
            if (request.mode === 'navigate') {
              return caches.match('/miniapp/index.html');
            }
          });
      })
  );
});

// Обработка сообщений
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then(keys => {
        return Promise.all(
          keys.map(key => caches.delete(key))
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded');
