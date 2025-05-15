import { create } from 'zustand';

export const usePDFStore = create((set, get) => ({
  // State
  positions: [],
  currentPositionId: null,
  settings: {
    title: 'Satranç Çalışma Sayfası',
    author: '',
    schoolName: '',
    schoolLogo: null,
    layoutType: '6', // 1, 2, 4, 6, 8
    pageSize: 'A4',
    orientation: 'portrait'
  },
  
  // Actions
  addPosition: (position) => set(state => ({
    positions: [...state.positions, {
      id: Date.now(),
      fen: position.fen,
      title: position.title || `Pozisyon ${state.positions.length + 1}`,
      description: position.description || '',
      moveOrder: position.moveOrder || 'white',
      screenshot: position.screenshot || null
    }]
  })),
  
  updatePosition: (id, updates) => set(state => ({
    positions: state.positions.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
  })),
  
  removePosition: (id) => set(state => ({
    positions: state.positions.filter(p => p.id !== id)
  })),
  
  updateSettings: (newSettings) => set(state => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
  setCurrentPosition: (id) => set({ currentPositionId: id })
}));