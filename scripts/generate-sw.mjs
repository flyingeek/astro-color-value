import { promises as fs } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const swPath = path.join(distDir, 'sw.js');
const base = '/astro-color-value';

const staticAssetPattern = /\.(?:js|css|html|ico|png|svg|webp|woff2|json|wasm|pagefind|pf_meta|xml|webmanifest)$/i;

async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(async (entry) => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) return walk(fullPath);
            return [fullPath];
        }),
    );
    return files.flat();
}

function toPublicUrl(filePath) {
    const relativePath = path.relative(distDir, filePath).split(path.sep).join('/');
    if (relativePath === 'index.html') return `${base}/`;
    if (relativePath.endsWith('/index.html')) {
        const route = relativePath.slice(0, -'index.html'.length);
        return `${base}/${route}`;
    }
    return `${base}/${relativePath}`;
}

function unique(values) {
    return [...new Set(values)];
}

async function main() {
    const allFiles = await walk(distDir);
    const precacheUrls = unique(
        allFiles
            .filter((filePath) => path.resolve(filePath) !== swPath)
            .filter((filePath) => staticAssetPattern.test(filePath))
            .map(toPublicUrl),
    ).sort();

    const sw = `const CACHE_NAME = 'color-value-offline-v1';
const PRECACHE_URLS = ${JSON.stringify(precacheUrls, null, 4)};

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
        ).then(() => self.clients.claim()),
    );
});

function normalizeNavigationPath(url) {
    if (url.pathname === '${base}' || url.pathname === '${base}/') return '${base}/';
    if (url.pathname.endsWith('/')) return url.pathname;
    return url.pathname + '/';
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET' || url.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith((async () => {
            const cache = await caches.open(CACHE_NAME);
            const normalizedPath = normalizeNavigationPath(url);
            const cached = await cache.match(normalizedPath, { ignoreSearch: true });
            if (cached) return cached;

            try {
                const response = await fetch(request);
                if (response.ok) cache.put(normalizedPath, response.clone());
                return response;
            } catch {
                return cache.match('${base}/', { ignoreSearch: true });
            }
        })());
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request, { ignoreSearch: true });
        if (cached) return cached;

        try {
            const response = await fetch(request);
            if (response.ok) cache.put(request, response.clone());
            return response;
        } catch {
            return Response.error();
        }
    })());
});
`;

    await fs.writeFile(swPath, sw, 'utf8');
    console.log(`generate-sw OK - wrote ${precacheUrls.length} URLs to dist/sw.js`);
}

main().catch((error) => {
    console.error('generate-sw FAILED');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});