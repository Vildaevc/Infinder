// Единая точка скачивания файла (Фаза 2.1).
// Приоритет: GM_download — не зависит от CORS и внешних CDN.
// saveAsDialog=true открывает системный диалог «Сохранить как...»
// (работает из обработчика клика; в пакетном скачивании не используется).
// FileSaver с CDN не подключается (см. vite.config.js).

// Верхний порог для скачивания через Blob в фолбэке (защита от выедания памяти)
var MAX_BLOB_SIZE = 256 * 1024 * 1024;

function anchorDownload(href, name, revoke) {
    var link = document.createElement("a");
    link.href = href;
    link.download = name || "file";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (revoke) setTimeout(function () { URL.revokeObjectURL(href); }, 60000);
}

// Фолбэк для менеджеров без GM_download (например, OrangeMonkey):
// - data:/blob:/same-origin — прямая ссылка с атрибутом download;
// - кросс-доменные — через fetch в Blob (работает, если ресурс отдаёт CORS);
// - если и это не удалось — открываем в новой вкладке (последний вариант).
function fallbackDownload(url, name) {
    var sameOrigin = false;
    try {
        sameOrigin = new URL(url, location.href).origin === location.origin;
    } catch (ignore) { /* некорректный URL — попробуем fetch */ }

    if (0 === url.indexOf("data:") || 0 === url.indexOf("blob:") || sameOrigin) {
        anchorDownload(url, name, false);
        return;
    }

    fetch(url, { credentials: "omit" })
        .then(function (response) {
            if (!response.ok) throw new Error("HTTP " + response.status);
            var length = parseInt(response.headers.get("content-length") || "0", 10);
            if (length && length > MAX_BLOB_SIZE) throw new Error("файл слишком большой");
            return response.blob();
        })
        .then(function (blob) { anchorDownload(URL.createObjectURL(blob), name, true); })
        .catch(function () { window.open(url, "_blank", "noopener"); });
}

export function downloadFile(url, name, saveAsDialog) {
    if (typeof GM_download !== "undefined") {
        GM_download({ url: url, name: name, saveAs: !!saveAsDialog });
        return;
    }
    // В фолбэке диалог «Сохранить как...» зависит от настроек браузера
    fallbackDownload(url, name);
}

// Кнопка «Сохранить как...» для элементов результатов (плиток/строк).
// Клик по самому элементу — быстрая загрузка; эта кнопка — диалог сохранения.
export function createSaveAsButton(onSaveAs) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "isf-save-as";
    btn.title = "Сохранить как...";
    btn.setAttribute("aria-label", "Сохранить как...");
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
    btn.addEventListener("click", function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        onSaveAs();
    });
    return btn;
}
