// filepath: c:\Users\PC\Desktop\chessminov2\src\store\useChessStore.js
import { create } from 'zustand';
import ChessContentManager from '../utils/chess/ChessContentManager';

// ChessContentManager örneği oluştur
const manager = new ChessContentManager();

const useChessStore = create((set, get) => ({
  // State 
  puzzleSets: [],
  currentSetIndex: -1,
  currentFen: manager.getCurrentFen(),
  currentNodeId: 'root',
  variations: [],
  alternatives: [],
  history: [],
  isLoading: false,
  error: null,
  
  // PGN yükleme işlemi
  loadPgnText: async (pgnText) => {
    if (!pgnText) return false;
    
    set({ isLoading: true, error: null });
    
    try {
      const success = await manager.loadFromPgn(pgnText);
      
      if (success) {
        // JSON çıktısını al
        const exportedData = manager.export();
        
        // Ana hat ve varyantları debug et
        console.log('Export sonucu:', exportedData);
        if (exportedData.puzzles && exportedData.puzzles.length > 0) {
          console.log('İlk puzzle varyantları:', exportedData.puzzles[0].variations);
        }
        
        // Store state'i güncelle
        set({ 
          puzzleSets: [exportedData],
          currentSetIndex: 0,
          currentFen: manager.getCurrentFen(),
          currentNodeId: 'root',
          variations: exportedData.puzzles[0]?.variations || [],
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
  
  // JSON dışa aktarma
  exportAsJson: (setIndex = 0) => {
    const { puzzleSets } = get();
    
    if (!puzzleSets || puzzleSets.length <= setIndex) {
      console.error('Dışa aktarılacak puzzle seti bulunamadı');
      return null;
    }
    
    const puzzleSet = puzzleSets[setIndex];
    console.log('JSON dışa aktarımı:', puzzleSet);
    return puzzleSet;
  },
  
  // JSON dosyası olarak indirme
  exportAsFile: (setIndex = 0) => {
    const puzzleSet = get().exportAsJson(setIndex);
    
    if (!puzzleSet) return false;
    
    const json = JSON.stringify(puzzleSet, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-puzzle-set-${setIndex + 1}.json`;
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
  getManager: () => manager
}));

export default useChessStore;