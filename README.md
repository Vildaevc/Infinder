# Infinder

**English** · [Русский](README.ru.md)

**Infinder** is a browser userscript that adds a floating magnifier button to any page and helps you find and download its media: images, SVG, fonts, colors and media files.

Works with **Tampermonkey**, **OrangeMonkey** and **Violentmonkey** (Chrome / Edge / Firefox / Opera and other Chromium browsers).

- Author: **Vildaevc** — https://github.com/Vildaevc
- License: **MIT** (see [LICENSE.md](LICENSE.md))
- Current version: **2.8.0**
- Widget language: **English by default**, automatically switches to **Russian** for `ru` browser locales

---

## 🚀 Quick start — just use it (no build required)

You only need the ready-made script file — no Node.js or terminal.

1. **Install a userscript manager** (if you don't have one):
   - Chrome / Edge / Opera: [Tampermonkey](https://www.tampermonkey.net/) or [OrangeMonkey](https://www.orangemonkey.com/)
   - Firefox: [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/) or [Violentmonkey](https://addons.mozilla.org/firefox/addon/violentmonkey/)
2. **Install Infinder**, either way:

   **Option A — by link (recommended):**
   👉 [`https://raw.githubusercontent.com/Vildaevc/Infinder/main/dist/infinder.user.js`](https://raw.githubusercontent.com/Vildaevc/Infinder/main/dist/infinder.user.js)

   Tampermonkey/OrangeMonkey detects `.user.js` in the URL and offers to install. If the link opens as plain text, copy the content and paste it into a new script (Option B).

   **Option B — from the file:**
   1. Download [`dist/infinder.user.js`](dist/infinder.user.js) (the **Raw** / "Download" button).
   2. Tampermonkey → **Dashboard → Utilities → Import from file**.
   3. Or create a new script and paste the whole file content.

   You can also grab the packaged file from [GitHub Releases](https://github.com/Vildaevc/Infinder/releases/latest).

3. Open any page — a round magnifier button appears in the bottom-right corner. Click it to open the panel, then click a category to start searching.

> **Auto-updates:** the metadata contains `@updateURL`/`@downloadURL` pointing to `main`, so your userscript manager will offer new versions automatically.

---

## 🛠 For developers — build it yourself (npm)

Requires **Node.js ≥ 20** and npm.

```bash
git clone https://github.com/Vildaevc/Infinder.git
cd Infinder
npm install        # dev dependencies (vite, vite-plugin-monkey, eslint)
npm run lint       # ESLint + project contracts
npm run build      # production build -> dist/infinder.user.js
npm run check      # smoke test: build + userscript metadata validation
```

The built file appears at `dist/infinder.user.js` — install it the same way as above (import from file).

### Development mode with hot reload

```bash
npm run dev        # vite-plugin-monkey dev server
```

Create a wrapper script in your manager with `@require` pointing to the dev server URL (the exact URL is printed by the server, usually `http://localhost:3000/infinder.user.js`) — edits in `src/` are picked up automatically.

### Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server with hot reload |
| `npm run lint` | ESLint + project contract checks |
| `npm run build` | Build `dist/infinder.user.js` |
| `npm run check` / `npm test` | Build + metadata validation (fails on a broken build) |

**Important:** `dist/infinder.user.js` is committed to the repository (that is what the "just use it" link and `@updateURL` rely on). After changing anything in `src/`, run `npm run build` (or `npm run check`) and commit the updated `dist/` — CI verifies that the committed build matches the sources.

---

## Features

| Category | What it finds |
|---|---|
| **Images** | Every `<img>` (including `srcset`) and CSS background images (`background-image`, including multi-layer ones). Tiles are **sorted by resolution, largest first**; images that fail to load are shown as placeholders |
| **SVG** | Inline `<svg>` (duplicates dropped by full serialization) and external `img[src$=".svg"]` (extension case-insensitive) |
| **Colors** | Page colors from `color`/`backgroundColor`, grouped by frequency; all formats supported (rgb/rgba/hsl/named), alpha preserved for translucent ones (`#rrggbbaa`); click copies the HEX |
| **Fonts** | `@font-face` rules from page stylesheets: preview and font file download |
| **Media** | `<video>`/`<audio>`/`<source>` elements and links to `mp4/webm/mp3/wav/mov/avi/mkv/pdf/zip/rar` |

Also:

- **Click an item** — quick download into the browser's downloads folder;
- **Floppy-disk button** on every item — system **"Save as…"** dialog;
- spinner while scanning and clear per-category empty states;
- the button and the panel are draggable (mouse, touch, stylus) and the button position is remembered;
- dark glassmorphism theme, fully isolated from the host page styles;
- no external CDN dependencies, safe against broken/unavailable `localStorage`.

### Userscript manager compatibility

| Manager | Status | Notes |
|---|---|---|
| Tampermonkey | ✅ Full support | `GM_download` — background downloads, "Save as…" dialog |
| Violentmonkey | ✅ Full support | Same |
| OrangeMonkey | ✅ Supported via fallback | `GM_download` is unavailable: files are downloaded via link/Blob, and the "Save as…" dialog depends on browser settings |

### Interface language

The widget ships with two locales:

- **English** — used by default for any browser language;
- **Russian** — enabled automatically when `navigator.language` starts with `ru`.

Detection happens once at startup; the `@description:en` / `@description:ru` metadata lines let the manager localize the script entry as well. All UI strings live in [`src/i18n.js`](src/i18n.js) — see the contribution rules in [AGENTS.md](AGENTS.md).

---

## Architecture

```
src/
├── main.js               # Entry point: widget, position restore, event handlers
├── config.js             # Configuration: sizes, z-index, popup width, colors, default position
├── state.js              # Shared state: isSearching, foundUrls (Set of {url, name})
├── i18n.js               # UI localization (en base, ru translation, auto-detect)
├── utils.js              # resolveUrl(), getFileName()
├── download.js           # downloadFile() (GM_download + fallback) and createSaveAsButton()
├── scan.js               # Chunked DOM walker for heavy parsers
├── dom.js                # createWidget(): widget markup + style injection
├── drag.js               # makeDraggable(): pointer-events based dragging
├── styles.js             # Theme CSS (isolated under #isf-root)
└── search/
    ├── index.js          # searchDispatcher(): dispatcher, "Download all", loader
    ├── images.js         # Images (resolution sorting, broken-image placeholders)
    ├── svg.js            # Inline and external SVG
    ├── colors.js         # Colors (canvas normalization, alpha)
    ├── fonts.js          # @font-face
    └── media.js          # Video/audio/files
```

**Data flow**

1. `main.js` builds the widget (`createWidget()`) and wires up the handlers.
2. Clicking a category button calls `searchDispatcher(action)`.
3. The dispatcher shows a spinner, clears previous results and runs the parser.
4. The parser fills `state.foundUrls` with `{url, name}` records and renders tiles/rows.
5. Clicking an item calls `downloadFile(url, name)`; "Download all" replays the same records with a delay.

**Downloading** is unified in `src/download.js`: `GM_download` first (CORS-independent), then a fallback (anchor download for `data:`/`blob:`/same-origin URLs, `fetch → Blob` for cross-origin resources with CORS, and opening a new tab as the last resort).

**Configuration** (`src/config.js`): `btnSize`, `zIndex`, `toastZIndex`, `popupWidth`, `accentColor`, `defaultPos`.

**Version** comes from `package.json` via `vite.config.js` — a single source of truth.

---

## Testing

- Automated: `npm run lint` (ESLint + project contracts) and `npm run check` (build and userscript metadata validation: name, version, `@match`, `@grant`, no external `@require`).
- Manual: the manual testing checklist lives in [AGENTS.md](AGENTS.md).

## Repository docs

| File | Purpose |
|---|---|
| [README.md](README.md) | This file (English) |
| [README.ru.md](README.ru.md) | Russian translation |
| [AGENTS.md](AGENTS.md) | Development rules, code contracts and testing checklist |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [LICENSE.md](LICENSE.md) | MIT license |

---

## License

MIT © [Vildaevc](https://github.com/Vildaevc). See [LICENSE.md](LICENSE.md).
