// Offline support for Interval Beep Timer.
// Change the version number whenever you upload a new index.html, so phones pick up the update.
const CACHE = "beep-timer-v1";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve from the saved copy right away, and refresh that copy from the network in the background.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(event.request).then((hit) => {
        const fresh = fetch(event.request)
          .then((res) => {
            if (res && (res.ok || res.type === "opaque")) cache.put(event.request, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || fresh;
      })
    )
  );
});
