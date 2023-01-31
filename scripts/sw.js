// sw.js

const cacheName = 'v1';
const cacheFiles = [
    '/',
    '/index.html',
    'scripts/scripts.js',
    'styles/styles.css'
];

self.addEventListener('install', event => {
    console.log('[ServiceWorker] Installed');
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                console.log('[ServiceWorker] Caching cacheFiles');
                return cache.addAll(cacheFiles);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activated');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== cacheName) {
                        console.log('[ServiceWorker] Clearing old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    console.log('[ServiceWorker] Fetch', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('[ServiceWorker] Found in Cache', event.request.url);
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            console.log('[ServiceWorker] No response from fetch', event.request.url);
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(cacheName)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                                console.log('[ServiceWorker] New Data Cached', event.request.url);
                            });
                        return response;
                    });
            })
            .catch(error => {
                console.log('[ServiceWorker] Error Fetching and Caching', error);
            })
    );
});

