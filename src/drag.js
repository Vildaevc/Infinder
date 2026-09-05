// Функционал перетаскивания для элементов виджета Infinder

// Функция d(e, t) — drag
export function makeDraggable(e, t) {
    let i = false, r, o, n, s;

    function a(t) {
        let a = t.clientX - r, l = t.clientY - o;
        if (!i && (Math.abs(a) > 3 || Math.abs(l) > 3) && (i = true, e.style.cursor = "grabbing"), i) {
            t.preventDefault();
            let d = n + a, f = s + l, c = window.innerWidth - e.offsetWidth, p = window.innerHeight - e.offsetHeight;
            d = Math.max(0, Math.min(d, c)), f = Math.max(0, Math.min(f, p));
            e.style.left = d + "px";
            e.style.top = f + "px";
        }
    }

    function l(t) {
        document.removeEventListener("mousemove", a);
        document.removeEventListener("mouseup", l);
        e.style.cursor = "";
        if (i) {
            if ("isf-main-button" === e.id) {
                try {
                    localStorage.setItem("isf_pos_v3", JSON.stringify({ left: parseInt(e.style.left), top: parseInt(e.style.top) }));
                } catch (err) { /* localStorage недоступен — позиция не сохранится, это не критично */ }
            }
            setTimeout(function () { i = false; }, 50);
        }
    }

    (t || e).addEventListener("mousedown", function (t) {
        if (0 !== t.button) return;
        i = false;
        r = t.clientX;
        o = t.clientY;
        var d = e.getBoundingClientRect();
        n = d.left;
        s = d.top;
        e.style.right = "auto";
        e.style.bottom = "auto";
        e.style.left = n + "px";
        e.style.top = s + "px";
        document.addEventListener("mousemove", a);
        document.addEventListener("mouseup", l);
    });

    e.isJustDragged = function () { return i; };
}
