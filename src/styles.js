// CSS-стили виджета Infinder
import { config } from './config.js';

const styles = `
        /* Общие сбросы внутри виджета */
        #isf-root * { box-sizing: border-box; outline: none; }

        /* Главная кнопка */
        #isf-main-button {
            position: fixed;
            width: ${config.btnSize}px; height: ${config.btnSize}px;
            background: #ffffff;
            color: #333;
            border-radius: 35%;
            cursor: grab;
            display: flex; align-items: center; justify-content: center;
            z-index: ${config.zIndex};
            box-shadow: 0 4px 15px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
            transition: transform 0.1s, box-shadow 0.2s;
            user-select: none;
        }
        #isf-main-button:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.2); transform: scale(1.05); }
        #isf-main-button:active { cursor: grabbing; transform: scale(0.95); }
        #isf-main-button svg { width: 22px; height: 22px; opacity: 0.8; pointer-events: none; }

        /* Окно */
        #isf-popup {
            position: fixed;
            width: 420px;
            max-height: 80vh;
            background: #000000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            display: none;
            flex-direction: column;
            z-index: ${config.zIndex};
            border: 1px solid rgba(0,0,0,0.08);
            overflow: hidden;
            animation: isf-fadein 0.2s ease-out;
        }

        @keyframes isf-fadein { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

        /* Заголовок */
        .isf-header {
            padding: 14px 18px;
            background: #fff;
            border-bottom: 1px solid #f0f0f0;
            display: flex; justify-content: space-between; align-items: center;
            cursor: grab; user-select: none;
        }
        .isf-header:active { cursor: grabbing; }
        .isf-title { font-weight: 700; font-size: 15px; color: #222; display: flex; align-items: center; gap: 10px; }
        .isf-logo { width: 10px; height: 10px; background: ${config.accentColor}; border-radius: 50%; }
        .isf-close {
            cursor: pointer; width: 28px; height: 28px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%; background: #f5f5f5; color: #555;
            font-size: 20px; transition: all 0.2s;
        }
        .isf-close:hover { background: #ffecec; color: #ff4444; }

        /* Меню */
        .isf-controls {
            padding: 12px;
            display: flex; gap: 8px;
            overflow-x: auto;
            background: #fff;
            border-bottom: 1px solid #f0f0f0;
        }
        /* Скрываем скроллбар меню */
        .isf-controls::-webkit-scrollbar { height: 0; width: 0; }

        .isf-btn {
            flex: 1;
            white-space: nowrap;
            padding: 8px 12px;
            background: #f9f9f9;
            border: 1px solid #eee;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px; font-weight: 600; color: #555;
            transition: all 0.2s;
        }
        .isf-btn:hover { background: #f0f0f0; color: #000; }
        .isf-btn.isf-active {
            background: ${config.accentColor};
            color: #fff;
            border-color: ${config.accentColor};
            box-shadow: 0 2px 8px rgba(0,122,255,0.3);
        }

        /* Контейнер результатов */
        #isf-results-container {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
            display: flex; flex-wrap: wrap;
            gap: 10px;
            align-content: flex-start;
            min-height: 150px;
            max-height: 500px;
            background: #fbfbfb;
        }
        /* Кастомный скроллбар */
        #isf-results-container::-webkit-scrollbar { width: 6px; }
        #isf-results-container::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
        #isf-results-container::-webkit-scrollbar-track { background: transparent; }

        /* --- Типы результатов --- */

        /* 1. Сетка (Images, SVG) */
        .isf-grid-item {
            width: calc(33.33% - 7px);
            aspect-ratio: 1;
            border: 1px solid #eee;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            /* Шахматный фон */
            background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
            background-color: #fff;
        }
        .isf-grid-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-color: ${config.accentColor};
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
            background: rgba(0,0,0,0.7); backdrop-filter: blur(2px);
            color: #fff; font-size: 10px; font-weight: 600;
            padding: 4px; text-align: center;
            opacity: 0; transition: opacity 0.2s;
        }
        .isf-grid-item:hover .isf-overlay { opacity: 1; }

        /* 2. Список (Fonts, Media) */
        .isf-list-item {
            width: 100%;
            padding: 10px 12px;
            background: #fff;
            border: 1px solid #eee;
            border-radius: 6px;
            cursor: pointer;
            display: flex; justify-content: space-between; align-items: center;
            transition: background 0.1s;
        }
        .isf-list-item:hover { background: #f0f7ff; border-color: ${config.accentColor}; }
        .isf-item-name { font-size: 13px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%; }
        .isf-item-meta { font-size: 10px; color: #888; background: #eee; padding: 2px 6px; border-radius: 4px; }

        /* Шрифт-превью */
        .isf-font-preview {
            font-size: 16px;
            margin-top: 4px;
            color: #000;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* 3. Цвета */
        .isf-color-item {
            width: calc(20% - 8px);
            aspect-ratio: 1;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            transition: transform 0.1s;
            position: relative;
            border: 1px solid rgba(0,0,0,0.1);
        }
        .isf-color-item:hover { transform: scale(1.1); z-index: 2; box-shadow: 0 5px 15px rgba(0,0,0,0.15); }
        .isf-color-hex {
            position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
            font-size: 10px; background: #333; color: #fff; padding: 2px 4px; border-radius: 3px;
            opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 10;
        }
        .isf-color-item:hover .isf-color-hex { opacity: 1; bottom: -25px; }

        /* Подвал */
        .isf-footer {
            padding: 10px 15px;
            background: #fff;
            border-top: 1px solid #f0f0f0;
            font-size: 12px; color: #777;
            display: flex; justify-content: space-between; align-items: center;
        }
        .isf-dl-btn {
            color: ${config.accentColor};
            font-weight: 600; cursor: pointer;
            padding: 4px 8px; border-radius: 4px;
            background: rgba(0,122,255,0.1);
            display: none;
        }
        .isf-dl-btn:hover { background: rgba(0,122,255,0.2); }

        /* Toast Notification */
        #isf-toast {
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            background: rgba(0,0,0,0.8); color: #fff; padding: 8px 16px; border-radius: 20px;
            font-size: 13px; z-index: 2147483648; pointer-events: none;
            opacity: 0; transition: opacity 0.3s;
        }
    `;

export default styles;
