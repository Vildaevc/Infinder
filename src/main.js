// Точка входа Infinder
import { config } from './config.js';
import { createWidget } from './dom.js';
import { makeDraggable } from './drag.js';
import { searchDispatcher } from './search/index.js';

(function () {
    "use strict";

    if (window.self !== window.top) return;

    // Создаем DOM-элементы виджета
    var elements = createWidget();
    var button = elements.button;
    var popup = elements.popup;

    // Восстанавливаем позицию кнопки из localStorage
    // (защита: localStorage может быть недоступен, значение — повреждено)
    var savedPos = { right: config.defaultPos.right, bottom: config.defaultPos.bottom };
    try {
        var storedPos = JSON.parse(localStorage.getItem("isf_pos_v3"));
        if (storedPos && "object" === typeof storedPos) savedPos = storedPos;
    } catch (ignore) { /* фолбэк на позицию по умолчанию */ }

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

    // Функция центрирования попапа (по фактическим размерам, без magic-чисел)
    var centerPopup = function () {
        var rect = popup.getBoundingClientRect();
        var left = Math.max(0, Math.round((window.innerWidth - rect.width) / 2));
        var top = Math.max(0, Math.round((window.innerHeight - rect.height) / 2));
        popup.style.left = left + "px";
        popup.style.top = top + "px";
    };

    // Активируем drag для кнопки и попапа
    makeDraggable(button);
    makeDraggable(popup, document.getElementById("isf-header"));

    // Клик по кнопке — показать/скрыть попап
    button.addEventListener("click", function (e) {
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

    // Кнопка закрытия
    document.getElementById("isf-close-btn").addEventListener("click", function () {
        popup.style.display = "none";
    });

    // Навешиваем обработчики на кнопки категорий.
    // currentTarget — сама кнопка, даже если клик пришёлся по иконке/подписи.
    document.querySelectorAll(".isf-btn").forEach(function (btn) {
        btn.addEventListener("click", function (evt) {
            document.querySelectorAll(".isf-btn").forEach(function (other) {
                other.classList.remove("isf-active");
            });
            var clicked = evt.currentTarget;
            clicked.classList.add("isf-active");
            searchDispatcher(clicked.dataset.action);
        });
    });

})();
