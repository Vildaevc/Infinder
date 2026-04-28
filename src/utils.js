// Утилиты Infinder

// Функция $ — резолвинг URL относительно baseURI
export function resolveUrl(e) {
    try {
        return new URL(e, document.baseURI).href;
    } catch (t) {
        return null;
    }
}

// Функция u — получение имени файла из URL
export function getFileName(e) {
    try {
        if (e.startsWith("data:")) return "file";
        return new URL(e).pathname.split("/").pop() || "file";
    } catch (t) {
        return "file";
    }
}
