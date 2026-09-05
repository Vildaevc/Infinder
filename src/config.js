// Конфигурация Infinder — единый источник значений виджета (Фаза 4.2)
const zIndex = 2147483647;

export const config = {
    // Размер плавающей кнопки, px
    btnSize: 50,
    // Базовый z-index виджета (кнопка, попап)
    zIndex: zIndex,
    // Акцентный цвет (подсветка активной категории, hover, логотип)
    accentColor: "#007AFF",
    // Ширина попапа, px (центрирование вычисляется по факту, см. main.js)
    popupWidth: 380,
    // z-index toast-уведомлений (поверх остального виджета)
    toastZIndex: zIndex + 1,
    // Позиция кнопки по умолчанию (фолбэк, если localStorage недоступен/повреждён)
    defaultPos: { right: 20, bottom: 20 }
};
