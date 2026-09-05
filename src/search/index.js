// Диспетчер поиска
import { GM_download } from '$';
import { state } from '../state.js';
import { getFileName } from '../utils.js';
import { searchImages } from './images.js';
import { searchSvg } from './svg.js';
import { searchColors } from './colors.js';
import { searchFonts } from './fonts.js';
import { searchMedia } from './media.js';

export async function searchDispatcher(action) {
    var resultsContainer = document.getElementById("isf-results-container");
    var statusEl = document.getElementById("isf-status");
    var dlAllBtn = document.getElementById("isf-dl-all");
    if (state.isSearching) return;
    state.isSearching = true;
    resultsContainer.innerHTML = "";
    state.foundUrls.clear();
    statusEl.textContent = "Сканирование...";
    dlAllBtn.style.display = "none";

    await new Promise(function (resolve) { setTimeout(resolve, 50); });

    var count = 0;
    var failed = false;

    try {
        if ("images" === action) count = await searchImages();
        else if ("svg" === action) count = await searchSvg();
        else if ("colors" === action) count = await searchColors();
        else if ("fonts" === action) count = await searchFonts();
        else if ("media" === action) count = await searchMedia();

        statusEl.textContent = "Найдено: " + count;

        if ("colors" !== action && count > 0) {
            dlAllBtn.style.display = "block";
            dlAllBtn.textContent = "Скачать все (" + count + ")";
            dlAllBtn.onclick = function () {
                var files = Array.from(state.foundUrls);
                if (!confirm("Скачать " + files.length + " файлов?")) return;
                files.forEach(function (item, index) {
                    setTimeout(function () {
                        var url = item.url || item;
                        var name = item.name || getFileName(url);
                        if (typeof GM_download !== "undefined") {
                            GM_download({ url: url, name: name, saveAs: false });
                        } else {
                            saveAs(url, name);
                        }
                    }, 500 * index);
                });
            };
        }
    } catch (err) {
        failed = true;
        console.error(err);
        statusEl.textContent = "Ошибка поиска";
        dlAllBtn.style.display = "none";
    } finally {
        state.isSearching = false;
    }

    // Пустое состояние показываем только в успешной ветке,
    // чтобы не затирать «Ошибка поиска».
    if (!failed && 0 === count) {
        resultsContainer.innerHTML = '<div style="width:100%;text-align:center;color:#999;margin-top:20px;">Ничего не найдено</div>';
    }
}
