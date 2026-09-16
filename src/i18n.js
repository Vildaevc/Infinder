// Локализация интерфейса виджета.
// Базовый язык — английский; русский включается автоматически,
// если язык браузера русский (navigator.language начинается с "ru").
// Все пользовательские строки виджета должны идти через t() — см. AGENTS.md.

var STRINGS = {
    en: {
        widgetTitle: "Infinder (drag me)",
        close: "Close",
        cat_images: "Images",
        cat_svg: "SVG",
        cat_colors: "Colors",
        cat_fonts: "Fonts",
        cat_media: "Media",
        emptyState: "Pick a category to start searching",
        statusIdle: "Waiting...",
        statusScanning: "Scanning...",
        statusFound: "Found: {n}",
        statusError: "Search failed",
        notFound_images: "No images found",
        notFound_svg: "No SVG found",
        notFound_colors: "No colors found",
        notFound_fonts: "No fonts found",
        notFound_media: "No media found",
        notFound_generic: "Nothing found",
        saveAs: "Save as...",
        copied: "Copied: {value}",
        copyFailed: "Couldn't copy",
        clipboardUnavailable: "Clipboard is unavailable",
        imageFailed: "Couldn't load: {url}"
    },
    ru: {
        widgetTitle: "Infinder (перетащи меня)",
        close: "Закрыть",
        cat_images: "Картинки",
        cat_svg: "SVG",
        cat_colors: "Цвета",
        cat_fonts: "Шрифты",
        cat_media: "Медиа",
        emptyState: "Выберите категорию для поиска",
        statusIdle: "Ожидание...",
        statusScanning: "Сканирование...",
        statusFound: "Найдено: {n}",
        statusError: "Ошибка поиска",
        notFound_images: "Картинки не найдены",
        notFound_svg: "SVG не найдены",
        notFound_colors: "Цвета не найдены",
        notFound_fonts: "Шрифты не найдены",
        notFound_media: "Медиа не найдены",
        notFound_generic: "Ничего не найдено",
        saveAs: "Сохранить как...",
        copied: "Скопировано: {value}",
        copyFailed: "Не удалось скопировать",
        clipboardUnavailable: "Буфер обмена недоступен",
        imageFailed: "Не удалось загрузить: {url}"
    }
};

// Русский — только для ru-локали, все остальные языки получают английский
var locale = (function () {
    var language = (navigator.language || "en").toLowerCase();
    return 0 === language.indexOf("ru") ? "ru" : "en";
})();

export function getLocale() {
    return locale;
}

// t("statusFound", { n: 12 }) -> "Found: 12"
export function t(key, params) {
    var table = STRINGS[locale] || STRINGS.en;
    var text = table[key];
    if (undefined === text) text = STRINGS.en[key];
    if (undefined === text) return key;
    if (params) {
        Object.keys(params).forEach(function (name) {
            text = text.split("{" + name + "}").join(params[name]);
        });
    }
    return text;
}
