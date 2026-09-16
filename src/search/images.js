// Поиск изображений на странице
import { state } from '../state.js';
import { resolveUrl, getFileName } from '../utils.js';
import { downloadFile, createSaveAsButton } from '../download.js';
import { scanPageElements } from '../scan.js';

// Одновременно грузим не более BATCH кандидатов (не «вешаем» тяжёлые страницы)
var BATCH = 16;

// Ленивая загрузка превью: обсервер и карта «плитка -> URL» переиспользуются
// между поисками, поэтому ссылки на удалённые плитки не накапливаются.
var previewObserver = null;
var pendingPreview = new Map();

function resetPreviews() {
    pendingPreview.clear();
    if (previewObserver) previewObserver.disconnect();
}

function observePreview(resultsContainer, img, src) {
    if (typeof IntersectionObserver === "undefined") {
        img.src = src;
        return;
    }
    if (!previewObserver) {
        previewObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var tile = entry.target;
                var url = pendingPreview.get(tile);
                if (url) {
                    tile.src = url;
                    pendingPreview.delete(tile);
                }
                previewObserver.unobserve(tile);
            });
        }, { root: resultsContainer, rootMargin: "200px" });
    }
    pendingPreview.set(img, src);
    previewObserver.observe(img);
}

export async function searchImages() {
    var resultsContainer = document.getElementById("isf-results-container");
    resetPreviews();
    var seen = new Set();
    var candidates = [];

    // Собираем уникальные URL-кандидаты
    var collect = function (rawUrl) {
        var url = resolveUrl(rawUrl);
        if (!url || seen.has(url)) return;
        // Расширение проверяем по пути: icon.svg?ver=2 — тоже SVG
        var path = url;
        try { path = new URL(url).pathname; } catch (ignore) { /* data: и подобное */ }
        if (/\.svg$/i.test(path)) return; // SVG — отдельная категория
        seen.add(url);
        candidates.push(url);
    };

    // Имя файла: у data:-картинок его нет, поэтому берём расширение из MIME
    var nameFor = function (url) {
        if (0 === url.indexOf("data:")) {
            var m = /^data:image\/([a-z0-9.+-]+)/i.exec(url);
            var ext = m ? m[1].toLowerCase().replace("jpeg", "jpg").replace("svg+xml", "svg") : "png";
            return "image." + ext;
        }
        return getFileName(url);
    };

    var widget = document.getElementById("isf-root");
    document.querySelectorAll("img").forEach(function (img) {
        if (widget && widget.contains(img)) return;
        if (img.src) collect(img.src);
        if (img.srcset) {
            img.srcset.split(",").forEach(function (part) {
                collect(part.trim().split(" ")[0]);
            });
        }
    });

    // Фоновые изображения: пошаговый обход (не блокирует UI на тяжёлых страницах),
    // учитываются все url(...) в background-image, включая многослойные.
    await scanPageElements(function (el) {
        var bg;
        try {
            bg = window.getComputedStyle(el).backgroundImage;
        } catch (ignore) {
            return;
        }
        if (!bg || "none" === bg) return;
        var re = /url\((['"]?)(.*?)\1\)/g;
        var m;
        while ((m = re.exec(bg))) {
            var raw = m[2].trim();
            if (raw && "none" !== raw && raw.indexOf("data:") !== 0) collect(raw);
        }
    });

    // Плитка-заглушка для изображения, которое не удалось загрузить.
    // В foundUrls и счётчик не попадает (Скачать все не качает битые URL).
    var addBrokenTile = function (url) {
        var tile = document.createElement("div");
        tile.className = "isf-grid-item isf-broken";
        tile.title = "Не удалось загрузить: " + url;
        tile.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M10.41 2h3.18a2 2 0 0 1 1.42.59l1.4 1.4a2 2 0 0 0 1.41.59H21a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2.59a2 2 0 0 0 1.41-.59l1.4-1.4A2 2 0 0 1 9.59 2z"/></svg>';
        resultsContainer.appendChild(tile);
    };

    // Грузим каждый кандидат: плитка и foundUrls добавляются только
    // при успешной загрузке, поэтому «Найдено: N» == числу плиток,
    // а «Скачать все» не качает битые URL.
    // Плитки вставляются по убыванию разрешения (W*H): самые крупные — первыми.
    var added = 0;
    var loadedTiles = [];
    for (var start = 0; start < candidates.length; start += BATCH) {
        var batch = candidates.slice(start, start + BATCH);
        await Promise.all(batch.map(function (url) {
            return new Promise(function (resolve) {
                var probe = new Image();
                probe.onload = function () {
                    var width = probe.naturalWidth;
                    var height = probe.naturalHeight;

                    // Освобождаем декодированное изображение (оно уже измерено):
                    // превью подгрузится лениво, когда плитка окажется видимой,
                    // поэтому память держат только видимые картинки
                    probe.onload = null;
                    probe.onerror = null;
                    probe.src = "";

                    var name = nameFor(url);
                    var tile = document.createElement("div");
                    tile.className = "isf-grid-item";
                    var preview = document.createElement("img");
                    preview.alt = "";
                    preview.decoding = "async";
                    tile.appendChild(preview);
                    observePreview(resultsContainer, preview, url);

                    var overlay = document.createElement("div");
                    overlay.className = "isf-overlay";
                    overlay.textContent = width + "x" + height;
                    tile.appendChild(overlay);
                    tile.onclick = function () { downloadFile(url, name); };
                    // Кнопка «Сохранить как...» (диалог) в углу плитки
                    tile.appendChild(createSaveAsButton(function () {
                        downloadFile(url, name, true);
                    }));
                    state.foundUrls.add({ url: url, name: name });

                    // Позиция по убыванию разрешения (сортировка вставками)
                    var area = width * height;
                    var index = loadedTiles.length;
                    while (index > 0 && loadedTiles[index - 1].area < area) index--;
                    if (index < loadedTiles.length) {
                        resultsContainer.insertBefore(tile, loadedTiles[index].tile);
                    } else {
                        resultsContainer.appendChild(tile);
                    }
                    loadedTiles.splice(index, 0, { tile: tile, area: area });

                    added++;
                    resolve();
                };
                probe.onerror = function () { addBrokenTile(url); resolve(); };
                probe.src = url;
            });
        }));
    }

    return added;
}
