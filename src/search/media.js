// Поиск медиа-файлов на странице
import { state } from '../state.js';
import { resolveUrl, getFileName } from '../utils.js';

export async function searchMedia() {
    var resultsContainer = document.getElementById("isf-results-container");
    var e = new Set(), i = 0;
    var r = /\.(mp4|webm|mp3|wav|mov|avi|mkv|pdf|zip|rar)$/i;

    var o = function (r, o) {
        var n = resolveUrl(r);
        if (!n || e.has(n)) return;
        e.add(n);
        state.foundUrls.add(n);
        i++;
        var s = document.createElement("div");
        s.className = "isf-list-item";
        s.innerHTML = `
                <span class="isf-item-name">${getFileName(n)}</span>
                <span class="isf-item-meta">${o}</span>
            `;
        s.onclick = function () { window.open(n, "_blank"); };
        resultsContainer.appendChild(s);
    };

    document.querySelectorAll("video, audio").forEach(function (e) {
        if (e.src) o(e.src, e.tagName);
        e.querySelectorAll("source").forEach(function (t) {
            o(t.src, e.tagName);
        });
    });

    document.querySelectorAll("a").forEach(function (e) {
        if (e.href && r.test(e.href)) {
            o(e.href, e.href.split(".").pop().toUpperCase());
        }
    });

    return i;
}
