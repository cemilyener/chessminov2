import { create } from "zustand";

const useChessStore = create((set) => ({
  savedPositions: [],
  
  savePosition: (position, isWhiteTurn) =>
    set((state) => {
      // Pozisyon zaten varsa kaydetme
      if (state.savedPositions.some((saved) => saved.fen === position)) {
        return state;
      }
      // Maks 6 pozisyon sınırlaması
      if (state.savedPositions.length >= 6) {
        alert('Maksimum 6 pozisyon kaydedebilirsiniz.');
        return state;
      }
      // Pozisyonu ve hamle sırasını birlikte kaydet
      return {
        savedPositions: [
          ...state.savedPositions,
          {
            fen: position,
            isWhiteTurn,
            id: Date.now() // Unique ID
          },
        ],
      };
    }),
    
  clearPositions: () => set({ savedPositions: [] }),
  
  removePosition: (id) =>
    set((state) => ({
      savedPositions: state.savedPositions.filter(pos => pos.id !== id)
    }))
}));

export default useChessStore;
