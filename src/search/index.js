// Диспетчер поиска — функция g
import { GM_download } from '$';
import { state } from '../state.js';
import { getFileName } from '../utils.js';
import { searchImages } from './images.js';
import { searchSvg } from './svg.js';
import { searchColors } from './colors.js';
import { searchFonts } from './fonts.js';
import { searchMedia } from './media.js';

export async function searchDispatcher(e) {
    var resultsContainer = document.getElementById("isf-results-container");
    var statusEl = document.getElementById("isf-status");
    var dlAllBtn = document.getElementById("isf-dl-all");
    if (state.isSearching) return;
    state.isSearching = true;
    resultsContainer.innerHTML = "";
    state.foundUrls.clear();
    statusEl.textContent = "Сканирование...";
    dlAllBtn.style.display = "none";

    await new Promise(function (e) { setTimeout(e, 50); });

    var i = 0;
    try {
        if ("images" === e) i = await searchImages();
        else if ("svg" === e) i = await searchSvg();
        else if ("colors" === e) i = await searchColors();
        else if ("fonts" === e) i = await searchFonts();
        else if ("media" === e) i = await searchMedia();

        statusEl.textContent = "Найдено: " + i;

        if ("colors" !== e && i > 0) {
            dlAllBtn.style.display = "block";
            dlAllBtn.textContent = "Скачать все (" + i + ")";
            dlAllBtn.onclick = function () {
                (function e(i) {
                    var r = Array.from(state.foundUrls);
                    if (confirm("Скачать " + r.length + " файлов?")) {
                        r.forEach(function (e, t) {
                            setTimeout(function () {
                                var t = e.url || e;
                                var i = e.name || getFileName(t);
                                if (typeof GM_download !== "undefined") {
                                    GM_download({ url: t, name: i, saveAs: false });
                                } else {
                                    saveAs(t, i);
                                }
                            }, 500 * t);
                        });
                    }
                })(e);
            };
        }
    } catch (r) {
        console.error(r);
        statusEl.textContent = "Ошибка поиска";
    } finally {
        state.isSearching = false;
        if (0 === i) {
            resultsContainer.innerHTML = '<div style="width:100%;text-align:center;color:#999;margin-top:20px;">Ничего не найдено</div>';
        }
    }
}
