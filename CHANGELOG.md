# Changelog

All notable changes to this project. The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [2.8.0] — 2026

### Added

- **UI localization**: English is the default language, Russian is enabled automatically when the browser locale starts with `ru` (`navigator.language`). All widget strings live in `src/i18n.js`.
- Localized userscript metadata: `@description:en` / `@description:ru`, so the userscript manager shows the description in the user's language.
- Bilingual documentation: [README.md](README.md) is now English (primary), [README.ru.md](README.ru.md) is the Russian version, with language switchers in both.

### Changed

- Widget markup, statuses, toasts and tooltips no longer contain hardcoded Russian text — everything goes through `t()` from `src/i18n.js`.
- Smoke test (`npm run check`) now parses the userscript metadata block instead of matching fixed whitespace, and additionally verifies the localized descriptions.

## [2.7.1] — 2026

### Fixed

- **The ✕ button did not close the panel with a mouse**: pointer capture (`setPointerCapture`) was taken on pointerdown for the header, which made the browser retarget the `click` to the panel itself instead of the button. Capture is now taken only once dragging actually starts, and presses on buttons/links inside the panel never start a drag.
- **The panel sometimes could not be dragged and grabbed the header text instead**: text selection is now disabled (`user-select: none !important`) and the native `dragstart` is cancelled.

## [2.7.0] — 2026

First public release on GitHub: the fully reworked 2.x line (modular architecture instead of the previous monolithic script).

### Added

- **"Save as…"** — a floppy-disk button on every result item opens the system save dialog (clicking the item itself downloads straight to the browser's downloads folder).
- **Touch dragging**: dragging moved to Pointer Events (mouse, finger, stylus) with `touch-action: none`.
- **Image sorting by resolution** (W×H, largest first), applied progressively as images load.
- **Lazy thumbnail loading**: only visible tiles keep decoded images, which saves memory on galleries with hundreds of pictures.
- **Placeholders for images that fail to load** (not counted, not included in "Download all").
- **Search spinner** and per-category empty states.
- **All color formats supported** (`rgb/rgba/hsl/named`, normalized through canvas) with alpha preserved (`#rrggbbaa`).
- **Auto-updates** for the userscript (`@updateURL`/`@downloadURL` pointing to `main`), plus author/license metadata.
- Documentation (`README.md`, `AGENTS.md`, `CHANGELOG.md`), a build smoke test (`npm run check`), **ESLint** with project contract checks (`npm run lint`) and GitHub Actions (CI plus release on tag).

### Fixed

- Clicking a category button's icon or label did not start a search (`e.target` → `e.currentTarget`).
- The widget crashed when `localStorage` was unavailable or corrupted (reads and writes wrapped in `try/catch`).
- SVG: duplicates were detected by string length — now by full serialization; the widget's own icons no longer appear in results; extension case is ignored, and SVGs with query strings (`icon.svg?v=2`) are not duplicated under Images.
- Media links with query strings (`video.mp4?token=…`, `file.zip?dl=1`) were not found — the extension is now checked against the URL path; `blob:` player streams (MSE) are skipped.
- "Found: N" did not match the number of tiles, and "Download all" tried to download broken URLs.
- "Nothing found" no longer overwrote the "Search failed" message.
- The panel was not centered precisely (magic number → measurement of the actual size).
- XSS through `font-family` and file names (DOM is now built with `textContent`/CSSOM).
- Copying a color now gives clear feedback when the clipboard is unavailable.
- `data:` images were downloaded as an extensionless "file" — the name now comes from the MIME type (`image.png`).
- Host page styles leaked into the widget — the CSS is now isolated under `#isf-root`.
- Heavy pages froze while scanning images/colors — the DOM is now walked in chunks (`src/scan.js`).

### Changed

- Downloading is unified in `src/download.js`: `GM_download` everywhere, the external FileSaver CDN was removed (its outage used to break the whole script); a fallback was added for managers without `GM_download` (OrangeMonkey).
- `state.foundUrls` now stores a single `{ url, name }` format.
- The userscript version comes from `package.json` (single source of truth); magic numbers moved into `config.js`.
- Removed dead code (`primaryColor`, `state.drag`, IIFE wrappers) and the "Minimize" button (its behavior was confusing).
- Media rows now download the file instead of opening a new tab.
