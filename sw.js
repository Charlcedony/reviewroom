// Review Room service worker: makes the site installable and opens the app shell offline.
// It never caches videos or data, so clients always see the latest version.
const CACHE = "reviewroom-v74";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // Supabase, fonts, videos: always live
  // network first, fall back to the cached shell when offline
  const key = e.request.mode === "navigate" ? "index.html" : e.request;
  e.respondWith(fetch(e.request,{cache:"no-store"}).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(key, copy)); } return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
