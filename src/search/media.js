// Поиск медиа-файлов на странице
import { state } from '../state.js';
import { resolveUrl, getFileName } from '../utils.js';
import { downloadFile, createSaveAsButton } from '../download.js';

export async function searchMedia() {
    var resultsContainer = document.getElementById("isf-results-container");
    var e = new Set(), i = 0;
    var r = /\.(mp4|webm|mp3|wav|mov|avi|mkv|pdf|zip|rar)$/i;

    var o = function (rawUrl, tagName) {
        var n = resolveUrl(rawUrl);
        if (!n || e.has(n)) return;
        e.add(n);
        state.foundUrls.add({ url: n, name: getFileName(n) });
        i++;

        var row = document.createElement("div");
        row.className = "isf-list-item";

        var name = document.createElement("span");
        name.className = "isf-item-name";
        name.textContent = getFileName(n);

        var meta = document.createElement("span");
        meta.className = "isf-item-meta";
        meta.textContent = tagName;

        var actions = document.createElement("span");
        actions.className = "isf-item-actions";
        actions.appendChild(createSaveAsButton(function () {
            downloadFile(n, getFileName(n), true);
        }));

        // Клик по строке — быстрая загрузка в папку браузера
        row.onclick = function () { downloadFile(n, getFileName(n)); };
        row.appendChild(name);
        row.appendChild(meta);
        row.appendChild(actions);
        resultsContainer.appendChild(row);
    };

    document.querySelectorAll("video, audio").forEach(function (el) {
        if (el.src) o(el.src, el.tagName);
        el.querySelectorAll("source").forEach(function (t) {
            o(t.src, el.tagName);
        });
    });

    document.querySelectorAll("a").forEach(function (a) {
        if (a.href && r.test(a.href)) {
            o(a.href, a.href.split(".").pop().toUpperCase());
        }
    });

    return i;
}
