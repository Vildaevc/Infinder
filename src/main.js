// Точка входа Infinder
import { config } from './config.js';
import { state } from './state.js';
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
    var savedPos = JSON.parse(localStorage.getItem("isf_pos_v3")) || { right: 20, bottom: 20 };

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

    // Функция центрирования попапа
    var centerPopup = function () {
        popup.getBoundingClientRect();
        popup.style.left = window.innerWidth / 2 - 210 + "px";
        popup.style.top = window.innerHeight / 2 - 250 + "px";
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

    // Навешиваем обработчики на кнопки категорий
    document.querySelectorAll(".isf-btn").forEach(function (e) {
        e.addEventListener("click", function (e) {
            document.querySelectorAll(".isf-btn").forEach(function (e) {
                e.classList.remove("isf-active");
            });
            e.target.classList.add("isf-active");
            searchDispatcher(e.target.dataset.action);
        });
    });

})();
