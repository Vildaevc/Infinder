// Поиск шрифтов на странице
import { state } from '../state.js';
import { resolveUrl, getFileName } from '../utils.js';
import { downloadFile } from '../download.js';

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
                    var a = s.getPropertyValue("font-family").replace(/['"]/g, "");
                    var l = s.getPropertyValue("src");
                    var d = l.match(/url\(['"]?(.*?)['"]?\)/);
                    if (d && d[1]) {
                        var c = resolveUrl(d[1]);
                        if (c && !c.startsWith("data:") && !e.has(c)) {
                            e.add(c);
                            state.foundUrls.add({ url: c, name: getFileName(c) });
                            i++;
                            var p = document.createElement("div");
                            p.className = "isf-list-item";
                            p.innerHTML = `
                                    <div style="width:100%">
                                        <div style="display:flex;justify-content:space-between">
                                            <span class="isf-item-name">${a}</span>
                                            <span class="isf-item-meta">${getFileName(c).split(".").pop()}</span>
                                        </div>
                                        <div class="isf-font-preview" style="font-family: '${a}', sans-serif !important;">
                                            Quick Brown Fox 123
                                        </div>
                                    </div>
                                `;
                            p.onclick = function () { downloadFile(c, getFileName(c)); };
                            resultsContainer.appendChild(p);
                        }
                    }
                }
            }
        } catch (g) {}
    }

    return i;
}
