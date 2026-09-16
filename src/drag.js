// Перетаскивание элементов виджета Infinder.
// Pointer Events: работает и мышью, и пальцем (тач-экраны), и стилусом.
export function makeDraggable(el, handle) {
    var dragging = false;
    var pointerId = null;
    var startX = 0, startY = 0, originLeft = 0, originTop = 0;

    function onPointerMove(evt) {
        if (pointerId !== null && evt.pointerId !== pointerId) return;
        var dx = evt.clientX - startX;
        var dy = evt.clientY - startY;

        // Считаем перетаскиванием только движение больше 3px (иначе это клик)
        if (!dragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
            dragging = true;
            el.style.cursor = "grabbing";
        }
        if (!dragging) return;

        evt.preventDefault();
        var maxLeft = window.innerWidth - el.offsetWidth;
        var maxTop = window.innerHeight - el.offsetHeight;
        var left = Math.max(0, Math.min(originLeft + dx, maxLeft));
        var top = Math.max(0, Math.min(originTop + dy, maxTop));
        el.style.left = left + "px";
        el.style.top = top + "px";
    }

    function onPointerUp(evt) {
        if (pointerId !== null && evt.pointerId !== pointerId) return;
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);
        el.style.cursor = "";

        if (pointerId !== null && el.releasePointerCapture) {
            try { el.releasePointerCapture(pointerId); } catch (ignore) { /* уже отпущен */ }
        }
        pointerId = null;

        if (dragging) {
            if ("isf-main-button" === el.id) {
                try {
                    localStorage.setItem("isf_pos_v3", JSON.stringify({ left: parseInt(el.style.left), top: parseInt(el.style.top) }));
                } catch (err) { /* localStorage недоступен — позиция не сохранится, это не критично */ }
            }
            // Гасим «клик», который браузер пришлёт сразу после перетаскивания
            setTimeout(function () { dragging = false; }, 50);
        }
    }

    (handle || el).addEventListener("pointerdown", function (evt) {
        if (0 !== evt.button) return; // только основная кнопка мыши / касание
        dragging = false;
        pointerId = evt.pointerId;
        startX = evt.clientX;
        startY = evt.clientY;

        var rect = el.getBoundingClientRect();
        originLeft = rect.left;
        originTop = rect.top;
        el.style.right = "auto";
        el.style.bottom = "auto";
        el.style.left = originLeft + "px";
        el.style.top = originTop + "px";

        // Захват указателя: движение отслеживается даже за пределами элемента
        if (el.setPointerCapture) {
            try { el.setPointerCapture(evt.pointerId); } catch (ignore) { /* не критично */ }
        }
        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp);
        document.addEventListener("pointercancel", onPointerUp);
    });

    el.isJustDragged = function () { return dragging; };
}
