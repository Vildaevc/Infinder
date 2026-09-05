import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import { readFileSync } from 'node:fs';

// Версия userscript берётся из package.json — единый источник (Фаза 4.3)
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.js',
            userscript: {
                name: 'Infinder',
                namespace: 'http://tampermonkey.net/',
                version: pkg.version,
                description: 'Поиск изображений, SVG, шрифтов, цветов и медиа.',
                author: 'IdeaNova',
                match: ['*://*/*'],
                grant: [
                    'GM_download',
                    'GM_addStyle',
                    'GM_setClipboard'
                ],
                noframes: true,
                'run-at': 'document-end'
            }
        })
    ],
    server: {
        host: 'localhost'
    }
});
