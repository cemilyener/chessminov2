import create from 'zustand';

const useChessStore = create((set) => ({
  savedPositions: [],
  savePosition: (fen, isWhiteTurn) => set((state) => ({
    savedPositions: [...state.savedPositions, { fen, isWhiteTurn }],
  })),
  clearPositions: () => set({ savedPositions: [] }),
}));

export default useChessStore;