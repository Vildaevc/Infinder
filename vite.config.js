import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.js',
            userscript: {
                name: 'Infinder',
                namespace: 'http://tampermonkey.net/',
                version: '2.0',
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
