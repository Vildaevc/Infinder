# Infinder — Анализ проекта

> Документ описывает текущее состояние проекта по состоянию на момент анализа.
> Предназначен как справочник для дальнейшей разработки, исправления ошибок и рефакторинга.

---

## 1. Что это за проект

**Infinder** — userscript (Tampermonkey / Violentmonkey), который встраивает на любую страницу (`*://*/*`) плавающий виджет-«лупу» и позволяет извлечь медиа-ресурсы сайта.

| Категория | `data-action` | Что делает | Модуль |
|---|---|---|---|
| Картинки | `images` | Собирает `<img>` (`src` + `srcset`) и фоновые картинки (`background-image`) | `src/search/images.js` |
| SVG | `svg` | Находит inline-`<svg>` и `<img src="*.svg">` | `src/search/svg.js` |
| Цвета | `colors` | Извлекает цвета из `color`/`backgroundColor`, группирует по частоте, копирует HEX | `src/search/colors.js` |
| Шрифты | `fonts` | Парсит `@font-face` из `document.styleSheets`, превью + скачивание | `src/search/fonts.js` |
| Медиа | `media` | `<video>/<audio>/<source>` и ссылки на `mp4/webm/mp3/wav/mov/avi/mkv/pdf/zip/rar` | `src/search/media.js` |

Дополнительно: drag-and-drop кнопки и окна, запоминание позиции кнопки в `localStorage`, кнопка «Скачать все» с задержкой между файлами, toast-уведомления.

---

## 2. Технологический стек

- **Сборка:** Vite 7 + `vite-plugin-monkey` 7.
- **Модульность:** ES Modules (`"type": "module"` в `package.json`).
- **Зависимости:** только `devDependencies` (`vite`, `vite-plugin-monkey`). Runtime-зависимостей нет.
- **FileSaver.js** подключается через CDN (`@require` в метаданных), а не как npm-пакет.
- **GM API** импортируется из виртуального модуля `$` (предоставляется `vite-plugin-monkey`): `GM_download`, `GM_addStyle`, `GM_setClipboard`.
- **Выход:** `dist/infinder.user.js` — единый файл userscript.

---

## 3. Структура файлов

```
Infinder/
├── archive/
│   └── legacy_script.js      # Старая монолитная версия (архив, не участвует в сборке)
├── dist/
│   └── infinder.user.js      # Собранный userscript (результат npm run build)
├── src/
│   ├── main.js               # Точка входа: создание виджета, обработчики, restore позиции
│   ├── config.js             # Константы (btnSize, zIndex, accentColor, primaryColor)
│   ├── state.js              # Глобальное состояние (isSearching, foundUrls, drag)
│   ├── utils.js              # resolveUrl(), getFileName()
│   ├── dom.js                # createWidget(): DOM виджета + инжект стилей
│   ├── drag.js               # makeDraggable(): перетаскивание
│   ├── styles.js             # CSS-строка (тёмная glassmorphism-тема)
│   └── search/
│       ├── index.js          # searchDispatcher(): диспетчер поиска + «Скачать все»
│       ├── images.js         # searchImages()
│       ├── svg.js            # searchSvg()
│       ├── colors.js         # searchColors()
│       ├── fonts.js          # searchFonts()
│       └── media.js          # searchMedia()
├── package.json
├── package-lock.json
├── vite.config.js            # Конфиг vite-plugin-monkey (метаданные userscript)
└── .gitignore                # node_modules/, dist/
```

---

## 4. Архитектура и зависимости

### 4.1 Граф зависимостей модулей

```
src/main.js  (точка входа)
 ├── config.js
 ├── state.js
 ├── dom.js  (createWidget)
 │    ├── styles.js          (подставляет значения из config)
 │    └── GM_addStyle ($)
 ├── drag.js (makeDraggable)
 └── search/index.js (searchDispatcher)
      ├── state.js
      ├── utils.js (getFileName)
      ├── GM_download ($)
      ├── images.js → state, utils, GM_download ($)
      ├── svg.js    → state, utils
      ├── colors.js → GM_setClipboard ($)
      ├── fonts.js  → state, utils
      └── media.js  → state, utils
```

### 4.2 Роли модулей

