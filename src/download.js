// Единая точка скачивания файла (Фаза 2.1).
// Приоритет: GM_download — не зависит от CORS и внешних CDN.
// Фолбэк (если менеджер скриптов не предоставил GM_download):
// обычная ссылка с атрибутом download — работает для data:/blob:/same-origin URL.
// FileSaver с CDN больше не подключается (см. vite.config.js).
export function downloadFile(url, name) {
    if (typeof GM_download !== "undefined") {
        GM_download({ url: url, name: name, saveAs: false });
        return;
    }
    var link = document.createElement("a");
    link.href = url;
    link.download = name || "file";
    document.body.appendChild(link);
    link.click();
    link.remove();
}
