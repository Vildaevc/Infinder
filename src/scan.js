// Пошаговый обход элементов страницы для «тяжёлых» парсеров (Фаза 5.1):
// - исключает собственный виджет (#isf-root), чтобы его стили не попадали в результаты;
// - пропускает элементы без layout (display:none и т.п.) — их цвета/фоны невидимы;
// - работает порциями с паузами, чтобы не «замораживать» UI на крупных страницах.

var BATCH = 300;

export async function scanPageElements(each) {
    var widget = document.getElementById("isf-root");
    var all = document.querySelectorAll("body *");
    for (var i = 0; i < all.length; i++) {
        var el = all[i];
        if (widget && widget.contains(el)) continue;
        // нет layout — элемент скрыт или незначим
        if (!(el.offsetWidth || el.offsetHeight)) continue;
        each(el);
        if (i > 0 && i % BATCH === 0) {
            await new Promise(function (resolve) { setTimeout(resolve, 0); });
        }
    }
}
