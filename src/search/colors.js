// Поиск цветов на странице
import { GM_setClipboard } from '$';

export async function searchColors() {
    var resultsContainer = document.getElementById("isf-results-container");
    var toast = document.getElementById("isf-toast");
    var e = {}, t = function (e) {
        if (!e || "transparent" === e || "rgba(0, 0, 0, 0)" === e) return null;
        if (e.startsWith("#")) return e;
        var t = e.match(/\d+(\.\d+)?/g);
        if (!t || t.length < 3 || (4 === t.length && 0 === parseFloat(t[3]))) return null;
        var i = parseInt(t[0]).toString(16).padStart(2, "0");
        var r = parseInt(t[1]).toString(16).padStart(2, "0");
        var o = parseInt(t[2]).toString(16).padStart(2, "0");
        return "#" + i + r + o;
    };

    var i = document.querySelectorAll("*");
    for (var r of i) {
        var o = window.getComputedStyle(r);
        [o.color, o.backgroundColor].forEach(function (i) {
            var r = t(i);
            if (r) {
                e[r] = (e[r] || 0) + 1;
            }
        });
    }

    var n = Object.keys(e).sort(function (t, i) { return e[i] - e[t]; });

    n.forEach(function (e) {
        var t = document.createElement("div");
        t.className = "isf-color-item";
        t.style.backgroundColor = e;
        t.innerHTML = '<div class="isf-color-hex">' + e + '</div>';
        t.onclick = function () {
            var t;
            if (typeof GM_setClipboard !== "undefined") {
                GM_setClipboard(e);
            } else {
                navigator.clipboard.writeText(e);
            }
            t = "Скопировано: " + e;
            toast.textContent = t;
            toast.style.opacity = 1;
            setTimeout(function () { toast.style.opacity = 0; }, 2000);
        };
        resultsContainer.appendChild(t);
    });

    return n.length;
}
