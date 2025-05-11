// Service Worker pour le CV interactif
// Ce fichier permet de mettre en cache les ressources statiques et d'améliorer les performances

const CACHE_NAME = 'cv-interactif-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/responsive.css',
  '/css/docker.css',
  '/css/optimizations.css',
  '/js/main.js',
  '/js/navigation.js',
  '/js/content-loader.js',
  '/js/docker-api.js',
  '/js/docker-ui.js',
  '/js/optimization.js',
  '/images/profile_new.jpg',
  '/images/icons/contact.png',
  '/images/icons/docker.png',
  '/images/icons/education.png',
  '/images/icons/programming.png',
  '/images/icons/skills.png'
];

// Installation du service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Supprimer les caches obsolètes
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  // Ne pas mettre en cache les requêtes API
  if (event.request.url.includes('/api/')) {
    return fetch(event.request);
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retourner la réponse
        if (response) {
          return response;
        }

        // Cloner la requête
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Vérifier que la réponse est valide
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cloner la réponse
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
