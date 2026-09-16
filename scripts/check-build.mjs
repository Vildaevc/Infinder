// Смоук-тест сборки (Фаза 6.2):
// собирает проект через Vite и проверяет метаданные итогового userscript.
// Запуск: npm run check (или npm test). Падает с ненулевым кодом при любой поломке.

import { build } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/infinder.user.js', import.meta.url));
const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8'));

const REPO = 'https://github.com/Vildaevc/Infinder';
const BUILD_URL = 'https://raw.githubusercontent.com/Vildaevc/Infinder/main/dist/infinder.user.js';

// Обязательные фрагменты метаданных
const required = [
    ['баннер userscript', '==UserScript=='],
    ['имя', '@name         Infinder'],
    ['namespace (GitHub)', '@namespace    ' + REPO],
    ['версия (из package.json)', '@version      ' + pkg.version],
    ['автор', '@author       Vildaevc'],
    ['лицензия', '@license      MIT'],
    ['описание', '@description'],
    ['homepageURL', '@homepageURL  ' + REPO],
    ['supportURL', '@supportURL   ' + REPO + '/issues'],
    ['updateURL (авто-обновление)', '@updateURL    ' + BUILD_URL],
    ['downloadURL', '@downloadURL  ' + BUILD_URL],
    ['match все сайты', '@match        *://*/*'],
    ['grant GM_download', '@grant        GM_download'],
    ['grant GM_addStyle', '@grant        GM_addStyle'],
    ['grant GM_setClipboard', '@grant        GM_setClipboard'],
    ['run-at document-end', '@run-at       document-end'],
    ['noframes', '@noframes'],
    ['конец баннера', '==/UserScript==']
];

// Фрагменты, которых НЕ должно быть (регрессии)
const forbidden = [
    ['внешний @require FileSaver', '@require'],
    ['кнопка минимизации', 'isf-minimize'],
    ['мёртвый primaryColor', 'primaryColor']
];

let failed = false;
const fail = function (msg) {
    failed = true;
    console.error('FAIL: ' + msg);
};

console.log('Сборка...');
try {
    await build();
} catch (err) {
    console.error('FAIL: сборка упала');
    console.error(err);
    process.exit(1);
}

let code;
try {
    code = readFileSync(DIST, 'utf8');
} catch (err) {
    console.error('FAIL: не найден dist/infinder.user.js после сборки');
    process.exit(1);
}

for (const [label, needle] of required) {
    if (code.includes(needle)) {
        console.log('  ok: ' + label);
    } else {
        fail('в метаданных нет: ' + needle);
    }
}

for (const [label, needle] of forbidden) {
    if (code.includes(needle)) {
        fail('найден запрещённый фрагмент: ' + label);
    } else {
        console.log('  ok: отсутствует ' + label);
    }
}

if (failed) process.exit(1);

const size = Buffer.byteLength(code, 'utf8');
console.log('\nSmoke OK: dist/infinder.user.js (' + size + ' байт, метаданные корректны)');
