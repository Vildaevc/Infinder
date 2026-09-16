import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import { readFileSync } from 'node:fs';

// Версия userscript берётся из package.json — единый источник (Фаза 4.3)
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// Репозиторий и адрес готовой сборки (используются для @updateURL/@downloadURL:
// TamperMonkey/OrangeMonkey будут автоматически подхватывать новые версии)
const REPO_URL = 'https://github.com/Vildaevc/Infinder';
const BUILD_URL = 'https://raw.githubusercontent.com/Vildaevc/Infinder/main/dist/infinder.user.js';

export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.js',
            userscript: {
                name: 'Infinder',
                namespace: REPO_URL,
                version: pkg.version,
                description: 'Поиск изображений, SVG, шрифтов, цветов и медиа на любой странице.',
                author: 'Vildaevc',
                license: 'MIT',
                homepageURL: REPO_URL,
                supportURL: REPO_URL + '/issues',
                updateURL: BUILD_URL,
                downloadURL: BUILD_URL,
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
