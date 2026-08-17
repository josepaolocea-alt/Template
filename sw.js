/*
 * PromptVault service worker
 *
 * Makes the app installable AND usable offline. Strategy:
 *  - Navigation (the HTML page): network-first, falling back to the cached
 *    shell. So an online visit always gets the freshest index.html, and an
 *    offline visit still opens (entries are replayed from localStorage by the
 *    app itself).
 *  - Same-origin static assets (icons, manifest): stale-while-revalidate — fast
 *    from cache, refreshed in the background.
 *  - Google Fonts: cached at runtime so the UI keeps its typography offline.
 *  - Everything else cross-origin (Firebase SDK, Firestore, the AI Worker) is
 *    left untouched — the SW must never sit between the app and its live data.
 *
 * Bump CACHE_VERSION to force old caches out on the next load.
 */

const CACHE_VERSION = "promptvault-v2";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Local files that make up the app shell. index.html is large but this is the
// whole app, so one precache covers offline use.
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./post-it-icon-32.png",
  "./post-it-icon-180.png",
  "./post-it-icon-192.png",
  "./post-it-icon-512.png",
  "./post-it-icon-maskable-512.png",
];

// Cross-origin hosts we are willing to cache (fonts only). Firebase and the AI
// Worker are deliberately absent.
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // addAll fails the whole install if any asset 404s; add them individually
      // so a single missing file never blocks the install.
      .then((cache) => Promise.all(
        SHELL_ASSETS.map((asset) =>
          cache.add(asset).catch((error) => {
            console.warn("SW: could not precache", asset, error);
          })
        )
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== SHELL_CACHE && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Cache a response only when it is a real, cacheable success (never an opaque
// or error response, which would poison the cache).
function isCacheable(response) {
  return response && response.status === 200 && response.type !== "opaqueredirect";
}

async function networkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (isCacheable(response)) cache.put("./index.html", response.clone());
    return response;
  } catch (error) {
    const cached =
      (await cache.match("./index.html")) || (await cache.match("./"));
    if (cached) return cached;
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (isCacheable(response)) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // The page itself → network-first with an offline shell fallback.
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (sameOrigin) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    return;
  }

  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // Anything else (Firebase, Firestore, the AI Worker, unpkg, etc.) is left to
  // the network as normal.
});
