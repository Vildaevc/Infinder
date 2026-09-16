# Infinder

**Infinder** — userscript (скрипт для браузера), который добавляет на любую страницу плавающую кнопку-«лупу» и помогает находить и скачивать медиа-ресурсы сайта: картинки, SVG, шрифты, цвета и медиафайлы.

Работает в **TamperMonkey**, **OrangeMonkey** и **Violentmonkey** (Chrome / Edge / Firefox / Opera и другие браузеры на Chromium).

- Автор: **Vildaevc** — https://github.com/Vildaevc
- Лицензия: **MIT** (см. [LICENSE.md](LICENSE.md))
- Текущая версия: **2.7.0**

---

## 🚀 Быстрый старт — просто использовать (без сборки)

Нужен только готовый файл скрипта — никаких Node.js и терминала.

1. **Установите менеджер скриптов** (если ещё нет):
   - Chrome / Edge / Opera: [TamperMonkey](https://www.tampermonkey.net/) или [OrangeMonkey](https://www.orangemonkey.com/)
   - Firefox: [TamperMonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/) или [Violentmonkey](https://addons.mozilla.org/firefox/addon/violentmonkey/)
2. **Установите Infinder** одним из способов:

   **Способ А — по ссылке (рекомендуется):**
   👉 [`https://raw.githubusercontent.com/Vildaevc/Infinder/main/dist/infinder.user.js`](https://raw.githubusercontent.com/Vildaevc/Infinder/main/dist/infinder.user.js)

   TamperMonkey/OrangeMonkey распознаёт `.user.js` в адресе и предложит установку. Если ссылка открылась как текст — скопируйте содержимое и вставьте в новый скрипт (см. способ Б).

   **Способ Б — из файла:**
   1. Скачайте файл [`dist/infinder.user.js`](dist/infinder.user.js) (кнопка **Raw** / «Скачать»).
   2. TamperMonkey → **Панель управления → Утилиты → Импорт из файла**.
   3. Либо создайте новый скрипт и вставьте содержимое файла целиком.

3. Откройте любую страницу — справа снизу появится круглая кнопка-лупа. Клик — открыть окно, клик по кнопке категории — поиск.

> **Авто-обновление:** в метаданных прописаны `@updateURL`/`@downloadURL` на ветку `main`, поэтому менеджер сам предложит обновление после выхода новой версии.

---

## 🛠 Для разработчиков — собрать самому (npm)

Требуется **Node.js ≥ 20** и npm.

```bash
git clone https://github.com/Vildaevc/Infinder.git
cd Infinder
npm install        # установка dev-зависимостей (vite, vite-plugin-monkey, eslint)
npm run lint       # проверка кода линтером (ESLint + контракты проекта)
npm run build      # production-сборка -> dist/infinder.user.js
npm run check      # смоук-тест: сборка + проверка метаданных userscript
```

Готовый файл появится в `dist/infinder.user.js` — устанавливается так же, как в разделе выше (импорт из файла).

### Режим разработки с авто-перезагрузкой

```bash
npm run dev        # dev-сервер vite-plugin-monkey
```

Создайте в менеджере скрипт-обёртку с `@require` на адрес dev-сервера (точный URL печатает сам сервер, обычно `http://localhost:3000/infinder.user.js`) — правки в `src/` будут подхватываться автоматически.

### Команды

| Команда | Что делает |
|---|---|
| `npm install` | Установка зависимостей |
| `npm run dev` | Dev-сервер с горячей перезагрузкой |
| `npm run lint` | ESLint + проверка контрактов проекта (скрипт не минифицируется) |
| `npm run build` | Сборка `dist/infinder.user.js` |
| `npm run check` / `npm test` | Сборка + проверка метаданных (падает при поломке) |

**Важно:** `dist/infinder.user.js` хранится в репозитории (чтобы работала ссылка «просто использовать»). После правок в `src/` обязательно выполните `npm run build` (или `npm run check`) и закоммитьте обновлённый `dist/` — CI проверяет, что сборка соответствует исходникам.

---

## Возможности

| Категория | Что находит |
|---|---|
| **Картинки** | Все `<img>` (включая `srcset`) и фоновые изображения (`background-image`, в том числе многослойные). Плитки отсортированы **по разрешению — от больших к меньшим**; не загрузившиеся картинки показаны заглушкой |
| **SVG** | Inline-`<svg>` (дубли отбрасываются по полной сериализации) и внешние `img[src$=".svg"]` (регистр расширения не важен) |
| **Цвета** | Цвета страницы из `color`/`backgroundColor`, сгруппированы по частоте; поддерживаются все форматы (rgb/rgba/hsl/имена), у полупрозрачных сохраняется альфа (`#rrggbbaa`); клик — копирование HEX |
| **Шрифты** | `@font-face` из таблиц стилей страницы: превью и скачивание файла шрифта |
| **Медиа** | `<video>/<audio>/<source>` и ссылки на `mp4/webm/mp3/wav/mov/avi/mkv/pdf/zip/rar` |

Дополнительно:

- **Клик по элементу результата** — быстрая загрузка в папку загрузок браузера;
- **Кнопка с дискетой** на каждом элементе — системный диалог **«Сохранить как...»**;
- **«Скачать все»** — пакетное скачивание всех найденных файлов (пауза 0.5 с между файлами);
- спиннер во время поиска и понятные пустые состояния по категориям;
- плавающая кнопка и окно перетаскиваются, позиция кнопки запоминается;
- тёмная glassmorphism-тема, полностью изолированная от стилей сайта;
- надёжная работа без внешних CDN, защита от сбоев `localStorage`.

### Совместимость менеджеров скриптов

| Менеджер | Статус | Примечание |
|---|---|---|
| TamperMonkey | ✅ Полная поддержка | `GM_download` — фоновая загрузка, диалог «Сохранить как...» |
| Violentmonkey | ✅ Полная поддержка | То же |
| OrangeMonkey | ✅ Поддержка с фолбэком | `GM_download` недоступен: файл скачивается через ссылку/Blob, диалог «Сохранить как...» определяется настройками браузера |

---

## Архитектура

```
src/
├── main.js               # Точка входа: виджет, восстановление позиции, обработчики
├── config.js             # Конфигурация: размеры, z-index, ширина попапа, цвета, позиция
├── state.js              # Состояние: isSearching, foundUrls (Set из {url, name})
├── utils.js              # resolveUrl(), getFileName()
├── download.js           # downloadFile() (GM_download + фолбэк) и createSaveAsButton()
├── scan.js               # Пошаговый обход элементов страницы (для тяжёлых парсеров)
├── dom.js                # createWidget(): разметка виджета + инжект стилей
├── drag.js               # makeDraggable(): перетаскивание кнопки и окна
├── styles.js             # CSS темы (изоляция под #isf-root)
└── search/
    ├── index.js          # searchDispatcher(): диспетчер, «Скачать все», лоадер
    ├── images.js         # Картинки (сортировка по разрешению, заглушки битых)
    ├── svg.js            # Inline и внешние SVG
    ├── colors.js         # Цвета (canvas-нормализация, альфа)
    ├── fonts.js          # @font-face
    └── media.js          # Видео/аудио/файлы
```

**Поток работы**

1. `main.js` создаёт виджет (`createWidget()`) и навешивает обработчики.
2. Клик по кнопке категории → `searchDispatcher(action)`.
3. Диспетчер показывает спиннер, очищает результаты и вызывает нужный парсер.
4. Парсер наполняет `state.foundUrls` записями `{url, name}` и строит плитки/строки в DOM.
5. Клик по элементу → `downloadFile(url, name)`; «Скачать все» — те же записи с задержкой.

**Скачивание** унифицировано в `src/download.js`: сначала `GM_download` (не зависит от CORS), затем фолбэк (ссылка для `data:`/`blob:`/same-origin, `fetch → Blob` для кросс-доменных ресурсов с CORS, в крайнем случае — новая вкладка).

**Конфигурация** (`src/config.js`): `btnSize`, `zIndex`, `toastZIndex`, `popupWidth`, `accentColor`, `defaultPos`.

**Версия** userscript берётся из `package.json` через `vite.config.js` — единый источник.

---

## Тестирование

- Автоматически: `npm run lint` (ESLint + контракты проекта) и `npm run check` (сборка и проверка метаданных userscript: имя, версия, `@match`, `@grant`, отсутствие внешних `@require`).
- Вручную: чек-лист в [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) (раздел «Чек-лист ручного тестирования»).
- История работ по фазам — в [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) (раздел «Статус выполнения»), технический разбор кода — в [Projects_analysis.md](Projects_analysis.md).

## Документация репозитория

| Файл | Назначение |
|---|---|
| [README.md](README.md) | Этот файл: установка, сборка, возможности |
| [AGENTS.md](AGENTS.md) | Правила и конвенции разработки (в том числе для ИИ-агентов) |
| [CHANGELOG.md](CHANGELOG.md) | История версий |
| [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) | Дорожная карта, статус фаз, чек-лист тестирования |
| [Projects_analysis.md](Projects_analysis.md) | Технический анализ проекта |
| [LICENSE.md](LICENSE.md) | Лицензия MIT |

---

## Лицензия

MIT © [Vildaevc](https://github.com/Vildaevc). Подробности — в [LICENSE.md](LICENSE.md).
