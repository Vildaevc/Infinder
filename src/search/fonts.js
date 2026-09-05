// Поиск шрифтов на странице
import { state } from '../state.js';
import { resolveUrl, getFileName } from '../utils.js';
import { downloadFile, createSaveAsButton } from '../download.js';

// Значения из CSS страницы (font-family) считаются небезопасными:
// вставляем их только через textContent, а в style — через CSSOM-свойство.
export async function searchFonts() {
    var resultsContainer = document.getElementById("isf-results-container");
    var e = new Set(), i = 0;

    for (var r of document.styleSheets) {
        try {
            var o = r.cssRules || r.rules;
            if (!o) continue;
            for (var n of o) {
                if (n.type === CSSRule.FONT_FACE_RULE) {
                    var s = n.style;
                    // Список семейств: "Open Sans", Arial -> Open Sans, Arial
                    var families = s.getPropertyValue("font-family").replace(/['"]/g, "");
                    var src = s.getPropertyValue("src");
                    var m = src.match(/url\(['"]?(.*?)['"]?\)/);
                    if (!m || !m[1]) continue;
                    var c = resolveUrl(m[1]);
                    if (!c || c.startsWith("data:") || e.has(c)) continue;
                    e.add(c);
                    state.foundUrls.add({ url: c, name: getFileName(c) });
                    i++;

                    // Строка результата собирается через DOM API — без innerHTML,
                    // чтобы вредоносное имя шрифта не могло инжектить HTML.
                    var row = document.createElement("div");
                    row.className = "isf-list-item";

                    var body = document.createElement("div");
                    body.style.width = "100%";

                    var head = document.createElement("div");
                    head.style.display = "flex";
                    head.style.justifyContent = "space-between";

                    var nameEl = document.createElement("span");
                    nameEl.className = "isf-item-name";
                    nameEl.textContent = families;

                    var metaEl = document.createElement("span");
                    metaEl.className = "isf-item-meta";
                    metaEl.textContent = getFileName(c).split(".").pop();

                    var actions = document.createElement("span");
                    actions.className = "isf-item-actions";
                    actions.appendChild(createSaveAsButton(function () {
                        downloadFile(c, getFileName(c), true);
                    }));

                    head.appendChild(nameEl);
                    head.appendChild(metaEl);
                    head.appendChild(actions);

                    // Превью первым семейством; значение уходит в CSSOM-свойство,
                    // а не в HTML, поэтому «выпрыгнуть» из него нельзя.
                    var preview = document.createElement("div");
                    preview.className = "isf-font-preview";
                    preview.textContent = "Quick Brown Fox 123";
                    var firstFamily = (families.split(",")[0] || "").trim();
                    if (firstFamily) {
                        preview.style.setProperty("font-family", "'" + firstFamily + "', sans-serif", "important");
                    }

                    body.appendChild(head);
                    body.appendChild(preview);
                    row.appendChild(body);

                    // Клик по строке — быстрая загрузка шрифта
                    row.onclick = function () { downloadFile(c, getFileName(c)); };

                    resultsContainer.appendChild(row);
                }
            }
        } catch (g) {}
    }

    return i;
}
