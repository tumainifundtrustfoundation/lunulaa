/**
 * Lupanulla Elimu Hub - Service Worker Configuration
 * --------------------------------------------------
 * Caches static assets, Google fonts, CDN scripts, and academic resources
 * so that students can continue studying when they have poor or offline connections.
 */

const CACHE_NAME = 'lupanulla-academic-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.jpg',
  '/robots.txt',
  '/sitemap.xml'
];

// External assets to precache or cache dynamically
const GOOGLE_FONTS_ORIGIN = 'https://fonts.gstatic.com';
const GOOGLE_FONTS_STYLING = 'https://fonts.googleapis.com';
const CDN_JSPDF = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const CDN_PHOSPHOR = 'https://unpkg.com/@phosphor-icons/web';

// Install event - Precaches core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching core assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Error during precaching assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - Clears old caches and takes control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Caching strategies (Network-First for navigation, Stale-While-Revalidate for assets)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Navigation requests (HTML Pages / Routes) -> Network-First, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Put clone of the page in cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Offline fallback: try to return the exact page if cached, otherwise serve /index.html
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // 2. Ignore non-GET requests, Firebase WebSockets/Auth, and Hot Module Replacement (HMR) requests
  if (
    request.method !== 'GET' ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.pathname.includes('/ws') ||
    url.search.includes('hmr')
  ) {
    return;
  }

  // 3. Static Assets & CDN libraries -> Stale-While-Revalidate
  const isStaticAsset = 
    url.origin === self.location.origin || 
    url.origin === GOOGLE_FONTS_ORIGIN || 
    url.origin === GOOGLE_FONTS_STYLING ||
    request.url.startsWith(CDN_JSPDF) ||
    request.url.startsWith(CDN_PHOSPHOR);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('[Service Worker] Failed to fetch background asset update:', err);
        });

        // Return cached response if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. API Endpoints (e.g. workspace courses, past papers lists) -> Network-First, save to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline: try to return cached version of API response if it exists
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Return custom offline JSON response
            return new Response(
              JSON.stringify({ 
                error: 'Uko nje ya mtandao (Offline)', 
                message: 'Mada na rasilimali ulizozipakua hapo awali bado zinaweza kufikiwa offline.',
                offline: true
              }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
  }
});

// 5. Handle messages from client for proactive caching and syncing of favorite subjects/topics
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_FAVORITES') {
    const favorites = event.data.favorites || [];
    console.log('[Service Worker] Proactive sync requested for favorite topics:', favorites);

    const syncPromises = favorites.map((topicTitle) => {
      // Proactively fetch and cache the API response for this specific favorite study material
      const targetUrl = `/api/study-materials?topic=${encodeURIComponent(topicTitle)}`;
      
      return fetch(targetUrl)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            return caches.open(CACHE_NAME).then((cache) => {
              return cache.put(targetUrl, responseClone);
            });
          }
        })
        .catch((err) => {
          console.warn('[Service Worker] Failed proactive caching for topic:', topicTitle, err);
        });
    });

    event.waitUntil(
      Promise.all(syncPromises).then(() => {
        console.log('[Service Worker] Proactive caching of study materials completed successfully!');
        
        // Notify all open client windows that syncing is complete
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SYNC_COMPLETE',
              favorites: favorites,
              timestamp: Date.now()
            });
          });
        });
      })
    );
  }
});

