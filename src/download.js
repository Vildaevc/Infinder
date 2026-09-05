// Единая точка скачивания файла (Фаза 2.1).
// Приоритет: GM_download — не зависит от CORS и внешних CDN.
// saveAsDialog=true открывает системный диалог «Сохранить как...»
// (работает из обработчика клика; в пакетном скачивании не используется).
// Фолбэк (если менеджер скриптов не предоставил GM_download):
// обычная ссылка с атрибутом download — работает для data:/blob:/same-origin URL.
// FileSaver с CDN больше не подключается (см. vite.config.js).
export function downloadFile(url, name, saveAsDialog) {
    if (typeof GM_download !== "undefined") {
        GM_download({ url: url, name: name, saveAs: !!saveAsDialog });
        return;
    }
    var link = document.createElement("a");
    link.href = url;
    link.download = name || "file";
    document.body.appendChild(link);
    link.click();
    link.remove();
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
