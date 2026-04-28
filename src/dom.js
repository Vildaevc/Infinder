// Создание DOM-элементов виджета Infinder
import { GM_addStyle } from '$';
import styles from './styles.js';

// Создание корневого элемента и добавление стилей
export function createWidget() {
    // Добавляем стили
    GM_addStyle(styles);

    // Создаем корневой элемент
    var root = document.createElement("div");
    root.id = "isf-root";
    document.body.appendChild(root);

    // Создаем главную кнопку
    var button = document.createElement("div");
    button.id = "isf-main-button";
    button.title = "Infinder (Drag me)";
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
    root.appendChild(button);

    // Создаем попап
    var popup = document.createElement("div");
    popup.id = "isf-popup";
    popup.innerHTML = `
        <div class="isf-header" id="isf-header">
            <div class="isf-title">
                <span class="isf-logo"></span>
                <span>Infinder</span>
            </div>
            <div class="isf-header-actions">
                <button class="isf-minimize" id="isf-minimize-btn" title="Свернуть">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <button class="isf-close" id="isf-close-btn" title="Закрыть">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        </div>
        <div class="isf-controls">
            <button class="isf-btn" data-action="images">
                <svg class="isf-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span class="isf-btn-label">Картинки</span>
            </button>
            <button class="isf-btn" data-action="svg">
                <svg class="isf-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                <span class="isf-btn-label">SVG</span>
            </button>
            <button class="isf-btn" data-action="colors">
                <svg class="isf-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>
                <span class="isf-btn-label">Цвета</span>
            </button>
            <button class="isf-btn" data-action="fonts">
                <svg class="isf-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                <span class="isf-btn-label">Шрифты</span>
            </button>
            <button class="isf-btn" data-action="media">
                <svg class="isf-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                <span class="isf-btn-label">Медиа</span>
            </button>
        </div>
        <div id="isf-results-container">
            <div class="isf-empty-state">
                <svg class="isf-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>Выберите категорию для поиска</span>
            </div>
        </div>
        <div class="isf-footer">
            <span id="isf-status">Ожидание...</span>
            <span class="isf-dl-btn" id="isf-dl-all">Скачать все</span>
        </div>
    `;
    root.appendChild(popup);

    // Создаем toast-уведомление
    var toast = document.createElement("div");
    toast.id = "isf-toast";
    root.appendChild(toast);

    return {
        root: root,
        button: button,
        popup: popup,
        toast: toast
    };
}
