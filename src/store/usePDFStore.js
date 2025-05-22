import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * PDF ödev sayfası oluşturucu için store
 * Pozisyonları ve PDF düzen seçeneklerini yönetir
 */
const usePDFStore = create(
  persist(
    (set, get) => ({
      // Mevcut özellikler...
      positions: [],
      layoutType: '6',
      fileName: 'chess-worksheet',
      pageTitle: 'Satranç Çalışma Sayfası',      // Worksheet için pozisyonları ayarla - PDF Generator'dan veri aktarımı için
      setPositionsForWorksheet: (positions) => {
        console.log('Setting positions for worksheet:', positions);
        
        // Validate positions array
        if (!positions || !Array.isArray(positions)) {
          console.error('Invalid positions data:', positions);
          return;
        }
        
        // Filter out invalid positions and ensure required fields
        const validPositions = positions
          .filter(pos => pos && pos.fen)
          .map(pos => ({
            ...pos,
            id: pos.id || `pos_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
            title: pos.title || 'Untitled Position',
            description: pos.description || '',
          }));
        
        console.log(`Filtered ${positions.length} positions to ${validPositions.length} valid positions`);
        set({ positions: validPositions });
      },
      
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
        fileName: 'chess-worksheet',
        pageTitle: 'Satranç Çalışma Sayfası'      }),

      // Note: setPositionsForWorksheet is already defined above
    }),
    {
      name: 'pdf-positions-storage',
      getStorage: () => localStorage,
    }
  )
);

export default usePDFStore;