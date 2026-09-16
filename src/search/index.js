// Диспетчер поиска
import { state } from '../state.js';
import { t } from '../i18n.js';
import { searchImages } from './images.js';
import { searchSvg } from './svg.js';
import { searchColors } from './colors.js';
import { searchFonts } from './fonts.js';
import { searchMedia } from './media.js';

var LOADER_HTML = '<div class="isf-loading"><span class="isf-spinner"></span></div>';

export async function searchDispatcher(action) {
    var resultsContainer = document.getElementById("isf-results-container");
    var statusEl = document.getElementById("isf-status");
    if (state.isSearching) return;
    state.isSearching = true;
    resultsContainer.innerHTML = LOADER_HTML; // спиннер на время поиска
    statusEl.textContent = t("statusScanning");

    // Даём браузеру отрисовать спиннер до начала сканирования
    await new Promise(function (resolve) { setTimeout(resolve, 50); });

    var count = 0;
    var failed = false;

    try {
        if ("images" === action) count = await searchImages();
        else if ("svg" === action) count = await searchSvg();
        else if ("colors" === action) count = await searchColors();
        else if ("fonts" === action) count = await searchFonts();
        else if ("media" === action) count = await searchMedia();

        statusEl.textContent = t("statusFound", { n: count });
    } catch (err) {
        failed = true;
        console.error(err);
        statusEl.textContent = t("statusError");
    } finally {
        state.isSearching = false;
        var loading = resultsContainer.querySelector(".isf-loading");
        if (loading) loading.remove();
    }

    // Пустое состояние показываем только в успешной ветке,
    // чтобы не затирать сообщение об ошибке.
    if (!failed && 0 === count) {
        var key = "notFound_" + action;
        var message = t(key);
        if (message === key) message = t("notFound_generic");
        resultsContainer.innerHTML = '<div class="isf-empty-msg">' + message + '</div>';
    }
}
