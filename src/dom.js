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
            <div class="isf-title"><span class="isf-logo"></span>Infinder 2</div>
            <div class="isf-close" id="isf-close-btn">\xd7</div>
        </div>
        <div class="isf-controls">
            <button class="isf-btn" data-action="images">Картинки</button>
            <button class="isf-btn" data-action="svg">Вектор</button>
            <button class="isf-btn" data-action="colors">Цвета</button>
            <button class="isf-btn" data-action="fonts">Шрифты</button>
            <button class="isf-btn" data-action="media">Медиа</button>
        </div>
        <div id="isf-results-container">
            <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#999; flex-direction:column; gap:10px;">
                <svg style="width:32px;height:32px;opacity:0.2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                Выберите категорию
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
