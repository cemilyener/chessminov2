import { create } from 'zustand';
import { ExtendedChess } from "../../../utils/chess/ExtendedChess.js";

const usePdfStore = create((set, get) => ({
  // Durum değişkenleri
  fen: "8/8/8/8/8/8/8/8 w - - 0 1", // Boş tahta ile başla
  moveOrder: "white",
  positions: [], // PDF'e eklenmiş pozisyonlar

  // FEN pozisyonunu güncelleme
  setPosition: (fen, bypass = false) => {
    try {
      if (!fen) return;
      
      const chess = new ExtendedChess(fen, { bypass: bypass ? [10] : [] });
      set({ fen: chess.fen() });
    } catch (error) {
      console.error("PDF Store FEN güncelleme hatası:", error);
    }
  },
  
  // Hamle sırasını güncelleme
  setMoveOrder: (order) => {
    set({ moveOrder: order });
    
    // FEN'deki hamle sırasını da güncelle
    const { fen } = get();
    if (fen) {
      const parts = fen.split(' ');
      if (parts.length > 1) {
        parts[1] = order === 'white' ? 'w' : 'b';
        set({ fen: parts.join(' ') });
      }
    }
  },
  
  // PDF'e pozisyon ekleme
  addPosition: (position) => {
    // Screenshot kontrol
    if (!position.screenshot || !position.screenshot.startsWith('data:image')) {
      console.error('Geçersiz screenshot verisi:', position.screenshot?.substring(0, 100));
      alert('Pozisyon kaydedilemedi: Geçersiz görüntü!');
      return;
    }
    
    // Geçerli screenshot ise pozisyonu ekle
    set((state) => ({ 
      positions: [...state.positions, position] 
    }));
  },
  
  // PDF'den pozisyon çıkarma
  removePosition: (index) => {
    set((state) => ({ 
      positions: state.positions.filter((_, i) => i !== index) 
    }));
  },
  
  // PDF içindeki pozisyonu güncelleme
  updatePosition: (index, position) => {
    set((state) => ({ 
      positions: state.positions.map((pos, i) => i === index ? position : pos) 
    }));
  },
  
  // PDF'deki pozisyonların sırasını değiştirme
  reorderPositions: (fromIndex, toIndex) => {
    set((state) => {
      const positions = [...state.positions];
      const [removed] = positions.splice(fromIndex, 1);
      positions.splice(toIndex, 0, removed);
      return { positions };
    });
  }
}));

export default usePdfStore;