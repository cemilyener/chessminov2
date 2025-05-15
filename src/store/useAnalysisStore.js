import { create } from 'zustand';

/**
 * Satranç analizi için store
 * - ok çizme (arrows)
 * - kare renklendirme (highlightedSquares)
 * özellikleri için state ve fonksiyonlar içerir
 */
const useAnalysisStore = create((set) => ({
  // Oklar: [başlangıç karesi, hedef karesi, renk]
  arrows: [],
  
  // Renkli kareler: { kare_ismi: renk }
  highlightedSquares: {},
  
  // Aktif renkler
  currentArrowColor: "blue",
  currentHighlightColor: "yellow",
  
  // Aktif renkleri değiştir
  setCurrentArrowColor: (color) => set({ currentArrowColor: color }),
  setCurrentHighlightColor: (color) => set({ currentHighlightColor: color }),
  
  // Ok ekle
  addArrow: (from, to, color) => set((state) => {
    // Aynı ok varsa ekleme
    const exists = state.arrows.some(
      arrow => arrow[0] === from && arrow[1] === to
    );
    
    if (exists) return state;
    
    return {
      arrows: [...state.arrows, [from, to, color || state.currentArrowColor]]
    };
  }),
  
  // Ok kaldır
  removeArrow: (from, to) => set((state) => ({
    arrows: state.arrows.filter(
      arrow => !(arrow[0] === from && arrow[1] === to)
    )
  })),
  
  // Son çizilen oku geri al
  undoLastArrow: () => set((state) => {
    if (state.arrows.length === 0) return state;
    
    const newArrows = [...state.arrows];
    newArrows.pop(); // Son oku kaldır
    
    return {
      arrows: newArrows
    };
  }),
  
  // Tüm okları temizle
  clearArrows: () => set({ arrows: [] }),
  
  // Kare renklendir (toggle mantığıyla)
  highlightSquare: (square, color) => set((state) => {
    const newHighlightedSquares = { ...state.highlightedSquares };
    
    // Eğer aynı renk varsa kaldır (toggle)
    if (newHighlightedSquares[square] === (color || state.currentHighlightColor)) {
      delete newHighlightedSquares[square];
    } else {
      newHighlightedSquares[square] = color || state.currentHighlightColor;
    }
    
    return { highlightedSquares: newHighlightedSquares };
  }),
  
  // Kare rengini kaldır
  unhighlightSquare: (square) => set((state) => {
    const newHighlightedSquares = { ...state.highlightedSquares };
    delete newHighlightedSquares[square];
    return { highlightedSquares: newHighlightedSquares };
  }),
  
  // Tüm renklendirmeleri temizle
  clearHighlights: () => set({ highlightedSquares: {} }),
  
  // Tüm okları ve renklendirmeleri temizle
  clearAll: () => set({ arrows: [], highlightedSquares: {} })
}));

export default useAnalysisStore;