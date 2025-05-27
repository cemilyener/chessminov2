// filepath: c:\Users\PC\Desktop\chessminov2\src\store\useChessStore.js
import { create } from 'zustand';
import ChessContentManager from '../utils/chess/ChessContentManager';
import { Chess } from 'chess.js';
import { ExtendedChess } from '../utils/chess/ExtendedChess.js';
import SmartNamingDecoder from '../utils/smartNaming/SmartNamingDecoder';

// ChessContentManager örneği oluştur
const manager = new ChessContentManager();

const useChessStore = create((set, get) => ({
  // Mevcut state 
  puzzleSets: [],
  currentSetIndex: -1,
  currentFen: manager.getCurrentFen(),
  currentNodeId: 'root',
  variations: [],
  alternatives: [],
  history: [],
  isLoading: false,
  error: null,
  
  // BasicBoard için ekstra state'ler
  arrows: [], 
  highlightedSquares: {}, 
  
  // PDF Generator için state'ler
  savedPositions: [], 
  maxPositions: 6, 
  
  // Puzzle Editor için state'ler
  selectedPuzzleSet: null, 
  isPuzzleEditorMode: false, 
  
  // PGN yükleme işlemi
  loadPgnText: async (pgnText) => {
    if (!pgnText) return false;
    
    set({ isLoading: true, error: null });
    
    try {
      const success = await manager.loadFromPgn(pgnText);
      
      if (success) {
        // JSON çıktısını al
        const exportedData = manager.export();
        
        // Export edilen puzzle'lara akıllı isimlendirme ekle
        const enhancedPuzzles = exportedData.puzzles.map((puzzle, index) => {
          // Varsayılan smart code oluştur (001ka1 formatında)
          const defaultSmartCode = SmartNamingDecoder.encode(
            index + 1, // set numarası
            'k', // varsayılan kale
            'a', // varsayılan alma
            '1'  // varsayılan kolay
          );
          
          return {
            ...puzzle,
            smartCode: defaultSmartCode,
            pieceSet: 'merida',
            metadata: {
              ...puzzle.metadata,
              smartCode: defaultSmartCode,
              decodedData: SmartNamingDecoder.decode(defaultSmartCode),
              pieceSet: 'merida',
              customTitle: false,
              customDescription: false,
              lastModified: new Date().toISOString()
            }
          };
        });
        
        const enhancedData = {
          ...exportedData,
          puzzles: enhancedPuzzles
        };
        
        console.log('Enhanced export sonucu:', enhancedData);
        
        // Store state'i güncelle
        set({ 
          puzzleSets: [enhancedData],
          currentSetIndex: 0,
          currentFen: manager.getCurrentFen(),
          currentNodeId: 'root',
          variations: enhancedData.puzzles[0]?.variations || [],
          alternatives: [],
          isLoading: false
        });
        
        return true;
      } else {
        set({ error: 'PGN yüklenemedi', isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('PGN yükleme hatası:', error);
      set({ error: `PGN yükleme hatası: ${error.message}`, isLoading: false });
      return false;
    }
  },
  
  // PGN dosyası yükleme
  loadPgnFile: async (file) => {
    if (!file) return false;
    
    set({ isLoading: true, error: null });
    
    try {
      const text = await file.text();
      return get().loadPgnText(text);
    } catch (error) {
      console.error('Dosya okuma hatası:', error);
      set({ error: `Dosya okuma hatası: ${error.message}`, isLoading: false });
      return false;
    }
  },
  
  // JSON dışa aktarma - Enhanced metadata ile
  exportAsJson: (setIndex = 0) => {
    const { puzzleSets } = get();
    
    if (!puzzleSets || puzzleSets.length <= setIndex) {
      console.error('Dışa aktarılacak puzzle seti bulunamadı');
      return null;
    }
    
    const puzzleSet = puzzleSets[setIndex];
    
    // Export sırasında akıllı isimlendirme bilgilerini koruyalım
    const enhancedPuzzleSet = {
      ...puzzleSet,
      metadata: {
        ...puzzleSet.metadata,
        exportDate: new Date().toISOString(),
        smartNamingVersion: '1.0'
      },
      puzzles: puzzleSet.puzzles.map(puzzle => ({
        ...puzzle,
        metadata: {
          ...puzzle.metadata,
          smartCode: puzzle.smartCode,
          pieceSet: puzzle.pieceSet || 'merida',
          decodedData: puzzle.metadata?.decodedData
        }
      }))
    };
    
    console.log('Enhanced JSON dışa aktarımı:', enhancedPuzzleSet);
    return enhancedPuzzleSet;
  },
  
  // JSON dosyası olarak indirme
  exportAsFile: (setIndex = 0) => {
    const puzzleSet = get().exportAsJson(setIndex);
    
    if (!puzzleSet) return false;
    
    const json = JSON.stringify(puzzleSet, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Dosya adını akıllı isimlendirmeye göre oluştur
    const firstPuzzle = puzzleSet.puzzles[0];
    const smartCode = firstPuzzle?.smartCode || 'unknown';
    const fileName = `chessmino-set-${smartCode}-${new Date().toISOString().split('T')[0]}.json`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  },
  
  // Hamle yapma
  makeMove: (from, to, promotion) => {
    try {
      const result = manager.makeMove(from, to, promotion);
      
      if (result.success) {
        set({ 
          currentFen: result.fen,
          currentNodeId: manager.tree.metadata.currentNodeId
        });
        
        return result;
      }
      
      return { success: false, error: 'Geçersiz hamle' };
    } catch (error) {
      console.error('Hamle hatası:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Belirli bir düğüme git
  goToNode: (nodeId) => {
    try {
      const result = manager.goToNode(nodeId);
      
      if (result.success) {
        set({ 
          currentFen: manager.getCurrentFen(),
          currentNodeId: nodeId
        });
      }
      
      return result;
    } catch (error) {
      console.error('Düğüme gitme hatası:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Varyant değiştirme
  switchVariant: (targetNodeId) => {
    try {
      const result = manager.switchVariant ? manager.switchVariant(targetNodeId) : { success: false, error: 'switchVariant metodu bulunamadı' };
      
      if (result.success) {
        set({ 
          currentFen: result.fen,
          currentNodeId: manager.tree.metadata.currentNodeId
        });
        
        // Alternatif hamleleri güncelle
        get().getAlternatives();
      }
      
      return result;
    } catch (error) {
      console.error('Varyant değiştirme hatası:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Alternatif hamleleri al
  getAlternatives: (nodeId = null) => {
    try {
      if (!manager.getAlternativesAt) {
        set({ alternatives: [] });
        return [];
      }
      
      const alts = manager.getAlternativesAt(nodeId);
      set({ alternatives: alts });
      return alts;
    } catch (error) {
      console.error('Alternatif hamleleri alma hatası:', error);
      set({ alternatives: [] });
      return [];
    }
  },

  // ChessContentManager'a doğrudan erişim
  getManager: () => manager,

  // Board için yöntemler
  setPosition: (fen, allowKingless = false) => {
    try {
      if (allowKingless) {
        // Şahsız konumlar için ExtendedChess kullan
        const chess = new ExtendedChess(fen, { bypass: [10] });
        set({ currentFen: chess.fen() });
      } else {
        // Normal pozisyonlar için standart chess.js doğrulaması
        const chess = new Chess(fen);
        set({ currentFen: chess.fen() });
      }
    } catch (error) {
      console.error("Geçersiz FEN:", error);
    }
  },
  
  // Ok çizme fonksiyonları
  addArrow: (from, to, color = "blue") => set(state => ({
    arrows: [...state.arrows, [from, to, color]]
  })),
  
  clearArrows: () => set({ arrows: [] }),
  
  // Kare renklendirme fonksiyonları
  highlightSquare: (square, color = "blue") => set(state => ({
    highlightedSquares: { 
      ...state.highlightedSquares, 
      [square]: color 
    }
  })),
  
  clearHighlightedSquare: (square) => set(state => {
    const newHighlighted = { ...state.highlightedSquares };
    delete newHighlighted[square];
    return { highlightedSquares: newHighlighted };
  }),
  
  clearAllHighlights: () => set({ highlightedSquares: {} }),
  
  // PDF Generator fonksiyonları
  savePosition: (fen, isWhiteTurn) => set((state) => {
    // Maksimum pozisyon sayısını kontrol et
    if (state.savedPositions.length >= state.maxPositions) {
      return state; // Değişiklik yapma
    }
    return {
      savedPositions: [...state.savedPositions, { fen, isWhiteTurn }]
    };
  }),
  
  clearPositions: () => set({ savedPositions: [] }),
  
  removePosition: (index) => set((state) => ({
    savedPositions: state.savedPositions.filter((_, i) => i !== index)
  })),
  
  // Puzzle Editor işlemleri
  selectPuzzleSet: (setIndex) => set((state) => ({
    selectedPuzzleSet: state.puzzleSets[setIndex] || null
  })),
  
  createNewPuzzleSet: (metadata) => set((state) => {
    const newSet = {
      metadata: {
        title: metadata.title || 'Yeni Puzzle Seti',
        source: metadata.source || 'Manual',
        count: 0,
        smartNamingVersion: '1.0',
        createdDate: new Date().toISOString()
      },
      puzzles: []
    };
    
    return {
      puzzleSets: [...state.puzzleSets, newSet]
    };
  }),
  
  deletePuzzleSet: (setIndex) => set((state) => ({
    puzzleSets: state.puzzleSets.filter((_, i) => i !== setIndex),
    selectedPuzzleSet: state.selectedPuzzleSet === state.puzzleSets[setIndex] ? null : state.selectedPuzzleSet
  })),
  
  updatePuzzleSetMetadata: (setIndex, metadata) => set((state) => {
    const updatedSets = [...state.puzzleSets];
    if (updatedSets[setIndex]) {
      updatedSets[setIndex].metadata = { 
        ...updatedSets[setIndex].metadata, 
        ...metadata,
        lastModified: new Date().toISOString()
      };
    }
    return { puzzleSets: updatedSets };
  }),

  // Enhanced Puzzle CRUD işlemleri
  addPuzzleToSet: (setIndex, puzzleData) => set((state) => {
    const updatedSets = [...state.puzzleSets];
    
    if (updatedSets[setIndex]) {
      // Smart code varsa decode et
      let decodedData = null;
      if (puzzleData.smartCode) {
        decodedData = SmartNamingDecoder.decode(puzzleData.smartCode);
      }
      
      const puzzleWithId = {
        ...puzzleData,
        id: puzzleData.id || `puzzle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          ...puzzleData.metadata,
          smartCode: puzzleData.smartCode,
          decodedData,
          pieceSet: puzzleData.pieceSet || 'merida',
          createdDate: new Date().toISOString()
        }
      };
      
      updatedSets[setIndex].puzzles.push(puzzleWithId);
      updatedSets[setIndex].metadata.count = updatedSets[setIndex].puzzles.length;
      updatedSets[setIndex].metadata.lastModified = new Date().toISOString();
    }
    
    return { puzzleSets: updatedSets };
  }),

  updatePuzzle: (setIndex, puzzleId, updatedPuzzleData) => set((state) => {
    const updatedSets = [...state.puzzleSets];
    
    if (updatedSets[setIndex]) {
      const puzzleIndex = updatedSets[setIndex].puzzles.findIndex(p => p.id === puzzleId);
      
      if (puzzleIndex !== -1) {
        // Smart code varsa decode et
        let decodedData = null;
        if (updatedPuzzleData.smartCode) {
          decodedData = SmartNamingDecoder.decode(updatedPuzzleData.smartCode);
        }
        
        const updatedPuzzle = {
          ...updatedPuzzleData,
          id: puzzleId,
          metadata: {
            ...updatedPuzzleData.metadata,
            smartCode: updatedPuzzleData.smartCode,
            decodedData,
            pieceSet: updatedPuzzleData.pieceSet || 'merida',
            lastModified: new Date().toISOString()
          }
        };
        
        updatedSets[setIndex].puzzles[puzzleIndex] = updatedPuzzle;
        updatedSets[setIndex].metadata.lastModified = new Date().toISOString();
      }
    }
    
    return { puzzleSets: updatedSets };
  }),

  deletePuzzle: (setIndex, puzzleId) => set((state) => {
    const updatedSets = [...state.puzzleSets];
    if (updatedSets[setIndex]) {
      updatedSets[setIndex].puzzles = updatedSets[setIndex].puzzles.filter(p => p.id !== puzzleId);
      updatedSets[setIndex].metadata.count = updatedSets[setIndex].puzzles.length;
      updatedSets[setIndex].metadata.lastModified = new Date().toISOString();
    }
    return { puzzleSets: updatedSets };
  }),

  // Puzzle set yönetimi
  setPuzzleEditorMode: (isActive) => set({ isPuzzleEditorMode: isActive }),
  
  // Smart naming helper methods
  validateSmartCode: (code) => {
    return SmartNamingDecoder.validateCode(code);
  },
  
  decodeSmartCode: (code) => {
    return SmartNamingDecoder.decode(code);
  },
  
  getSmartNamingOptions: () => {
    return SmartNamingDecoder.getAllOptions();
  }
}));

export default useChessStore;