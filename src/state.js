// Состояние приложения Infinder
export const state = {
    isSearching: false,
    foundUrls: new Set(),
    drag: {
        active: false,
        currentX: 0,
        currentY: 0,
        initialX: 0,
        initialY: 0,
        xOffset: 0,
        yOffset: 0
    }
};
