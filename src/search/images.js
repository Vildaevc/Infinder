// Поиск изображений на странице
import { GM_download } from '$';
import { state } from '../state.js';
import { resolveUrl, getFileName } from '../utils.js';

// Одновременно грузим не более BATCH кандидатов (не «вешаем» тяжёлые страницы)
var BATCH = 16;

export async function searchImages() {
    var resultsContainer = document.getElementById("isf-results-container");
    var seen = new Set();
    var candidates = [];

    // Собираем уникальные URL-кандидаты
    var collect = function (rawUrl) {
        var url = resolveUrl(rawUrl);
        if (!url || seen.has(url) || url.match(/\.(svg)$/i)) return;
        seen.add(url);
        candidates.push(url);
    };

    document.querySelectorAll("img").forEach(function (img) {
        if (img.src) collect(img.src);
        if (img.srcset) {
            img.srcset.split(",").forEach(function (part) {
                collect(part.trim().split(" ")[0]);
            });
        }
    });

    // Фоновые изображения
    Array.from(document.querySelectorAll("*")).forEach(function (el) {
        var bg;
        try {
            bg = window.getComputedStyle(el).backgroundImage;
        } catch (ignore) {
            return;
        }
        if (bg && bg.indexOf("url(") === 0) {
            var m = bg.match(/url\((['"]?)(.*?)\1\)/);
            if (m && m[2]) collect(m[2]);
        }
    });

    // Грузим каждый кандидат: плитка и foundUrls добавляются только
    // при успешной загрузке, поэтому «Найдено: N» == числу плиток,
    // а «Скачать все» не качает битые URL.
    var added = 0;
    for (var start = 0; start < candidates.length; start += BATCH) {
        var batch = candidates.slice(start, start + BATCH);
        await Promise.all(batch.map(function (url) {
            return new Promise(function (resolve) {
                var probe = new Image();
                probe.onload = function () {
                    var tile = document.createElement("div");
                    tile.className = "isf-grid-item";
                    // probe уже загружен — вставляем его без повторного запроса
                    tile.appendChild(probe);
                    var overlay = document.createElement("div");
                    overlay.className = "isf-overlay";
                    overlay.textContent = probe.naturalWidth + "x" + probe.naturalHeight;
                    tile.appendChild(overlay);
                    tile.onclick = function () {
                        if (typeof GM_download !== "undefined") {
                            GM_download({ url: url, name: getFileName(url) });
                        } else {
                            saveAs(url, getFileName(url));
                        }
                    };
                    resultsContainer.appendChild(tile);
                    state.foundUrls.add(url);
                    added++;
                    resolve();
                };
                probe.onerror = function () { resolve(); };
                probe.src = url;
            });
        }));
    }

    return added;
}
