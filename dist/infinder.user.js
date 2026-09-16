// ==UserScript==
// @name            Infinder
// @namespace       https://github.com/Vildaevc/Infinder
// @version         2.8.0
// @author          Vildaevc
// @description     Userscript: find and download images, SVG, fonts, colors and media on any page
// @description:en  Find and download images, SVG, fonts, colors and media on any page.
// @description:ru  Поиск и скачивание изображений, SVG, шрифтов, цветов и медиа на любой странице.
// @license         MIT
// @homepage        https://github.com/Vildaevc/Infinder#readme
// @homepageURL     https://github.com/Vildaevc/Infinder
// @source          https://github.com/Vildaevc/Infinder.git
// @supportURL      https://github.com/Vildaevc/Infinder/issues
// @downloadURL     https://raw.githubusercontent.com/Vildaevc/Infinder/main/dist/infinder.user.js
// @updateURL       https://raw.githubusercontent.com/Vildaevc/Infinder/main/dist/infinder.user.js
// @match           *://*/*
// @grant           GM_addStyle
// @grant           GM_download
// @grant           GM_setClipboard
// @run-at          document-end
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  const zIndex = 2147483647;
  const config = {
btnSize: 50,
zIndex,
accentColor: "#007AFF",
popupWidth: 380,
toastZIndex: zIndex + 1,
defaultPos: { right: 20, bottom: 20 }
  };
  var _GM_addStyle = (() => typeof GM_addStyle != "undefined" ? GM_addStyle : void 0)();
  var _GM_setClipboard = (() => typeof GM_setClipboard != "undefined" ? GM_setClipboard : void 0)();
  const styles = `
    /* ===== ИЗОЛЯЦИЯ СТИЛЕЙ: сброс наследования CSS сайта-хоста ===== */
    #isf-root {
        all: initial;
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #E2E8F0;
        text-align: left;
        letter-spacing: normal;
        word-spacing: normal;
        white-space: normal;
        visibility: visible;
        opacity: 1;
        pointer-events: auto;
    }
    /* Бланкетный сброс для всех потомков (побеждается собственными правилами ниже) */
    #isf-root *,
    #isf-root *::before,
    #isf-root *::after {
        box-sizing: border-box !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        margin: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        color: inherit;
        line-height: inherit !important;
        letter-spacing: normal !important;
        text-align: inherit;
        text-transform: none !important;
        text-decoration: none !important;
        text-shadow: none !important;
        vertical-align: baseline;
    }
    /* Нейтрализация агрессивной стилизации <button> со стороны хоста */
    #isf-root button {
        appearance: none;
        -webkit-appearance: none;
        background: none;
        border: none;
        font: inherit;
        color: inherit;
        cursor: pointer;
    }

    /* Главная кнопка */
    #isf-root #isf-main-button {
        position: fixed !important;
        width: ${config.btnSize}px !important;
        height: ${config.btnSize}px !important;
        background: rgba(255, 255, 255, 0.9) !important;
        backdrop-filter: blur(8px);
        color: #1a1a2e !important;
        border-radius: 35% !important;
        cursor: grab;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: ${config.zIndex} !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.15);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
        user-select: none !important;
        -webkit-user-select: none !important;
        -webkit-user-drag: none;
        touch-action: none !important;
    }
    #isf-root #isf-main-button:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.25);
        transform: scale(1.08);
    }
    #isf-root #isf-main-button:active { cursor: grabbing; transform: scale(0.92); }
    #isf-root #isf-main-button svg { width: 22px; height: 22px; opacity: 0.85; pointer-events: none; }

    /* Окно — эффект стекла (Glassmorphism) */
    #isf-root #isf-popup {
        position: fixed !important;
        width: ${config.popupWidth}px !important;
        max-height: 80vh !important;
        background: rgba(20, 20, 25, 0.7) !important;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 16px !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        display: none;
        flex-direction: column !important;
        z-index: ${config.zIndex} !important;
        overflow: hidden !important;
        animation: isf-popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes isf-popIn {
        0%   { opacity: 0; transform: scale(0.92) translateY(12px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* Спиннер поиска */
    @keyframes isf-spin {
        to { transform: rotate(360deg); }
    }
    #isf-root .isf-loading {
        width: 100%;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 28px 0 !important;
    }
    #isf-root .isf-spinner {
        width: 26px; height: 26px;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.15);
        border-top-color: ${config.accentColor};
        animation: isf-spin 0.8s linear infinite;
    }

    /* Заголовок — чистый и минималистичный */
    #isf-root .isf-header {
        padding: 12px 16px !important;
        background: transparent !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        cursor: grab;
        user-select: none !important;
        -webkit-user-select: none !important;
        -webkit-user-drag: none;
        touch-action: none !important;
        min-height: 48px !important;
    }
    #isf-root .isf-header:active { cursor: grabbing; }
    #isf-root .isf-title {
        font-weight: 700; font-size: 14px; color: #E2E8F0;
        display: flex; align-items: center; gap: 10px;
        letter-spacing: 0.3px;
    }
    #isf-root .isf-logo {
        width: 8px; height: 8px;
        background: ${config.accentColor};
        border-radius: 50%;
        box-shadow: 0 0 8px ${config.accentColor}40;
    }

    /* Действия в заголовке */
    #isf-root .isf-header-actions {
        display: flex; gap: 4px;
    }
    #isf-root .isf-close {
        cursor: pointer;
        width: 28px; height: 28px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: none;
        color: rgba(255, 255, 255, 0.5);
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    #isf-root .isf-close svg {
        width: 14px; height: 14px;
        display: block;
        pointer-events: none;
    }
    #isf-root .isf-close:hover {
        background: rgba(255, 70, 70, 0.2);
        color: #ff6b6b;
        transform: translateY(-1px);
    }

    /* Сетка кнопок парсеров (Grid) */
    #isf-root .isf-controls {
        padding: 12px 16px !important;
        display: grid !important;
        grid-template-columns: repeat(5, 1fr) !important;
        gap: 8px !important;
        background: transparent !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
    }

    /* Кнопки-карточки */
    #isf-root .isf-btn {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 6px !important;
        padding: 12px 4px !important;
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.06) !important;
        border-radius: 8px !important;
        cursor: pointer;
        font-size: 11px !important;
        font-weight: 600 !important;
        color: rgba(255, 255, 255, 0.6) !important;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        user-select: none;
        min-width: 0 !important;
    }
    #isf-root .isf-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #E2E8F0;
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    #isf-root .isf-btn:active {
        transform: translateY(0px) scale(0.96);
    }
    #isf-root .isf-btn.isf-active {
        background: ${config.accentColor}25;
        color: ${config.accentColor};
        border-color: ${config.accentColor}50;
        box-shadow: 0 0 16px ${config.accentColor}20;
    }

    #isf-root .isf-btn-icon {
        width: 18px; height: 18px;
        opacity: 0.7;
        flex-shrink: 0;
    }
    #isf-root .isf-btn:hover .isf-btn-icon { opacity: 1; }
    #isf-root .isf-btn-label {
        line-height: 1 !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }

    /* Контейнер результатов */
    #isf-root #isf-results-container {
        flex: 1 !important;
        overflow-y: auto !important;
        padding: 12px !important;
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 10px !important;
        align-content: flex-start !important;
        min-height: 120px !important;
        max-height: 450px !important;
        background: transparent !important;
    }
    /* Кастомный скроллбар */
    #isf-root #isf-results-container::-webkit-scrollbar { width: 4px; }
    #isf-root #isf-results-container::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 2px;
    }
    #isf-root #isf-results-container::-webkit-scrollbar-track { background: transparent; }

    /* Пустое состояние */
    #isf-root .isf-empty-msg {
        width: 100%;
        text-align: center;
        color: #999;
        margin-top: 20px !important;
        font-size: 13px;
    }
    #isf-root .isf-empty-state {
        width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
        flex-direction: column; gap: 12px;
        color: rgba(255, 255, 255, 0.3);
        font-size: 13px;
        padding: 40px 20px !important;
    }
    #isf-root .isf-empty-icon {
        width: 36px; height: 36px;
        opacity: 0.25;
    }

    /* --- Типы результатов --- */

    /* 1. Сетка (Images, SVG) */
    #isf-root .isf-grid-item {
        width: calc(33.33% - 7px);
        aspect-ratio: 1;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        cursor: pointer;
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, border-color 0.25s ease;
        background-image: linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
                          linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
                          linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%),
                          linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%);
        background-size: 20px 20px;
        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        background-color: rgba(0, 0, 0, 0.2);
    }
    #isf-root .isf-grid-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        border-color: ${config.accentColor}60;
        z-index: 2;
    }
    #isf-root .isf-grid-item img, #isf-root .isf-grid-item svg {
        width: 100%; height: 100%;
        object-fit: contain;
        display: block;
        padding: 4px !important;
    }
    #isf-root .isf-overlay {
        position: absolute; bottom: 0; left: 0; right: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        color: #E2E8F0; font-size: 10px; font-weight: 600;
        padding: 4px !important; text-align: center;
        opacity: 0; transition: opacity 0.2s ease;
    }
    #isf-root .isf-grid-item:hover .isf-overlay { opacity: 1; }

    /* Битые/недоступные изображения — заглушка (без скачивания) */
    #isf-root .isf-grid-item.isf-broken {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: default;
        background-image: none;
        background-color: rgba(0, 0, 0, 0.25) !important;
        border-style: dashed !important;
        border-color: rgba(255, 255, 255, 0.18) !important;
    }
    #isf-root .isf-grid-item.isf-broken:hover {
        transform: none;
        box-shadow: none;
        border-color: rgba(255, 255, 255, 0.18) !important;
    }
    #isf-root .isf-grid-item.isf-broken svg {
        width: 26px; height: 26px;
        opacity: 0.35;
        padding: 0 !important;
    }

    /* 2. Список (Fonts, Media) */
    #isf-root .isf-list-item {
        width: 100%;
        padding: 10px 12px !important;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 8px;
        cursor: pointer;
        display: flex; justify-content: space-between; align-items: center;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    #isf-root .isf-list-item:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: ${config.accentColor}50;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    #isf-root .isf-item-name {
        font-size: 13px; color: #E2E8F0;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75%;
    }
    #isf-root .isf-item-meta {
        font-size: 10px; color: rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, 0.06);
        padding: 2px 8px !important; border-radius: 4px;
        flex-shrink: 0;
    }

    /* Шрифт-превью */
    #isf-root .isf-font-preview {
        font-size: 16px;
        margin-top: 4px !important;
        color: rgba(255, 255, 255, 0.7);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* 3. Цвета */
    #isf-root .isf-color-item {
        width: calc(20% - 8px);
        aspect-ratio: 1;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    #isf-root .isf-color-item:hover {
        transform: scale(1.12);
        z-index: 2;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }
    #isf-root .isf-color-hex {
        position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%);
        font-size: 10px; background: rgba(0, 0, 0, 0.8); color: #E2E8F0;
        padding: 2px 6px !important; border-radius: 4px;
        opacity: 0; pointer-events: none;
        transition: opacity 0.2s ease, bottom 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        z-index: 10; white-space: nowrap;
    }
    #isf-root .isf-color-item:hover .isf-color-hex { opacity: 1; bottom: -28px; }

    /* Кнопка «Сохранить как...»: клик по элементу — быстрая загрузка, кнопка — диалог */
    #isf-root .isf-save-as {
        padding: 4px !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        background: rgba(0, 0, 0, 0.6) !important;
        color: #E2E8F0 !important;
        border-radius: 6px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        line-height: 1 !important;
        flex-shrink: 0;
        transition: background 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
    }
    #isf-root .isf-save-as svg {
        width: 14px; height: 14px;
        display: block;
        pointer-events: none;
    }
    #isf-root .isf-save-as:hover {
        background: rgba(0, 0, 0, 0.85) !important;
        transform: translateY(-1px);
    }
    /* В сетке (картинки, SVG) — угол плитки: видна всегда, ярче при наведении */
    #isf-root .isf-grid-item > .isf-save-as {
        position: absolute !important;
        top: 5px !important;
        right: 5px !important;
        z-index: 3;
        opacity: 0.45;
    }
    #isf-root .isf-grid-item:hover > .isf-save-as,
    #isf-root .isf-save-as:focus-visible {
        opacity: 1;
    }
    /* В списках (шрифты, медиа) — в конце строки */
    #isf-root .isf-item-actions {
        display: inline-flex !important;
        align-items: center !important;
        flex-shrink: 0;
        margin-left: 6px !important;
    }

    /* Подвал */
    #isf-root .isf-footer {
        padding: 10px 16px !important;
        background: transparent !important;
        border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
        font-size: 12px !important;
        color: rgba(255, 255, 255, 0.4) !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
    }
    #isf-root .isf-dl-btn {
        color: ${config.accentColor};
        font-weight: 600; cursor: pointer;
        padding: 4px 10px !important; border-radius: 6px;
        background: ${config.accentColor}15;
        display: none;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        font-size: 12px;
    }
    #isf-root .isf-dl-btn:hover {
        background: ${config.accentColor}30;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    /* Toast Notification */
    #isf-root #isf-toast {
        position: fixed !important;
        bottom: 20px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        background: rgba(20, 20, 25, 0.85) !important;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: #E2E8F0 !important;
        padding: 8px 18px !important;
        border-radius: 20px !important;
        font-size: 13px !important;
        z-index: ${config.toastZIndex} !important;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }
`;
  var STRINGS = {
    en: {
      widgetTitle: "Infinder (drag me)",
      close: "Close",
      cat_images: "Images",
      cat_svg: "SVG",
      cat_colors: "Colors",
      cat_fonts: "Fonts",
      cat_media: "Media",
      emptyState: "Pick a category to start searching",
      statusIdle: "Waiting...",
      statusScanning: "Scanning...",
      statusFound: "Found: {n}",
      statusError: "Search failed",
      notFound_images: "No images found",
      notFound_svg: "No SVG found",
      notFound_colors: "No colors found",
      notFound_fonts: "No fonts found",
      notFound_media: "No media found",
      notFound_generic: "Nothing found",
      downloadAll: "Download all",
      downloadAllCount: "Download all ({n})",
      confirmDownload: "Download {n} files?",
      saveAs: "Save as...",
      copied: "Copied: {value}",
      copyFailed: "Couldn't copy",
      clipboardUnavailable: "Clipboard is unavailable",
      imageFailed: "Couldn't load: {url}"
    },
    ru: {
      widgetTitle: "Infinder (перетащи меня)",
      close: "Закрыть",
      cat_images: "Картинки",
      cat_svg: "SVG",
      cat_colors: "Цвета",
      cat_fonts: "Шрифты",
      cat_media: "Медиа",
      emptyState: "Выберите категорию для поиска",
      statusIdle: "Ожидание...",
      statusScanning: "Сканирование...",
      statusFound: "Найдено: {n}",
      statusError: "Ошибка поиска",
      notFound_images: "Картинки не найдены",
      notFound_svg: "SVG не найдены",
      notFound_colors: "Цвета не найдены",
      notFound_fonts: "Шрифты не найдены",
      notFound_media: "Медиа не найдены",
      notFound_generic: "Ничего не найдено",
      downloadAll: "Скачать все",
      downloadAllCount: "Скачать все ({n})",
      confirmDownload: "Скачать {n} файлов?",
      saveAs: "Сохранить как...",
      copied: "Скопировано: {value}",
      copyFailed: "Не удалось скопировать",
      clipboardUnavailable: "Буфер обмена недоступен",
      imageFailed: "Не удалось загрузить: {url}"
    }
  };
  var locale = (function() {
    var language = (navigator.language || "en").toLowerCase();
    return 0 === language.indexOf("ru") ? "ru" : "en";
  })();
  function getLocale() {
    return locale;
  }
  function t(key, params) {
    var table = STRINGS[locale] || STRINGS.en;
    var text = table[key];
    if (void 0 === text) text = STRINGS.en[key];
    if (void 0 === text) return key;
    if (params) {
      Object.keys(params).forEach(function(name) {
        text = text.split("{" + name + "}").join(params[name]);
      });
    }
    return text;
  }
  function createWidget() {
    _GM_addStyle(styles);
    var root = document.createElement("div");
    root.id = "isf-root";
    root.setAttribute("lang", getLocale());
    document.body.appendChild(root);
    var button = document.createElement("div");
    button.id = "isf-main-button";
    button.title = t("widgetTitle");
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
    root.appendChild(button);
    var popup = document.createElement("div");
    popup.id = "isf-popup";
    popup.innerHTML = `
        <div class="isf-header" id="isf-header">
            <div class="isf-title">
                <span class="isf-logo"></span>
                <span>Infinder</span>
            </div>
            <div class="isf-header-actions">
                <button class="isf-close" id="isf-close-btn" title="${t("close")}" aria-label="${t("close")}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        </div>
        <div class="isf-controls">
            <button class="isf-btn" data-action="images">
                <svg class="isf-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span class="isf-btn-label">${t("cat_images")}</span>
            </button>
            <button class="isf-btn" data-action="svg">
                <svg class="isf-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                <span class="isf-btn-label">${t("cat_svg")}</span>
            </button>
            <button class="isf-btn" data-action="colors">
                <svg class="isf-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>
                <span class="isf-btn-label">${t("cat_colors")}</span>
            </button>
            <button class="isf-btn" data-action="fonts">
                <svg class="isf-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                <span class="isf-btn-label">${t("cat_fonts")}</span>
            </button>
            <button class="isf-btn" data-action="media">
                <svg class="isf-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                <span class="isf-btn-label">${t("cat_media")}</span>
            </button>
        </div>
        <div id="isf-results-container">
            <div class="isf-empty-state">
                <svg class="isf-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>${t("emptyState")}</span>
            </div>
        </div>
        <div class="isf-footer">
            <span id="isf-status">${t("statusIdle")}</span>
            <span class="isf-dl-btn" id="isf-dl-all">${t("downloadAll")}</span>
        </div>
    `;
    root.appendChild(popup);
    var toast = document.createElement("div");
    toast.id = "isf-toast";
    root.appendChild(toast);
    return {
      root,
      button,
      popup,
      toast
    };
  }
  var INTERACTIVE = "button, a, input, select, textarea";
  function makeDraggable(el, handle) {
    var dragging = false;
    var pointerId = null;
    var startX = 0, startY = 0, originLeft = 0, originTop = 0;
    el.addEventListener("dragstart", function(evt) {
      evt.preventDefault();
    });
    function onPointerMove(evt) {
      if (pointerId !== null && evt.pointerId !== pointerId) return;
      var dx = evt.clientX - startX;
      var dy = evt.clientY - startY;
      if (!dragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        dragging = true;
        el.style.cursor = "grabbing";
        if (pointerId !== null && el.setPointerCapture) {
          try {
            el.setPointerCapture(pointerId);
          } catch (ignore) {
          }
        }
      }
      if (!dragging) return;
      evt.preventDefault();
      var maxLeft = window.innerWidth - el.offsetWidth;
      var maxTop = window.innerHeight - el.offsetHeight;
      var left = Math.max(0, Math.min(originLeft + dx, maxLeft));
      var top = Math.max(0, Math.min(originTop + dy, maxTop));
      el.style.left = left + "px";
      el.style.top = top + "px";
    }
    function onPointerUp(evt) {
      if (pointerId !== null && evt.pointerId !== pointerId) return;
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
      el.style.cursor = "";
      if (pointerId !== null && el.releasePointerCapture) {
        try {
          el.releasePointerCapture(pointerId);
        } catch (ignore) {
        }
      }
      pointerId = null;
      if (dragging) {
        if ("isf-main-button" === el.id) {
          try {
            localStorage.setItem("isf_pos_v3", JSON.stringify({ left: parseInt(el.style.left), top: parseInt(el.style.top) }));
          } catch (err) {
          }
        }
        setTimeout(function() {
          dragging = false;
        }, 50);
      }
    }
    (handle || el).addEventListener("pointerdown", function(evt) {
      if (0 !== evt.button) return;
      if (evt.target && evt.target.closest && evt.target.closest(INTERACTIVE)) return;
      dragging = false;
      pointerId = evt.pointerId;
      startX = evt.clientX;
      startY = evt.clientY;
      var rect = el.getBoundingClientRect();
      originLeft = rect.left;
      originTop = rect.top;
      el.style.right = "auto";
      el.style.bottom = "auto";
      el.style.left = originLeft + "px";
      el.style.top = originTop + "px";
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointercancel", onPointerUp);
    });
    el.isJustDragged = function() {
      return dragging;
    };
  }
  const state = {
    isSearching: false,
    foundUrls: new Set()
  };
  var MAX_BLOB_SIZE = 256 * 1024 * 1024;
  function anchorDownload(href, name, revoke) {
    var link = document.createElement("a");
    link.href = href;
    link.download = name || "file";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (revoke) setTimeout(function() {
      URL.revokeObjectURL(href);
    }, 6e4);
  }
  function fallbackDownload(url, name) {
    var sameOrigin = false;
    try {
      sameOrigin = new URL(url, location.href).origin === location.origin;
    } catch (ignore) {
    }
    if (0 === url.indexOf("data:") || 0 === url.indexOf("blob:") || sameOrigin) {
      anchorDownload(url, name, false);
      return;
    }
    fetch(url, { credentials: "omit" }).then(function(response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      var length = parseInt(response.headers.get("content-length") || "0", 10);
      if (length && length > MAX_BLOB_SIZE) throw new Error("file is too large");
      return response.blob();
    }).then(function(blob) {
      anchorDownload(URL.createObjectURL(blob), name, true);
    }).catch(function() {
      window.open(url, "_blank", "noopener");
    });
  }
  function downloadFile(url, name, saveAsDialog) {
    if (typeof GM_download !== "undefined") {
      GM_download({ url, name, saveAs: !!saveAsDialog });
      return;
    }
    fallbackDownload(url, name);
  }
  function createSaveAsButton(onSaveAs) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "isf-save-as";
    btn.title = t("saveAs");
    btn.setAttribute("aria-label", t("saveAs"));
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
    btn.addEventListener("click", function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      onSaveAs();
    });
    return btn;
  }
  function resolveUrl(e) {
    try {
      return new URL(e, document.baseURI).href;
    } catch (t2) {
      return null;
    }
  }
  function getFileName(e) {
    try {
      if (e.startsWith("data:")) return "file";
      return new URL(e).pathname.split("/").pop() || "file";
    } catch (t2) {
      return "file";
    }
  }
  var BATCH$1 = 300;
  async function scanPageElements(each) {
    var widget = document.getElementById("isf-root");
    var all = document.querySelectorAll("body *");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (widget && widget.contains(el)) continue;
      if (!(el.offsetWidth || el.offsetHeight)) continue;
      each(el);
      if (i > 0 && i % BATCH$1 === 0) {
        await new Promise(function(resolve) {
          setTimeout(resolve, 0);
        });
      }
    }
  }
  var BATCH = 16;
  var previewObserver = null;
  var pendingPreview = new Map();
  function resetPreviews() {
    pendingPreview.clear();
    if (previewObserver) previewObserver.disconnect();
  }
  function observePreview(resultsContainer, img, src) {
    if (typeof IntersectionObserver === "undefined") {
      img.src = src;
      return;
    }
    if (!previewObserver) {
      previewObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;
          var tile = entry.target;
          var url = pendingPreview.get(tile);
          if (url) {
            tile.src = url;
            pendingPreview.delete(tile);
          }
          previewObserver.unobserve(tile);
        });
      }, { root: resultsContainer, rootMargin: "200px" });
    }
    pendingPreview.set(img, src);
    previewObserver.observe(img);
  }
  async function searchImages() {
    var resultsContainer = document.getElementById("isf-results-container");
    resetPreviews();
    var seen = new Set();
    var candidates = [];
    var collect = function(rawUrl) {
      var url = resolveUrl(rawUrl);
      if (!url || seen.has(url)) return;
      var path = url;
      try {
        path = new URL(url).pathname;
      } catch (ignore) {
      }
      if (/\.svg$/i.test(path)) return;
      seen.add(url);
      candidates.push(url);
    };
    var nameFor = function(url) {
      if (0 === url.indexOf("data:")) {
        var m = /^data:image\/([a-z0-9.+-]+)/i.exec(url);
        var ext = m ? m[1].toLowerCase().replace("jpeg", "jpg").replace("svg+xml", "svg") : "png";
        return "image." + ext;
      }
      return getFileName(url);
    };
    var widget = document.getElementById("isf-root");
    document.querySelectorAll("img").forEach(function(img) {
      if (widget && widget.contains(img)) return;
      if (img.src) collect(img.src);
      if (img.srcset) {
        img.srcset.split(",").forEach(function(part) {
          collect(part.trim().split(" ")[0]);
        });
      }
    });
    await scanPageElements(function(el) {
      var bg;
      try {
        bg = window.getComputedStyle(el).backgroundImage;
      } catch (ignore) {
        return;
      }
      if (!bg || "none" === bg) return;
      var re = /url\((['"]?)(.*?)\1\)/g;
      var m;
      while (m = re.exec(bg)) {
        var raw = m[2].trim();
        if (raw && "none" !== raw && raw.indexOf("data:") !== 0) collect(raw);
      }
    });
    var addBrokenTile = function(url) {
      var tile = document.createElement("div");
      tile.className = "isf-grid-item isf-broken";
      tile.title = t("imageFailed", { url });
      tile.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M10.41 2h3.18a2 2 0 0 1 1.42.59l1.4 1.4a2 2 0 0 0 1.41.59H21a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2.59a2 2 0 0 0 1.41-.59l1.4-1.4A2 2 0 0 1 9.59 2z"/></svg>';
      resultsContainer.appendChild(tile);
    };
    var added = 0;
    var loadedTiles = [];
    for (var start = 0; start < candidates.length; start += BATCH) {
      var batch = candidates.slice(start, start + BATCH);
      await Promise.all(batch.map(function(url) {
        return new Promise(function(resolve) {
          var probe = new Image();
          probe.onload = function() {
            var width = probe.naturalWidth;
            var height = probe.naturalHeight;
            probe.onload = null;
            probe.onerror = null;
            probe.src = "";
            var name = nameFor(url);
            var tile = document.createElement("div");
            tile.className = "isf-grid-item";
            var preview = document.createElement("img");
            preview.alt = "";
            preview.decoding = "async";
            tile.appendChild(preview);
            observePreview(resultsContainer, preview, url);
            var overlay = document.createElement("div");
            overlay.className = "isf-overlay";
            overlay.textContent = width + "x" + height;
            tile.appendChild(overlay);
            tile.onclick = function() {
              downloadFile(url, name);
            };
            tile.appendChild(createSaveAsButton(function() {
              downloadFile(url, name, true);
            }));
            state.foundUrls.add({ url, name });
            var area = width * height;
            var index = loadedTiles.length;
            while (index > 0 && loadedTiles[index - 1].area < area) index--;
            if (index < loadedTiles.length) {
              resultsContainer.insertBefore(tile, loadedTiles[index].tile);
            } else {
              resultsContainer.appendChild(tile);
            }
            loadedTiles.splice(index, 0, { tile, area });
            added++;
            resolve();
          };
          probe.onerror = function() {
            addBrokenTile(url);
            resolve();
          };
          probe.src = url;
        });
      }));
    }
    return added;
  }
  async function searchSvg() {
    var resultsContainer = document.getElementById("isf-results-container");
    var widget = document.getElementById("isf-root");
    var inWidget = function(el) {
      return widget && widget.contains(el);
    };
    var count = 0;
    var seen = new Set();
    var addTile = function(content, isExternal, fileName) {
      var tile = document.createElement("div");
      tile.className = "isf-grid-item";
      var overlay = document.createElement("div");
      overlay.className = "isf-overlay";
      var downloadUrl;
      if (isExternal) {
        var img = document.createElement("img");
        img.src = content;
        img.alt = "";
        tile.appendChild(img);
        overlay.textContent = "URL";
        downloadUrl = content;
      } else {
        var clone = content.cloneNode(true);
        clone.removeAttribute("class");
        clone.removeAttribute("style");
        clone.setAttribute("width", "100%");
        clone.setAttribute("height", "100%");
        clone.style.fill = "currentColor";
        tile.appendChild(clone);
        overlay.textContent = "Inline";
        var serialized = new XMLSerializer().serializeToString(content);
        downloadUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serialized);
      }
      tile.appendChild(overlay);
      tile.onclick = function() {
        downloadFile(downloadUrl, fileName);
      };
      tile.appendChild(createSaveAsButton(function() {
        downloadFile(downloadUrl, fileName, true);
      }));
      state.foundUrls.add({ url: downloadUrl, name: fileName });
      resultsContainer.appendChild(tile);
      count++;
    };
    document.querySelectorAll("svg").forEach(function(el, index) {
      if (inWidget(el)) return;
      var rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        var key = new XMLSerializer().serializeToString(el);
        if (!seen.has(key)) {
          seen.add(key);
          addTile(el, false, "vector_" + index + ".svg");
        }
      }
    });
    document.querySelectorAll('img[src$=".svg" i]').forEach(function(imgEl) {
      if (inWidget(imgEl)) return;
      var url = resolveUrl(imgEl.src);
      if (url && !seen.has(url)) {
        seen.add(url);
        addTile(url, true, getFileName(url));
      }
    });
    return count;
  }
  var colorCache = new Map();
  var canvasCtx = canvasContext();
  function canvasContext() {
    try {
      return document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    } catch (e) {
      return null;
    }
  }
  function toHex(c) {
    return Math.round(c).toString(16).padStart(2, "0");
  }
  function keyFromRgba(r, g, b, a) {
    var key = "#" + toHex(r) + toHex(g) + toHex(b);
    if (a < 0.995) key += toHex(a * 255);
    return key;
  }
  function sampleByCanvas(ctx, value) {
    if (!ctx) return null;
    try {
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      var d = ctx.getImageData(0, 0, 1, 1).data;
      if (d[3] === 0) return null;
      return keyFromRgba(d[0], d[1], d[2], d[3] / 255);
    } catch (e) {
      return null;
    }
  }
  function normalizeColor(value) {
    if (!value) return null;
    var s = value.trim().toLowerCase();
    if (!s || "transparent" === s || "rgba(0, 0, 0, 0)" === s) return null;
    if (colorCache.has(s)) return colorCache.get(s);
    var key;
    if (s.charAt(0) === "#") {
      var hex = s.slice(1);
      if (hex.length === 3 || hex.length === 4) {
        hex = hex.split("").map(function(c) {
          return c + c;
        }).join("");
      }
      if (hex.length === 6 || hex.length === 8) {
        key = "#" + hex;
      } else {
        key = sampleByCanvas(canvasCtx, s);
      }
    } else {
      key = sampleByCanvas(canvasCtx, s);
    }
    colorCache.set(s, key);
    return key;
  }
  async function searchColors() {
    var resultsContainer = document.getElementById("isf-results-container");
    var toast = document.getElementById("isf-toast");
    var counts = {};
    await scanPageElements(function(el) {
      var computed = window.getComputedStyle(el);
      [computed.color, computed.backgroundColor].forEach(function(value) {
        var key = normalizeColor(value);
        if (key) counts[key] = (counts[key] || 0) + 1;
      });
    });
    var sorted = Object.keys(counts).sort(function(a, b) {
      return counts[b] - counts[a];
    });
    var showToast = function(text) {
      toast.textContent = text;
      toast.style.opacity = 1;
      setTimeout(function() {
        toast.style.opacity = 0;
      }, 2e3);
    };
    sorted.forEach(function(key) {
      var chip = document.createElement("div");
      chip.className = "isf-color-item";
      chip.style.backgroundColor = key;
      var label = document.createElement("div");
      label.className = "isf-color-hex";
      label.textContent = key;
      chip.appendChild(label);
      chip.onclick = function() {
        try {
          if (typeof _GM_setClipboard !== "undefined") {
            _GM_setClipboard(key);
            showToast(t("copied", { value: key }));
          } else if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(key).then(
              function() {
                showToast(t("copied", { value: key }));
              },
              function() {
                showToast(t("copyFailed"));
              }
            );
          } else {
            showToast(t("clipboardUnavailable"));
          }
        } catch (err) {
          showToast(t("copyFailed"));
        }
      };
      resultsContainer.appendChild(chip);
    });
    return sorted.length;
  }
  async function searchFonts() {
    var resultsContainer = document.getElementById("isf-results-container");
    var e = new Set(), i = 0;
    for (var r of document.styleSheets) {
      try {
        var o = r.cssRules || r.rules;
        if (!o) continue;
        for (var n of o) {
          if (n.type === CSSRule.FONT_FACE_RULE) {
            var s = n.style;
            var families = s.getPropertyValue("font-family").replace(/['"]/g, "");
            var src = s.getPropertyValue("src");
            var m = src.match(/url\(['"]?(.*?)['"]?\)/);
            if (!m || !m[1]) continue;
            var c = resolveUrl(m[1]);
            if (!c || c.startsWith("data:") || e.has(c)) continue;
            e.add(c);
            state.foundUrls.add({ url: c, name: getFileName(c) });
            i++;
            var row = document.createElement("div");
            row.className = "isf-list-item";
            var body = document.createElement("div");
            body.style.width = "100%";
            var head = document.createElement("div");
            head.style.display = "flex";
            head.style.justifyContent = "space-between";
            var nameEl = document.createElement("span");
            nameEl.className = "isf-item-name";
            nameEl.textContent = families;
            var metaEl = document.createElement("span");
            metaEl.className = "isf-item-meta";
            metaEl.textContent = getFileName(c).split(".").pop();
            var actions = document.createElement("span");
            actions.className = "isf-item-actions";
            actions.appendChild(createSaveAsButton(function() {
              downloadFile(c, getFileName(c), true);
            }));
            head.appendChild(nameEl);
            head.appendChild(metaEl);
            head.appendChild(actions);
            var preview = document.createElement("div");
            preview.className = "isf-font-preview";
            preview.textContent = "Quick Brown Fox 123";
            var firstFamily = (families.split(",")[0] || "").trim();
            if (firstFamily) {
              preview.style.setProperty("font-family", "'" + firstFamily + "', sans-serif", "important");
            }
            body.appendChild(head);
            body.appendChild(preview);
            row.appendChild(body);
            row.onclick = function() {
              downloadFile(c, getFileName(c));
            };
            resultsContainer.appendChild(row);
          }
        }
      } catch (g) {
      }
    }
    return i;
  }
  var MEDIA_RE = /\.(mp4|webm|mp3|wav|mov|avi|mkv|pdf|zip|rar)$/i;
  var pathOf = function(url) {
    try {
      return new URL(url).pathname;
    } catch (ignore) {
      return url;
    }
  };
  var extOf = function(url) {
    var file = pathOf(url).split("/").pop() || "";
    var dot = file.lastIndexOf(".");
    return dot > 0 ? file.slice(dot + 1).toUpperCase() : "";
  };
  async function searchMedia() {
    var resultsContainer = document.getElementById("isf-results-container");
    var seen = new Set();
    var count = 0;
    var addRow = function(rawUrl, metaText) {
      var url = resolveUrl(rawUrl);
      if (!url || seen.has(url)) return;
      if (0 === url.indexOf("blob:")) return;
      seen.add(url);
      state.foundUrls.add({ url, name: getFileName(url) });
      count++;
      var row = document.createElement("div");
      row.className = "isf-list-item";
      var name = document.createElement("span");
      name.className = "isf-item-name";
      name.textContent = getFileName(url);
      var meta = document.createElement("span");
      meta.className = "isf-item-meta";
      meta.textContent = metaText;
      var actions = document.createElement("span");
      actions.className = "isf-item-actions";
      actions.appendChild(createSaveAsButton(function() {
        downloadFile(url, getFileName(url), true);
      }));
      row.onclick = function() {
        downloadFile(url, getFileName(url));
      };
      row.appendChild(name);
      row.appendChild(meta);
      row.appendChild(actions);
      resultsContainer.appendChild(row);
    };
    document.querySelectorAll("video, audio").forEach(function(el) {
      if (el.src) addRow(el.src, el.tagName);
      el.querySelectorAll("source").forEach(function(source) {
        addRow(source.src, el.tagName);
      });
    });
    document.querySelectorAll("a").forEach(function(a) {
      if (a.href && MEDIA_RE.test(pathOf(a.href))) {
        addRow(a.href, extOf(a.href));
      }
    });
    return count;
  }
  var LOADER_HTML = '<div class="isf-loading"><span class="isf-spinner"></span></div>';
  async function searchDispatcher(action) {
    var resultsContainer = document.getElementById("isf-results-container");
    var statusEl = document.getElementById("isf-status");
    var dlAllBtn = document.getElementById("isf-dl-all");
    if (state.isSearching) return;
    state.isSearching = true;
    resultsContainer.innerHTML = LOADER_HTML;
    state.foundUrls.clear();
    statusEl.textContent = t("statusScanning");
    dlAllBtn.style.display = "none";
    await new Promise(function(resolve) {
      setTimeout(resolve, 50);
    });
    var count = 0;
    var failed = false;
    try {
      if ("images" === action) count = await searchImages();
      else if ("svg" === action) count = await searchSvg();
      else if ("colors" === action) count = await searchColors();
      else if ("fonts" === action) count = await searchFonts();
      else if ("media" === action) count = await searchMedia();
      statusEl.textContent = t("statusFound", { n: count });
      if ("colors" !== action && count > 0) {
        dlAllBtn.style.display = "block";
        dlAllBtn.textContent = t("downloadAllCount", { n: count });
        dlAllBtn.onclick = function() {
          var files = Array.from(state.foundUrls);
          if (!files.length) return;
          if (!confirm(t("confirmDownload", { n: files.length }))) return;
          files.forEach(function(item, index) {
            setTimeout(function() {
              downloadFile(item.url, item.name);
            }, 500 * index);
          });
        };
      }
    } catch (err) {
      failed = true;
      console.error(err);
      statusEl.textContent = t("statusError");
      dlAllBtn.style.display = "none";
    } finally {
      state.isSearching = false;
      var loading = resultsContainer.querySelector(".isf-loading");
      if (loading) loading.remove();
    }
    if (!failed && 0 === count) {
      var key = "notFound_" + action;
      var message = t(key);
      if (message === key) message = t("notFound_generic");
      resultsContainer.innerHTML = '<div class="isf-empty-msg">' + message + "</div>";
    }
  }
  (function() {
    if (window.self !== window.top) return;
    var elements = createWidget();
    var button = elements.button;
    var popup = elements.popup;
    var savedPos = { right: config.defaultPos.right, bottom: config.defaultPos.bottom };
    try {
      var storedPos = JSON.parse(localStorage.getItem("isf_pos_v3"));
      if (storedPos && "object" === typeof storedPos) savedPos = storedPos;
    } catch (ignore) {
    }
    if (typeof savedPos.left !== "undefined") {
      button.style.left = savedPos.left + "px";
    }
    if (typeof savedPos.top !== "undefined") {
      button.style.top = savedPos.top + "px";
    }
    if (typeof savedPos.right !== "undefined") {
      button.style.right = savedPos.right + "px";
      button.style.left = "auto";
    }
    if (typeof savedPos.bottom !== "undefined") {
      button.style.bottom = savedPos.bottom + "px";
      button.style.top = "auto";
    }
    var centerPopup = function() {
      var rect = popup.getBoundingClientRect();
      var left = Math.max(0, Math.round((window.innerWidth - rect.width) / 2));
      var top = Math.max(0, Math.round((window.innerHeight - rect.height) / 2));
      popup.style.left = left + "px";
      popup.style.top = top + "px";
    };
    makeDraggable(button);
    makeDraggable(popup, document.getElementById("isf-header"));
    button.addEventListener("click", function(e) {
      if (button.isJustDragged && button.isJustDragged()) return;
      if ("flex" === popup.style.display) {
        popup.style.display = "none";
      } else {
        popup.style.display = "flex";
        if (!popup.dataset.inited) {
          centerPopup();
          popup.dataset.inited = "true";
        }
      }
    });
    document.getElementById("isf-close-btn").addEventListener("click", function() {
      popup.style.display = "none";
    });
    document.querySelectorAll(".isf-btn").forEach(function(btn) {
      btn.addEventListener("click", function(evt) {
        document.querySelectorAll(".isf-btn").forEach(function(other) {
          other.classList.remove("isf-active");
        });
        var clicked = evt.currentTarget;
        clicked.classList.add("isf-active");
        searchDispatcher(clicked.dataset.action);
      });
    });
  })();

})();