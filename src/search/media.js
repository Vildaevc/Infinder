// Поиск медиа-файлов на странице
import { state } from '../state.js';
import { resolveUrl, getFileName } from '../utils.js';
import { downloadFile, createSaveAsButton } from '../download.js';

// Расширения файлов, которые считаем медиа
var MEDIA_RE = /\.(mp4|webm|mp3|wav|mov|avi|mkv|pdf|zip|rar)$/i;

// Путь URL без query/hash: ссылки вида file.mp4?token=... тоже должны находиться
var pathOf = function (url) {
    try { return new URL(url).pathname; } catch (ignore) { return url; }
};

var extOf = function (url) {
    var file = pathOf(url).split("/").pop() || "";
    var dot = file.lastIndexOf(".");
    return dot > 0 ? file.slice(dot + 1).toUpperCase() : "";
};

export async function searchMedia() {
    var resultsContainer = document.getElementById("isf-results-container");
    var seen = new Set();
    var count = 0;

    var addRow = function (rawUrl, metaText) {
        var url = resolveUrl(rawUrl);
        if (!url || seen.has(url)) return;
        // blob: — это MSE-поток (плеер), а не файл: скачать его нельзя
        if (0 === url.indexOf("blob:")) return;
        seen.add(url);
        state.foundUrls.add({ url: url, name: getFileName(url) });
        count++;

        var row = document.createElement("div");
        row.className = "isf-list-item";

        var name = document.createElement("span");
        name.className = "isf-item-name";
        name.textContent = getFileName(url);

        var meta = document.createElement("span");
        meta.className = "isf-item-meta";
        meta.textContent = metaText;

        var actions = document.createElement("span");
        actions.className = "isf-item-actions";
        actions.appendChild(createSaveAsButton(function () {
            downloadFile(url, getFileName(url), true);
        }));

        // Клик по строке — быстрая загрузка в папку браузера
        row.onclick = function () { downloadFile(url, getFileName(url)); };
        row.appendChild(name);
        row.appendChild(meta);
        row.appendChild(actions);
        resultsContainer.appendChild(row);
    };

    document.querySelectorAll("video, audio").forEach(function (el) {
        if (el.src) addRow(el.src, el.tagName);
        el.querySelectorAll("source").forEach(function (source) {
            addRow(source.src, el.tagName);
        });
    });

    document.querySelectorAll("a").forEach(function (a) {
        if (a.href && MEDIA_RE.test(pathOf(a.href))) {
            addRow(a.href, extOf(a.href));
        }
    });

    return count;
}
