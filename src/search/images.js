// Поиск изображений на странице
import { GM_download } from '$';
import { state } from '../state.js';
import { resolveUrl, getFileName } from '../utils.js';

export async function searchImages() {
    var resultsContainer = document.getElementById("isf-results-container");
    var e = new Set(), i = function (i) {
        var r = resolveUrl(i);
        if (!r || e.has(r) || r.match(/\.(svg)$/i)) return;
        e.add(r);
        state.foundUrls.add(r);
        var o = document.createElement("div");
        o.className = "isf-grid-item";
        var n = new Image();
        n.src = r;
        n.onload = function () {
            o.innerHTML = '<img src="' + r + '"><div class="isf-overlay">' + this.naturalWidth + 'x' + this.naturalHeight + '</div>';
            o.onclick = function () {
                if (typeof GM_download !== "undefined") {
                    GM_download({ url: r, name: getFileName(r) });
                } else {
                    saveAs(r, getFileName(r));
                }
            };
            resultsContainer.appendChild(o);
        };
    };

    document.querySelectorAll("img").forEach(function (e) {
        if (e.src) i(e.src);
        if (e.srcset) {
            e.srcset.split(",").forEach(function (e) {
                i(e.trim().split(" ")[0]);
            });
        }
    });

    Array.from(document.querySelectorAll("*")).forEach(function (e) {
        var t = window.getComputedStyle(e).backgroundImage;
        if (t && t.startsWith("url")) {
            var r = t.match(/url\(['"]?(.*?)['"]?\)/);
            if (r && r[1]) i(r[1]);
        }
    });

    return e.size;
}
