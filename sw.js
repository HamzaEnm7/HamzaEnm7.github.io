/* Schwa — service worker.
   Met en cache la coquille de l'app pour qu'elle démarre hors ligne.
   Dictée sur audio importé, Lab, révisions et shadowing fonctionnent sans réseau.
   YouTube et Claude en ont évidemment besoin. */

const CACHE = "schwa-v4";
const SHELL = [
  "./", "./index.html", "./styles.css",
  "./content.js", "./corpus.js", "./ai.js", "./yt.js", "./app.js",
  "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Jamais de cache pour l'API Claude ni pour YouTube.
  if (url.hostname.endsWith("anthropic.com")) return;
  if (url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtube-nocookie.com")
      || url.hostname.endsWith("ytimg.com") || url.hostname.endsWith("googlevideo.com")) return;

  // Coquille de l'app : réseau d'abord, cache en secours — pour recevoir les mises à jour.
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req, { cache: "no-cache" })   // revalide toujours : jamais de vieille copie servie en silence
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(m => m || caches.match("./index.html")))
    );
    return;
  }

  // Polices : cache d'abord, elles ne changent pas.
  if (url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com")) {
    e.respondWith(
      caches.match(req).then(m => m || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => m))
    );
  }
});
