/* global importScripts */
importScripts("/pwa-precache.js");
const PREFIX = "security-note-pwa-";
const CACHE = PREFIX + self.__PWA_BUILD;
const ASSETS = new Set(self.__PWA_ASSETS);

self.addEventListener("install", event => {
  // Installation is atomic: a failed download leaves the previous worker in place.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(
    [...ASSETS].map(url => new Request(url, { cache: "reload" }))
  )));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "ACTIVATE_UPDATE") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  // Do not intercept secrets, chat, admin requests, third-party requests or RSC payloads.
  if (request.method !== "GET" || url.origin !== self.location.origin ||
      url.pathname.startsWith("/api/") || request.headers.has("RSC") ||
      url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(request, { signal: AbortSignal.timeout(5000) });
        if (response.ok || response.status < 500) return response;
      } catch { /* Offline: use this release's complete app shell. */ }
      return await cache.match(url.pathname) || await cache.match("/offline.html");
    })());
    return;
  }
  if (ASSETS.has(url.pathname) && !url.search) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return await cache.match(url.pathname) || fetch(request);
    })());
  }
});
