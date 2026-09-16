// Конфигурация ESLint (flat config). Запуск: npm run lint
import js from '@eslint/js';

// Глобальные объекты браузера и менеджера скриптов (рантайм userscript)
const browserGlobals = {
    window: 'readonly',
    document: 'readonly',
    console: 'readonly',
    navigator: 'readonly',
    location: 'readonly',
    localStorage: 'readonly',
    confirm: 'readonly',
    fetch: 'readonly',
    URL: 'readonly',
    Image: 'readonly',
    XMLSerializer: 'readonly',
    CSSRule: 'readonly',
    IntersectionObserver: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    GM_download: 'readonly',
    GM_addStyle: 'readonly',
    GM_setClipboard: 'readonly'
};

// Контракты проекта (см. AGENTS.md) — проверяются линтером
const contractRules = [
    'error',
    {
        selector: 'CallExpression[callee.property.name="querySelectorAll"][arguments.0.value="*"]',
        message: 'Тяжёлый обход DOM: используйте scanPageElements() из src/scan.js'
    },
    {
        selector: 'CallExpression[callee.name="saveAs"]',
        message: 'Скачивание только через downloadFile() из src/download.js'
    },
    {
        selector: 'CallExpression[callee.name="GM_download"]',
        message: 'Скачивание только через downloadFile() из src/download.js'
    }
];

export default [
    {
        ignores: ['dist/**', 'node_modules/**']
    },
    js.configs.recommended,
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: browserGlobals
        },
        rules: {
            'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
            'no-empty': ['error', { allowEmptyCatch: true }],
            'no-console': ['warn', { allow: ['error', 'warn'] }],
            eqeqeq: 'error',
            'no-restricted-syntax': contractRules
        }
    },
    {
        // Единственное место, где разрешён прямой GM_download
        files: ['src/download.js'],
        rules: { 'no-restricted-syntax': 'off' }
    },
    {
        files: ['scripts/**/*.mjs', 'vite.config.js', 'eslint.config.mjs'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                URL: 'readonly',
                fetch: 'readonly',
                setTimeout: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
            'no-console': 'off'
        }
    }
];
