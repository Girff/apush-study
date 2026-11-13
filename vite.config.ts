/// <reference types="vitest/config" />
import { createHash } from 'node:crypto';
import { type Plugin, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Preload the two Latin font files the first screen uses, so text can paint
 * in its real face without waiting for CSS to discover the fonts.
 */
function preloadFonts(): Plugin {
  return {
    name: 'p4-preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const files = Object.keys(ctx.bundle ?? {}).filter((f) => /(inter-latin-wght-normal|fraunces-latin-opsz-normal)-[\w-]+\.woff2$/.test(f));
        return {
          html,
          tags: files.map((f) => ({
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `./${f}`, crossorigin: '' },
            injectTo: 'head' as const,
          })),
        };
      },
    },
  };
}

/** Files in public/ that the offline cache should hold. */
const PUBLIC_FILES = ['favicon.svg', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

/**
 * Emit sw.js: precaches the built app so it works offline after one visit.
 * Pages are network-first (a new deploy shows up on the next load); hashed
 * assets are cache-first. The cache name changes with every build.
 */
function serviceWorker(): Plugin {
  return {
    name: 'p4-service-worker',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      // Only files the first screen can need: skip non-Latin font subsets (fetched on demand and cached then).
      const built = Object.keys(bundle).filter((f) => !f.endsWith('.map') && !(f.endsWith('.woff2') && !/-latin-(?!ext)/.test(f)) && !f.endsWith('.woff'));
      const files = [...new Set(['index.html', ...built, ...PUBLIC_FILES])].sort();
      const version = createHash('sha256').update(files.join('\n')).digest('hex').slice(0, 12);
      const source = `// Generated at build time by vite.config.ts.
const CACHE = 'p4cards-${version}';
const PRECACHE = ${JSON.stringify(['./', ...files.map((f) => `./${f}`)])};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('p4cards-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put('./', copy));
          }
          return res;
        })
        .catch(() => caches.match('./').then((hit) => hit || caches.match('./index.html'))),
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && url.pathname.includes('/assets/')) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

// `base: './'` keeps asset URLs relative, so the same build works at a domain
// root (Vercel, Netlify) or under a sub-path (GitHub Pages project sites).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), preloadFonts(), serviceWorker()],
  build: {
    target: 'es2022',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
