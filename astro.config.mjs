// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';
import { VitePWA } from 'vite-plugin-pwa';
import starlightStripMdExtension from './plugins/starlight-strip-md-extension';
const isProd = import.meta.env.PROD;
const buildFormat = 'directory';
const trailingSlash = buildFormat === 'directory' ? 'always' : 'never';

// https://astro.build/config
export default defineConfig({
    site: isProd ? 'https://flyingeek.github.io/astro-color-value' : undefined,
    base: isProd ? '/astro-color-value' : undefined,
    trailingSlash,
    build: {
        format: buildFormat,
    },
    experimental: {
      contentIntellisense: true,
    },
    vite: {
        optimizeDeps: { exclude: ['astro/virtual-modules/prefetch.js'] },
        plugins: [
            VitePWA({
                filename: 'sw.js',
                registerType: 'autoUpdate',
                injectRegister: 'script',
                includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
                manifest: {
                    id: './',
                    name: 'Color Value Docs',
                    short_name: 'Color Value',
                    description: 'Documentation and simulator for the Ethos Color Value widget.',
                    theme_color: '#292829',
                    background_color: '#292829',
                    display: 'standalone',
                    start_url: './',
                    scope: './',
                    icons: [
                        {
                            src: 'pwa-192x192.png',
                            sizes: '192x192',
                            type: 'image/png',
                        },
                        {
                            src: 'pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                        },
                        {
                            src: 'maskable-icon-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'maskable',
                        },
                    ],
                },
                devOptions: {
                    enabled: false,
                },
            }),
        ],
    },
    integrations: [
        svelte(),
        starlight({
            title: 'Color Value Docs',
            social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/flyingeek/ethos-color-value' }],
            sidebar: [
                {
                    label: 'Guides',
                    items: [
                        // Each item here is one entry in the navigation menu.
                        { label: 'Example Guide', slug: 'guides/example' },
                        //{ label: 'Config Panel', slug: 'guides/config-panel' },
                        //{ label: 'Value Display', slug: 'guides/value-display' },
                        { label: 'Simulator', slug: 'guides/simulator' },
                    ],
                },
                {
                    label: 'Reference',
                    autogenerate: { directory: 'reference' },
                },
              ],
            components: {
                Head: './src/components/starlight/Head.astro',
                Hero: './src/components/starlight/Hero.astro',
            },
            plugins: [starlightStripMdExtension({ linkFormat: buildFormat })],
        }),
    ],
});
