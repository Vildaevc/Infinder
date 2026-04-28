// CSS-стили виджета Infinder — современная тёмная тема
import { config } from './config.js';

const styles = `
    /* ===== ИЗОЛЯЦИЯ СТИЛЕЙ: сброс наследования CSS сайта-хоста ===== */
    /* Сбрасываем наследуемые свойства, чтобы не ломать layout position:fixed */
    #isf-root {
        all: initial;
        display: block;
        font-family: sans-serif;
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
    /* Принудительно перебиваем любые внешние стили через !important только на критичных свойствах */
    #isf-root,
    #isf-root * {
        box-sizing: border-box !important;
        font-family: sans-serif !important;
    }

    /* Главная кнопка */
    #isf-main-button {
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
        user-select: none;
    }
    #isf-main-button:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.25);
        transform: scale(1.08);
    }
    #isf-main-button:active { cursor: grabbing; transform: scale(0.92); }
    #isf-main-button svg { width: 22px; height: 22px; opacity: 0.85; pointer-events: none; }

    /* Окно — эффект стекла (Glassmorphism) */
    #isf-popup {
        position: fixed !important;
        width: 380px !important;
        max-height: 80vh !important;
        background: rgba(20, 20, 25, 0.7) !important;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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

    /* Заголовок — чистый и минималистичный */
    .isf-header {
        padding: 12px 16px !important;
        background: transparent !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        cursor: grab;
        user-select: none;
        min-height: 48px !important;
    }
    .isf-header:active { cursor: grabbing; }
    .isf-title {
        font-weight: 700; font-size: 14px; color: #E2E8F0;
        display: flex; align-items: center; gap: 10px;
        letter-spacing: 0.3px;
    }
    .isf-logo {
        width: 8px; height: 8px;
        background: ${config.accentColor};
        border-radius: 50%;
        box-shadow: 0 0 8px ${config.accentColor}40;
    }

    /* Действия в заголовке (минимизация / закрытие) */
    .isf-header-actions {
        display: flex; gap: 4px;
    }
    .isf-minimize,
    .isf-close {
        cursor: pointer;
        width: 28px; height: 28px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: none;
        color: rgba(255, 255, 255, 0.5);
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .isf-minimize:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #E2E8F0;
        transform: translateY(-1px);
    }
    .isf-close:hover {
        background: rgba(255, 70, 70, 0.2);
        color: #ff6b6b;
        transform: translateY(-1px);
    }

    /* Сетка кнопок парсеров (Grid) */
    .isf-controls {
        padding: 12px 16px !important;
        display: grid !important;
        grid-template-columns: repeat(5, 1fr) !important;
        gap: 8px !important;
        background: transparent !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
    }

    /* ===== СВОРАЧИВАНИЕ: перебиваем display:grid !important через составной селектор ===== */
    .isf-controls.infinder-hidden {
        display: none !important;
    }

    /* Кнопки-карточки */
    .isf-btn {
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
    .isf-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #E2E8F0;
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .isf-btn:active {
        transform: translateY(0px) scale(0.96);
    }
    .isf-btn.isf-active {
        background: ${config.accentColor}25;
        color: ${config.accentColor};
        border-color: ${config.accentColor}50;
        box-shadow: 0 0 16px ${config.accentColor}20;
    }

    .isf-btn-icon {
        width: 18px; height: 18px;
        opacity: 0.7;
        flex-shrink: 0;
    }
    .isf-btn:hover .isf-btn-icon { opacity: 1; }
    .isf-btn-label {
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }

    /* Контейнер результатов */
    #isf-results-container {
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
    #isf-results-container::-webkit-scrollbar { width: 4px; }
    #isf-results-container::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 2px;
    }
    #isf-results-container::-webkit-scrollbar-track { background: transparent; }

    /* Пустое состояние */
    .isf-empty-state {
        width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
        flex-direction: column; gap: 12px;
        color: rgba(255, 255, 255, 0.3);
        font-size: 13px;
        padding: 40px 20px;
    }
    .isf-empty-icon {
        width: 36px; height: 36px;
        opacity: 0.25;
    }

    /* --- Типы результатов --- */

    /* 1. Сетка (Images, SVG) */
    .isf-grid-item {
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
    .isf-grid-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        border-color: ${config.accentColor}60;
        z-index: 2;
    }
    .isf-grid-item img, .isf-grid-item svg {
        width: 100%; height: 100%;
        object-fit: contain;
        display: block;
        padding: 4px;
    }
    .isf-overlay {
        position: absolute; bottom: 0; left: 0; right: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        color: #E2E8F0; font-size: 10px; font-weight: 600;
        padding: 4px; text-align: center;
        opacity: 0; transition: opacity 0.2s ease;
    }
    .isf-grid-item:hover .isf-overlay { opacity: 1; }

    /* 2. Список (Fonts, Media) */
    .isf-list-item {
        width: 100%;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 8px;
        cursor: pointer;
        display: flex; justify-content: space-between; align-items: center;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .isf-list-item:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: ${config.accentColor}50;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .isf-item-name {
        font-size: 13px; color: #E2E8F0;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75%;
    }
    .isf-item-meta {
        font-size: 10px; color: rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, 0.06);
        padding: 2px 8px; border-radius: 4px;
        flex-shrink: 0;
    }

    /* Шрифт-превью */
    .isf-font-preview {
        font-size: 16px;
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.7);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* 3. Цвета */
    .isf-color-item {
        width: calc(20% - 8px);
        aspect-ratio: 1;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .isf-color-item:hover {
        transform: scale(1.12);
        z-index: 2;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }
    .isf-color-hex {
        position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%);
        font-size: 10px; background: rgba(0, 0, 0, 0.8); color: #E2E8F0;
        padding: 2px 6px; border-radius: 4px;
        opacity: 0; pointer-events: none;
        transition: opacity 0.2s ease, bottom 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        z-index: 10; white-space: nowrap;
    }
    .isf-color-item:hover .isf-color-hex { opacity: 1; bottom: -28px; }

    /* Подвал */
    .isf-footer {
        padding: 10px 16px !important;
        background: transparent !important;
        border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
        font-size: 12px !important;
        color: rgba(255, 255, 255, 0.4) !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
    }
    .isf-dl-btn {
        color: ${config.accentColor};
        font-weight: 600; cursor: pointer;
        padding: 4px 10px; border-radius: 6px;
        background: ${config.accentColor}15;
        display: none;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        font-size: 12px;
    }
    .isf-dl-btn:hover {
        background: ${config.accentColor}30;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    /* Toast Notification */
    #isf-toast {
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
        z-index: 2147483648 !important;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }
`;

export default styles;
