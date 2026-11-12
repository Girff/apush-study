/// <reference types="vitest/config" />
import { type Plugin, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Preload the two Latin font files the first screen uses, so text can paint
 * in its real face without waiting for CSS to discover the fonts.
 */
function preloadFonts(): Plugin {
  return {
    name: 'period4-preload-fonts',
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

// `base: './'` keeps asset URLs relative, so the same build works at a domain
// root (Vercel, Netlify) or under a sub-path (GitHub Pages project sites).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), preloadFonts()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
