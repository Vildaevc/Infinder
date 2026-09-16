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

let failed = false;
const fail = (msg) => {
    failed = true;
    console.error('FAIL: ' + msg);
};

// Разбор блока метаданных: ключ -> список значений (без учёта выравнивания пробелами)
function parseMetadata(code) {
    const meta = new Map();
    const block = code.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
    if (!block) return meta;
    for (const line of block[0].split(/\r?\n/)) {
        const parsed = line.match(/^\/\/\s*@(\S+)\s*(.*)$/);
        if (!parsed) continue;
        const key = parsed[1];
        if (!meta.has(key)) meta.set(key, []);
        meta.get(key).push(parsed[2].trim());
    }
    return meta;
}

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

const meta = parseMetadata(code);
if (0 === meta.size) {
    console.error('FAIL: не найден блок ==UserScript==');
    process.exit(1);
}

const expect = (label, key, value) => {
    const values = meta.get(key);
    if (!values) return fail(`нет метаданного @${key} (${label})`);
    if (value && !values.includes(value)) return fail(`@${key} = ${JSON.stringify(values)}, ожидалось "${value}" (${label})`);
    console.log(`  ok: ${label}`);
};

const expectPresent = (label, key) => expect(label, key);
const expectAbsent = (label, key) => {
    if (meta.has(key)) return fail(`не должно быть @${key} (${label})`);
    console.log(`  ok: отсутствует ${label}`);
};

// Метаданные, от которых зависят установка, обновление и права
expect('имя', 'name', 'Infinder');
expect('namespace (GitHub)', 'namespace', REPO);
expect('версия (из package.json)', 'version', pkg.version);
expect('автор', 'author', 'Vildaevc');
expect('лицензия', 'license', 'MIT');
expectPresent('описание', 'description');
expectPresent('описание (en)', 'description:en');
expectPresent('описание (ru)', 'description:ru');
expect('homepageURL', 'homepageURL', REPO);
expect('supportURL', 'supportURL', REPO + '/issues');
expect('updateURL (авто-обновление)', 'updateURL', BUILD_URL);
expect('downloadURL', 'downloadURL', BUILD_URL);
expect('match все сайты', 'match', '*://*/*');
expect('run-at', 'run-at', 'document-end');
expectPresent('noframes', 'noframes');

for (const grant of ['GM_addStyle', 'GM_download', 'GM_setClipboard']) {
    expect(`grant ${grant}`, 'grant', grant);
}

expectAbsent('внешний @require (CDN)', 'require');

// Регрессии в коде
const forbidden = [
    ['кнопка минимизации', 'isf-minimize'],
    ['мёртвый primaryColor', 'primaryColor']
];
for (const [label, needle] of forbidden) {
    if (code.includes(needle)) fail('найден запрещённый фрагмент: ' + label);
    else console.log('  ok: отсутствует ' + label);
}

if (failed) process.exit(1);

const size = Buffer.byteLength(code, 'utf8');
console.log('\nSmoke OK: dist/infinder.user.js (' + size + ' байт, метаданные корректны)');
