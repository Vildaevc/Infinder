// Поиск SVG на странице
import { state } from '../state.js';
import { resolveUrl, getFileName } from '../utils.js';

export async function searchSvg() {
    var resultsContainer = document.getElementById("isf-results-container");
    var e = 0, i = new Set(), r = function (i, r, o) {
        var n = document.createElement("div");
        n.className = "isf-grid-item";
        if (r) {
            n.innerHTML = '<img src="' + i + '"><div class="isf-overlay">URL</div>';
            state.foundUrls.add({ url: i, name: o });
        } else {
            var s = i.cloneNode(true);
            s.removeAttribute("class");
            s.removeAttribute("style");
            s.setAttribute("width", "100%");
            s.setAttribute("height", "100%");
            s.style.fill = "currentColor";
            n.appendChild(s);
            n.innerHTML += '<div class="isf-overlay">Inline</div>';
            var a = new XMLSerializer().serializeToString(i);
            var l = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(a);
            state.foundUrls.add({ url: l, name: "icon.svg" });
            n.onclick = function () { saveAs(l, o || "vector.svg"); };
        }
        if (r) {
            n.onclick = function () { saveAs(i, o); };
        }
        resultsContainer.appendChild(n);
        e++;
    };

    document.querySelectorAll("svg").forEach(function (e, t) {
        var o = e.getBoundingClientRect();
        if (o.width > 0 && o.height > 0) {
            var n = e.innerHTML.length;
            if (!i.has(n)) {
                i.add(n);
                r(e, false, "vector_" + t + ".svg");
            }
        }
    });

    document.querySelectorAll('img[src$=".svg"]').forEach(function (e) {
        var t = resolveUrl(e.src);
        if (t && !i.has(t)) {
            i.add(t);
            r(t, true, getFileName(t));
        }
    });

    return e;
}
