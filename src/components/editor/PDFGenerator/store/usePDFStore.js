import { create } from 'zustand';
import { DEFAULT_SETTINGS } from '../utils/constants';

/**
 * Base64 formatının geçerli olup olmadığını kontrol et
 * @param {string} base64String - Kontrol edilecek Base64 dizisi
 * @returns {boolean} - Base64 formatı geçerli mi?
 */
const isValidBase64Image = (base64String) => {
  if (!base64String || typeof base64String !== 'string') return false;
  try {
    // Base64 formatı düzgün mü kontrol et (data:image/ ile başlıyor mu?)
    if (!base64String.startsWith('data:image/')) return false;
    
    // Base64 bölümünü al
    const parts = base64String.split(',');
    if (parts.length !== 2) return false;
    
    const base64Data = parts[1];
    if (!base64Data || base64Data.trim() === '') return false;
    
    // Geçerli base64 karakterleri kontrolü
    const validBase64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!validBase64Regex.test(base64Data)) return false;
    
    // Decode edilebiliyor mu?
    window.atob(base64Data);
    return true;
  } catch (e) {
    console.warn('Base64 doğrulama hatası:', e.message);
    return false;
  }
};

// Import main PDF store to sync position data
import mainPDFStore from '../../../../store/usePDFStore';

export const usePDFStore = create((set, get) => ({
  positions: [],
  currentPositionId: null,
  settings: {
    ...DEFAULT_SETTINGS,
    questionCount: 1
  },
  
  // Add setPositionsForWorksheet function to sync with main store
  setPositionsForWorksheet: (positions) => {
    // Call the main store function
    mainPDFStore.getState().setPositionsForWorksheet(positions);
  },
  
  // Pozisyon işlemleri
  addPosition: (position) => {
    // Pozisyon geçerlilik kontrolü
    if (!position) return;
    
    // Screenshot varsa doğrula
    if (position.screenshot && !isValidBase64Image(position.screenshot)) {
      console.warn("Geçersiz base64 görüntü formatı. Pozisyon eklenemedi.");
      return;
    }
    
    set((state) => ({
      positions: [...state.positions, {
        ...position,
        id: crypto.randomUUID() // Date.now() yerine daha güvenli UUID
      }]
    }));
  },
  
  updatePosition: (id, updatedPosition) => {
    if (!id || !updatedPosition) return;
    
    // Screenshot varsa doğrula
    if (updatedPosition.screenshot && !isValidBase64Image(updatedPosition.screenshot)) {
      console.warn("Geçersiz base64 görüntü formatı. Pozisyon güncellenemedi.");
      return;
    }
    
    set((state) => ({
      positions: state.positions.map(p => 
        p.id === id ? { ...p, ...updatedPosition } : p
      )
    }));
  },
  
  removePosition: (id) => set((state) => {
    const newPositions = state.positions.filter(p => p.id !== id);
    const newCurrentId = state.currentPositionId === id 
      ? (newPositions[0]?.id || null) 
      : state.currentPositionId;
      
    return {
      positions: newPositions,
      currentPositionId: newCurrentId
    };
  }),
  
  movePosition: (id, direction) => set((state) => {
    const positions = [...state.positions];
    const index = positions.findIndex(p => p.id === id);
    
    if (index < 0) return state;
    
    if (direction === 'up' && index > 0) {
      const temp = positions[index - 1];
      positions[index - 1] = positions[index];
      positions[index] = temp;
    } else if (direction === 'down' && index < positions.length - 1) {
      // BUG FIX: Define temp before using it
      const temp = positions[index + 1];
      positions[index + 1] = positions[index];
      positions[index] = temp;
    }
    
    return { positions };
  }),
  
  setCurrentPositionId: (id) => set(() => ({ currentPositionId: id })),
  
  // Ayarlar
  updateSettings: (newSettings) => {
    // Logo varsa doğrula
    if (newSettings.schoolLogo && !isValidBase64Image(newSettings.schoolLogo)) {
      console.warn("Geçersiz base64 logo formatı. Logo güncellenemedi.");
      // Logo'yu çıkar ama diğer ayarları güncelle
      const { schoolLogo: _, ...restSettings } = newSettings;
      set((state) => ({
        settings: { ...state.settings, ...restSettings }
      }));
      return;
    }
    
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
  },
  
  // Reset
  resetStore: () => set(() => ({
    positions: [],
    currentPositionId: null,
    settings: {
      ...DEFAULT_SETTINGS,
      questionCount: 1
    }
  })),
  
  // Geçerli pozisyonları al
  getValidPositions: () => {
    const { positions } = get();
    return positions.filter(position => {
      if (!position) return false;
      if (position.screenshot) {
        return isValidBase64Image(position.screenshot);
      }
      return true; // Screenshot olmayan pozisyonlar da geçerli
    });
  }
}));