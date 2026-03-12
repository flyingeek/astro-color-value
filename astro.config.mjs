// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightStripMdExtension from './plugins/starlight-strip-md-extension';
const isProd = import.meta.env.PROD;

// https://astro.build/config
export default defineConfig({
    site: isProd ? 'https://astro-color-value.netlify.app' : undefined,
    //base: isProd ? '/astro-color-value' : undefined,
    trailingSlash: "never",
    experimental: {
      contentIntellisense: true,
    },
    vite: { optimizeDeps: { exclude: ['astro/virtual-modules/prefetch.js'] } },
    integrations: [
        starlight({
            title: 'My Docs',
            social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/flyingeek/ethos-color-value' }],
            sidebar: [
                {
                    label: 'Guides',
                    items: [
                        // Each item here is one entry in the navigation menu.
                        { label: 'Example Guide', slug: 'guides/example' },
                    ],
                },
                {
                    label: 'Reference',
                    autogenerate: { directory: 'reference' },
                },
              ],
            plugins: [starlightStripMdExtension()],
        }),
    ],
});
