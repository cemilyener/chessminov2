import { create } from 'zustand';

/**
 * PDF ödev sayfası oluşturucu için store
 * Pozisyonları ve PDF düzen seçeneklerini yönetir
 */
const usePDFStore = create((set) => ({
  // Pozisyonlar dizisi (maksimum 8 pozisyon)
  positions: [], 
  
  // Düzen tipi: '1', '4', '6', '8' (kaç pozisyon olacağını belirler)
  layoutType: '6',
  
  // PDF dosya adı
  fileName: 'ChessMino-Çalışma-Sayfası',
  
  // Sayfa başlığı
  pageTitle: 'Satranç Çalışma Sayfası',
  
  // Pozisyon ekle
  addPosition: (position) => set((state) => {
    // Düzene göre maksimum pozisyon sayısını kontrol et
    const maxPositions = parseInt(state.layoutType);
    if (state.positions.length >= maxPositions) {
      console.warn(`Maksimum pozisyon sayısına ulaşıldı (${maxPositions})`);
      return state;
    }    
    // Daha stabil bir ID oluştur - timestamp yerine pozisyon sayısı ve rasgele bir değer kullan
    const generateStableId = () => {
      return `pos_${state.positions.length}_${Math.random().toString(36).substring(2, 10)}`;
    };
    
    return {
      positions: [...state.positions, {
        id: generateStableId(),
        fen: position.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        title: position.title || 'Yeni Pozisyon',
        description: position.description || '',
        moveOrder: position.moveOrder || 'white', // 'white' veya 'black'
        screenshot: null
      }]
    };
  }),
  
  // Pozisyon güncelle
  updatePosition: (id, updates) => set((state) => ({
    positions: state.positions.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
  })),
  
  // Pozisyon sil
  removePosition: (id) => set((state) => ({
    positions: state.positions.filter(p => p.id !== id)
  })),
  
  // Pozisyon listesini düzenle (sürükle-bırak için)
  reorderPositions: (positions) => set({ positions }),
  
  // Pozisyon screenshot'ını güncelle
  updatePositionScreenshot: (id, screenshot) => set((state) => ({
    positions: state.positions.map(p => 
      p.id === id ? { ...p, screenshot } : p
    )
  })),
  
  // PDF düzen tipini ayarla
  setLayoutType: (type) => set((state) => {
    // Düzen değiştirildiğinde pozisyon sayısını kontrol et
    const maxPositions = parseInt(type);
    const newPositions = [...state.positions];
    
    // Gerekirse pozisyon sayısını kısıtla
    if (newPositions.length > maxPositions) {
      newPositions.length = maxPositions;
    }
    
    return { 
      layoutType: type,
      positions: newPositions
    };
  }),
  
  // Dosya adını ayarla
  setFileName: (fileName) => set({ fileName }),
  
  // Sayfa başlığını ayarla
  setPageTitle: (pageTitle) => set({ pageTitle }),
  
  // Tüm veriyi temizle
  clearAll: () => set({ 
    positions: [],
    fileName: 'ChessMino-Çalışma-Sayfası',
    pageTitle: 'Satranç Çalışma Sayfası'
  })
}));

export default usePDFStore;