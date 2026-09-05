// Поиск SVG на странице
import { state } from '../state.js';
import { resolveUrl, getFileName } from '../utils.js';
import { downloadFile, createSaveAsButton } from '../download.js';

export async function searchSvg() {
    var resultsContainer = document.getElementById("isf-results-container");
    var count = 0;
    var seen = new Set();

    // content: <svg>-элемент (inline) или URL (внешний файл)
    var addTile = function (content, isExternal, fileName) {
        var tile = document.createElement("div");
        tile.className = "isf-grid-item";

        var overlay = document.createElement("div");
        overlay.className = "isf-overlay";

        var downloadUrl;
        if (isExternal) {
            var img = document.createElement("img");
            img.src = content;
            img.alt = "";
            tile.appendChild(img);
            overlay.textContent = "URL";
            downloadUrl = content;
        } else {
            var clone = content.cloneNode(true);
            clone.removeAttribute("class");
            clone.removeAttribute("style");
            clone.setAttribute("width", "100%");
            clone.setAttribute("height", "100%");
            clone.style.fill = "currentColor";
            tile.appendChild(clone);
            overlay.textContent = "Inline";
            var serialized = new XMLSerializer().serializeToString(content);
            downloadUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serialized);
        }
        tile.appendChild(overlay);
        tile.onclick = function () { downloadFile(downloadUrl, fileName); };
        // Кнопка «Сохранить как...» (диалог) в углу плитки
        tile.appendChild(createSaveAsButton(function () {
            downloadFile(downloadUrl, fileName, true);
        }));

        state.foundUrls.add({ url: downloadUrl, name: fileName });
        resultsContainer.appendChild(tile);
        count++;
    };

    // Inline <svg>: ключ уникальности — полная сериализация,
    // а не длина строки (разные SVG с одинаковой длиной не теряются).
    document.querySelectorAll("svg").forEach(function (el, index) {
        var rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            var key = new XMLSerializer().serializeToString(el);
            if (!seen.has(key)) {
                seen.add(key);
                addTile(el, false, "vector_" + index + ".svg");
            }
        }
    });

    // Внешние <img src="*.svg">
    document.querySelectorAll('img[src$=".svg"]').forEach(function (imgEl) {
        var url = resolveUrl(imgEl.src);
        if (url && !seen.has(url)) {
            seen.add(url);
            addTile(url, true, getFileName(url));
        }
    });

    return count;
}