| Модуль | Роль |
|---|---|
| `config.js` | Настройки. Частично мёртвый код (см. §6). |
| `state.js` | Разделяемый мутабельный синглтон: `isSearching`, `foundUrls`. |
| `dom.js` | Строит DOM виджета (кнопка, попап, toast) и инжектит стили через `GM_addStyle`. |
| `drag.js` | Перетаскивание кнопки и попапа (через замыкание, **не** через `state.drag`). |
| `utils.js` | `resolveUrl` (абсолютизация URL) и `getFileName` (имя файла из URL). |
| `search/*` | Пять «парсеров» + диспетчер `searchDispatcher`. |
| `styles.js` | Тёмная glassmorphism-тема, инжектится через `GM_addStyle`. |

### 4.3 Поток работы (data flow)

1. `main.js` создаёт виджет через `createWidget()`.
2. Клик по кнопке категории → `searchDispatcher(action)`.
3. `searchDispatcher` очищает результаты, сбрасывает `state.foundUrls`, ставит флаг `isSearching`, вызывает нужный парсер.
4. Парсер пишет результаты в `#isf-results-container` и в `state.foundUrls`.
5. Кнопка «Скачать все» читает `state.foundUrls` и скачивает все записи с задержкой.

---

## 5. Сборка и установка в TamperMonkey

Текущий workflow (как используется в проекте):

1. Правки в `src/`.
2. `npm run build` → генерирует `dist/infinder.user.js`.
3. Файл переносится в TamperMonkey для тестирования.

Команды:

```bash
npm install      # установка dev-зависимостей
npm run dev      # dev-сервер Vite (vite-plugin-monkey)
npm run build    # production-сборка в dist/infinder.user.js
npm test         # заглушка (тестов нет)
```

> Примечание: `npm run dev` запускает dev-сервер `vite-plugin-monkey`, который отдаёт userscript по локальному URL — его можно подключить в TamperMonkey через `@require` для горячей перезагрузки при разработке. Сейчас в проекте используется путь «собрал → перенёс в TamperMonkey».

---

## 6. Структурные проблемы

### 6.1 Мёртвый код и дублирование
- **`config.primaryColor`** (`src/config.js:5`) нигде не используется. Сборщик выкинул его из бандла (в `dist` остались только `btnSize`/`zIndex`/`accentColor`).
- **`state.drag`** (`src/state.js:5-13`) — объект `{ active, currentX/Y, initialX/Y, xOffset/yOffset }` нигде не читается. `drag.js` держит состояние драга в собственных локальных переменных замыкания.
- **`legacy_script.js`** — старая монолитная версия. **Заархивирована** в `archive/legacy_script.js` и не участвует в сборке.

### 6.2 Непоследовательная стратегия скачивания
Два разных механизма:
- `images.js` и `search/index.js` — `GM_download(...)` с fallback на `saveAs(...)`;
- `svg.js` и `fonts.js` — напрямую `saveAs(...)` (зависят от CDN FileSaver из `@require`).

SVG и шрифты игнорируют `GM_download`, хотя он надёжнее (не зависит от CDN и CORS). При недоступном CDN эти категории молча ломаются.

### 6.3 Слабоватая изоляция стилей
`styles.js` делает частичную изоляцию: `#isf-root { all: initial }` + `box-sizing`/`font-family` с `!important`. Но для потомков форсируются только `box-sizing` и `font-family`. Стили сайта-хоста (глобальные `* { margin:0 }`, стилизация `button`/`svg`) могут просачиваться внутрь попапа.

### 6.4 Нет документации и тестов
- `npm test` — заглушка.
- До этого документа не было README и описания архитектуры.
- Версии рассогласованы: `package.json` → `1.0.0`, метаданные userscript → `2.0`, описание «v2.0».

---

## 7. Найденные баги (по важности)

### 🔴 Критичный: клик по кнопке категории может не сработать
`src/main.js:82-89` использует `e.target` вместо `e.currentTarget`:

```js
e.addEventListener("click", function (e) {
    ...
    e.target.classList.add("isf-active");
    searchDispatcher(e.target.dataset.action);
});
```

Кнопки содержат дочерние `<svg>` и `<span>`. Клик по иконке или подписи даёт `e.target` = иконка/подпись → `dataset.action === undefined` → поиск не запускается (или показывает «Ничего не найдено»), а класс `isf-active` вешается на неверный узел. **Работает только клик строго по фону кнопки.** Исправление — `e.currentTarget`.

