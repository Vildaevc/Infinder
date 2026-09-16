// Поиск цветов на странице
import { GM_setClipboard } from '$';
import { scanPageElements } from '../scan.js';

// Нормализация цвета в #rrggbb (непрозрачный) или #rrggbbaa (с альфой).
// hex разбирается напрямую; всё остальное (rgb/rgba/hsl/hsla/имена)
// прогоняется через canvas — так надёжно обрабатываются любые форматы.

var colorCache = new Map();
var canvasCtx = canvasContext();

function canvasContext() {
    try { return document.createElement("canvas").getContext("2d", { willReadFrequently: true }); }
    catch (e) { return null; }
}

function toHex(c) {
    return Math.round(c).toString(16).padStart(2, "0");
}

function keyFromRgba(r, g, b, a) {
    var key = "#" + toHex(r) + toHex(g) + toHex(b);
    if (a < 0.995) key += toHex(a * 255); // сохраняем альфу (8-значный hex)
    return key;
}

// Обработка произвольного CSS-цвета через canvas (hsl, named, ...).
// Некорректное значение остаётся прозрачным -> null.
function sampleByCanvas(ctx, value) {
    if (!ctx) return null;
    try {
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fillStyle = value;
        ctx.fillRect(0, 0, 1, 1);
        var d = ctx.getImageData(0, 0, 1, 1).data;
        if (d[3] === 0) return null;
        return keyFromRgba(d[0], d[1], d[2], d[3] / 255);
    } catch (e) {
        return null;
    }
}

function normalizeColor(value) {
    if (!value) return null;
    var s = value.trim().toLowerCase();
    if (!s || "transparent" === s || "rgba(0, 0, 0, 0)" === s) return null;

    if (colorCache.has(s)) return colorCache.get(s);

    var key = null;
    if (s.charAt(0) === "#") {
        var hex = s.slice(1);
        if (hex.length === 3 || hex.length === 4) {
            hex = hex.split("").map(function (c) { return c + c; }).join("");
        }
        if (hex.length === 6 || hex.length === 8) {
            key = "#" + hex;
        } else {
            key = sampleByCanvas(canvasCtx, s);
        }
    } else {
        key = sampleByCanvas(canvasCtx, s);
    }

    colorCache.set(s, key);
    return key;
}

export async function searchColors() {
    var resultsContainer = document.getElementById("isf-results-container");
    var toast = document.getElementById("isf-toast");
    var counts = {};

    await scanPageElements(function (el) {
        var computed = window.getComputedStyle(el);
        [computed.color, computed.backgroundColor].forEach(function (value) {
            var key = normalizeColor(value);
            if (key) counts[key] = (counts[key] || 0) + 1;
        });
    });

    var sorted = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });

    var showToast = function (text) {
        toast.textContent = text;
        toast.style.opacity = 1;
        setTimeout(function () { toast.style.opacity = 0; }, 2000);
    };

    sorted.forEach(function (key) {
        var chip = document.createElement("div");
        chip.className = "isf-color-item";
        chip.style.backgroundColor = key;

        var label = document.createElement("div");
        label.className = "isf-color-hex";
        label.textContent = key;
        chip.appendChild(label);

        chip.onclick = function () {
            // Копирование: GM_setClipboard, затем Clipboard API (может быть недоступен
            // в небезопасном контексте или без фокуса) — с явной обратной связью.
            try {
                if (typeof GM_setClipboard !== "undefined") {
                    GM_setClipboard(key);
                    showToast("Скопировано: " + key);
                } else if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(key).then(
                        function () { showToast("Скопировано: " + key); },
                        function () { showToast("Не удалось скопировать"); }
                    );
                } else {
                    showToast("Буфер обмена недоступен");
                }
            } catch (err) {
                showToast("Не удалось скопировать");
            }
        };
        resultsContainer.appendChild(chip);
    });

    return sorted.length;
}