### 🟠 `localStorage` без защиты от исключения
`src/main.js:19`:
```js
var savedPos = JSON.parse(localStorage.getItem("isf_pos_v3")) || { right: 20, bottom: 20 };
```
`JSON.parse` вне `try/catch`, `localStorage` может быть недоступен (приватный режим, `file://`, заблокированные cookie). Повреждённое значение уронит весь IIFE — кнопка не появится.

### 🟠 Дедупликация inline-SVG по длине `innerHTML`
`src/search/svg.js:37-39` использует длину строки как ключ уникальности:
```js
var n = e.innerHTML.length;
if (!i.has(n)) { i.add(n); r(e, false, ...); }
```
Разные SVG с одинаковой длиной строки считаются дублями и отбрасываются. Пустые `<svg>` (спейсеры) имеют длину 0 и схлопываются в один.

### 🟠 Счётчик картинок ≠ числу плиток
`src/search/images.js`: `return e.size` считает добавленные URL, а плитка добавляется в DOM только в `n.onload`. Не загрузившиеся картинки попадают в счётчик и в `state.foundUrls`, но в UI их нет. Статус «Найдено: N» не совпадает с видимым числом плиток; «Скачать все» скачает и битые URL.

### 🟡 «Ошибка» и «Ничего не найдено» одновременно
`src/search/index.js:56-64`: в `finally` стоит `if (0 === i) → "Ничего не найдено"`. Если парсер бросил исключение, `i` остаётся `0` → поверх «Ошибка поиска» пишется «Ничего не найдено».

### 🟡 XSS через имя шрифта
`src/search/fonts.js:27-37`: `font-family` (`a`) подставляется в `innerHTML` без экранирования. Вредоносная страница может инжектить HTML внутрь виджета.

### 🟡 Магическое центрирование не совпадает с шириной
`src/main.js:39-40`: `popup.style.left = innerWidth/2 - 210`. Смещение `210` — половина старой ширины `420px` (из legacy). Сейчас попап `380px` → корректно `-190`. Окно стоит ~20px левее центра.

### 🟡 `img[src$=".svg"]` регистрозависим
`src/search/svg.js:45` не найдёт `image.SVG` / `image.Svg`.

### 🟢 Мелочи
- `src/search/colors.js` понимает только `#hex`/`rgb`/`rgba`; пропускает `hsl()`, именованные цвета, `currentColor`; альфа у полупрозрачного `rgba` отбрасывается.
- Производительность: `document.querySelectorAll("*")` + `getComputedStyle` по каждому элементу (в `images.js` для фонов и в `colors.js`) — тяжело на крупных страницах.
- `search/index.js:37-38`: мёртвая обёртка `(function e(i){...})(e)` — параметр `i` не используется.
- Типы в `state.foundUrls` смешанные: картинки/шрифты/медиа кладут строку, SVG — объект `{url, name}`. Работает за счёт `e.url || e` в `index.js:43`, но хрупко.
- Двойная защита от iframe: `noframes: true` в метаданных + `window.self !== window.top` в `main.js:11`.
- Хардкод `z-index: 2147483648` для toast в `styles.js:374` дублирует `config.zIndex` (+1).

---

## 8. Сильные стороны

- Чистое разделение «парсеров» по модулям `search/*` — легко добавить новую категорию.
- Централизованный диспетчер `searchDispatcher` с флагом `isSearching` (защита от повторных запусков).
- Единый `resolveUrl` для корректной работы с относительными URL.
- Сборка в один файл; корректный метаданный блок в `dist` (grant/noframes/require на месте).
- Стили вынесены в отдельный модуль с конфигурируемыми цветами/размерами.
- Современный стек (Vite + vite-plugin-monkey) — удобно развивать.

---

## 9. Рекомендации (кратко)

1. `e.target` → `e.currentTarget` в обработчике категорий.
2. `JSON.parse(localStorage...)` в `try/catch`.
3. Дедупликация SVG по хешу от `outerHTML`, а не по длине.
4. Унифицировать скачивание: везде `GM_download`, `saveAs` только как fallback.
5. Разделить «найдено URL» и «отобразилось в UI» в `images.js` (placeholder при `onerror`).
6. Экранировать `font-family` перед вставкой в HTML.
7. Magic-числа (ширина попапа/центрирование, z-index toast) → в `config`.
8. Удалить мёртвый код: `config.primaryColor`, `state.drag`, IIFE-параметр.
9. Усилить изоляцию стилей.
10. Добавить README и тесты/смоук-проверку сборки.

Полный план работ с приоритетами и критериями приёмки — в [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md).
