import { create } from 'zustand';
import { createChessInstance } from './chessUtils';

const useBoardEditorStore = create((set, get) => ({
  // Editor state
  editorType: 'puzzleSet',
  currentFen: '8/8/8/8/8/8/8/8 w - - 0 1',

  // Varyant state'i
  chess: null,
  initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  puzzleInitialFen: null, // Puzzle'ın başlangıç FEN'i
  variants: {
    main: {
      label: 'Ana Hat',
      moves: [],
      parentMoveIndex: -1,
      parentVariant: null
    }
  },
  activeVariant: 'main',
  moveIndex: -1,

  // Puzzle metadata
  puzzleMetadata: {
    id: '',
    index: 1,
    title: '',
    fen: '8/8/8/8/8/8/8/8 w - - 0 1',
  },

  // Puzzle set data
  puzzleSetData: {
    id: '',
    title: '',
    description: '',
    topic: '',
    exerciseType: '',
    difficulty: 1,
    pieceSet: 'merida_no_kings',
    nextSetId: '',
    puzzles: []
  },

  // Status message
  statusMessage: '',

  // Initialize chess instance
  initializeChess: (fen) => set(state => ({
    chess: createChessInstance(fen),
    currentFen: fen
  })),

  // Helper: Get the correct starting FEN for a variant
  getVariantStartingFen: (variantName) => {
    const state = get();
    // Ana hat için puzzleInitialFen veya initialFen kullan
    if (variantName === 'main') {
      // Puzzle yüklüyse puzzle FEN'ini, değilse standart FEN'i kullan
      const startFen = state.puzzleInitialFen || state.initialFen;
      console.log(`[getVariantStartingFen] Returning FEN for main: ${startFen}`);
      return startFen;
    }
    
    const variant = state.variants[variantName];
    if (!variant) {
      console.error(`[getVariantStartingFen] Variant not found: ${variantName}`);
      return state.puzzleInitialFen || state.currentFen;
    }
    
    // Varyant başka bir varyanttan dallanıyorsa
    if (variant.parentVariant && variant.parentMoveIndex >= 0) {
      const parentVar = state.variants[variant.parentVariant];
      
      if (parentVar && parentVar.moves && parentVar.moves[variant.parentMoveIndex]) {
        const parentFen = parentVar.moves[variant.parentMoveIndex].fen;
        console.log(`[getVariantStartingFen] Returning FEN at branch point for ${variantName}: ${parentFen}`);
        return parentFen;
      }
    }
    
    // Varyant main'den başlıyorsa (-1 indeksli)
    if (variant.parentVariant === 'main' && variant.parentMoveIndex === -1) {
      const puzzleFen = state.puzzleInitialFen || state.currentFen;
      console.log(`[getVariantStartingFen] Variant starts from puzzle beginning: ${puzzleFen}`);
      return puzzleFen;
    }
    
    // Fallback
    return state.puzzleInitialFen || state.currentFen;
  },

  // Record move
  recordMove: (from, to, promotion) => {
    const state = get();
    const activeVariant = state.activeVariant;
    console.log(`[recordMove] Recording move: ${from}-${to} for variant: ${activeVariant}, current index: ${state.moveIndex}`);
    const chess = createChessInstance(state.currentFen);
    let result;
    
    try {
      result = chess.move({ from, to, promotion });
    } catch (e) {
      console.error('[recordMove] Error making move:', e);
      return { success: false, error: e.message };
    }
    
    if (result) {
      const newFen = chess.fen();
      const move = { from, to, promotion, fen: newFen, captured: result.captured, san: result.san };
      
      set(state => {
        const moves = state.variants[activeVariant].moves;
        const currentIndex = state.moveIndex;
        
        // Basitleştirilmiş mantık
        let newMoves;
        if (currentIndex === -1) {
          newMoves = [move];
        } else {
          newMoves = [...moves.slice(0, currentIndex + 1), move];
        }
        
        const newMoveIndex = newMoves.length - 1;
        
        console.log('[recordMove] Index update:', {
          currentIndex,
          newMoveIndex,
          totalMoves: newMoves.length
        });
        
        return {
          ...state,
          currentFen: newFen,
          moveIndex: newMoveIndex,
          variants: {
            ...state.variants,
            [activeVariant]: {
              ...state.variants[activeVariant],
              moves: newMoves
            }
          }
        };
      });
      
      return { success: true, fen: newFen, move: result };
    }
    return { success: false };
  },

  // Go back
  goBack: () => {
    const state = get();
    const { getVariantStartingFen } = get();
    const activeVariant = state.activeVariant;
    const variant = state.variants[activeVariant];
    console.log(`[goBack] Starting - variant: ${activeVariant}, moveIndex: ${state.moveIndex}`);
    console.log(`[goBack] variant.moves:`, variant?.moves?.map((m, i) => `${i}: ${m.from}-${m.to}`));
    if (!variant || !variant.moves) {
      console.error(`[goBack] Geçersiz varyant: ${activeVariant}`);
      return { success: false, error: 'Geçersiz varyant' };
    }
    
    if (!variant) {
      console.error(`[goBack] Varyant bulunamadı: ${activeVariant}`);
      return { success: false, error: 'Varyant bulunamadı' };
    }
    
    const moves = variant.moves;
    const oldIndex = state.moveIndex;
    const newIndex = Math.max(-1, oldIndex - 1);
    
    console.log(`[goBack] Start - variant: ${activeVariant}, oldIndex: ${oldIndex}, newIndex: ${newIndex}`);
    console.log(`[goBack] Total moves in variant: ${moves.length}`);
    
    // Aktif varyantın doğru başlangıç FEN'ini kullan
    const startFen = getVariantStartingFen(activeVariant);
    console.log(`[goBack] startFen: ${startFen}`);
    
    const chess = createChessInstance(startFen);
    let newFen = startFen;
    
    if (newIndex >= 0) {
      try {
        // Sadece aktif varyantın hamlelerini replay et
        for (let i = 0; i <= newIndex; i++) {
          const move = moves[i];
          console.log(`[goBack] Replaying move ${i}:`, move);
          // Pozisyonu kontrol et
          const boardState = chess.board();
          console.log(`[goBack] Before move ${i}, FEN: ${chess.fen()}`);
          const result = chess.move({ 
            from: move.from, 
            to: move.to, 
            promotion: move.promotion 
          });
          
          if (!result) {
            console.error(`[goBack] Hamle yapılamadı, indeks ${i}:`, move);
            console.log(`[goBack] Current FEN before failed move: ${chess.fen()}`);
            return { success: false, error: `Geçersiz hamle: ${move.from}-${move.to}` };
          }
        }
        newFen = chess.fen();
      } catch (error) {
        console.error('[goBack] Hata:', error);
        return { success: false, error: error.message };
      }
    }
    
    set({
      currentFen: newFen,
      moveIndex: newIndex,
      chess: createChessInstance(newFen)
    });
    
    console.log(`[goBack] End - newFen: ${newFen}`);
    return { success: true, fen: newFen };
  },

  // Go forward
  goForward: () => {
    const state = get();
    const { getVariantStartingFen } = get();
    const activeVariant = state.activeVariant;
    const variant = state.variants[activeVariant];
    console.log(`[goForward] Starting - variant: ${activeVariant}, moveIndex: ${state.moveIndex}`);
    console.log(`[goForward] variant.moves:`, variant?.moves?.map((m, i) => `${i}: ${m.from}-${m.to}`));
    if (!variant || !variant.moves) {
      console.error(`[goForward] Geçersiz varyant: ${activeVariant}`);
      return { success: false, error: 'Geçersiz varyant' };
    }
    
    if (!variant) {
      console.error(`[goForward] Varyant bulunamadı: ${activeVariant}`);
      return { success: false, error: 'Varyant bulunamadı' };
    }
    
    const moves = variant.moves;
    const oldIndex = state.moveIndex;
    const newIndex = Math.min(moves.length - 1, oldIndex + 1);
    
    console.log(`[goForward] Start - variant: ${activeVariant}, oldIndex: ${oldIndex}, newIndex: ${newIndex}`);
    
    // Aktif varyantın doğru başlangıç FEN'ini kullan
    const startFen = getVariantStartingFen(activeVariant);
    const chess = createChessInstance(startFen);
    let newFen = startFen;
    
    if (newIndex >= 0) {
      try {
        // Sadece aktif varyantın hamlelerini replay et
        for (let i = 0; i <= newIndex; i++) {
          const move = moves[i];
          const result = chess.move({ 
            from: move.from, 
            to: move.to, 
            promotion: move.promotion 
          });
          
          if (!result) {
            console.error(`[goForward] Hamle yapılamadı, indeks ${i}:`, move);
            return { success: false, error: `Geçersiz hamle: ${move.from}-${move.to}` };
          }
        }
        newFen = chess.fen();
      } catch (error) {
        console.error('[goForward] Hata:', error);
        return { success: false, error: error.message };
      }
    }
    
    set({
      currentFen: newFen,
      moveIndex: newIndex,
      chess: createChessInstance(newFen)
    });
    
    console.log(`[goForward] End - newFen: ${newFen}`);
    return { success: true, fen: newFen };
  },

  // Mark last move
  markLastMove: (index) => set(state => {
    const activeVariant = state.activeVariant;
    const moves = state.variants[activeVariant].moves;
    const targetIndex = index !== undefined ? index : state.moveIndex;
    
    if (targetIndex >= 0 && targetIndex < moves.length) {
      const updatedMoves = moves.map((move, i) => ({
        ...move,
        isLast: i === targetIndex
      }));
      
      return {
        ...state,
        variants: {
          ...state.variants,
          [activeVariant]: {
            ...state.variants[activeVariant],
            moves: updatedMoves
          }
        }
      };
    }
    return state;
  }),

  // Go to move - DÜZELTILMIŞ
  goToMove: (index) => {
    const state = get();
    const activeVariant = state.activeVariant;
    const variant = state.variants[activeVariant];
    
    if (!variant) {
      console.error(`[goToMove] Varyant bulunamadı: ${activeVariant}`);
      return { success: false, error: 'Varyant bulunamadı' };
    }
    
    // Index -1 için özel işlem
    if (index === -1) {
      const startFen = get().getVariantStartingFen(activeVariant);
      set({
        currentFen: startFen,
        moveIndex: -1,
        chess: createChessInstance(startFen)
      });
      return { success: true };
    }
    
    if (index < -1 || index >= variant.moves.length) {
      console.log(`[goToMove] Geçersiz indeks: ${index}, moves: ${variant?.moves?.length}`);
      return { success: false, error: 'Geçersiz indeks' };
    }
    
    // Aktif varyantın başlangıç FEN'ini al
    const startFen = get().getVariantStartingFen(activeVariant);
    const chess = createChessInstance(startFen);
    let newFen = startFen;
    
    console.log(`[goToMove] Starting from FEN: ${startFen}, target index: ${index}`);
    
    // Hedef indekse kadar hamleleri replay et
    if (index >= 0) {
      for (let i = 0; i <= index; i++) {
        const move = variant.moves[i];
        const result = chess.move({ 
          from: move.from, 
          to: move.to, 
          promotion: move.promotion 
        });
        
        if (!result) {
          console.error(`[goToMove] Hamle yapılamadı, indeks ${i}:`, move);
          return state;
        }
      }
      newFen = chess.fen();
    }
    
    set({
      currentFen: newFen,
      moveIndex: index,
      chess: createChessInstance(newFen)
    });
    
    console.log(`[goToMove] Moved to index ${index}, new FEN: ${newFen}`);
    return { success: true };
  },

  // Getter'lar
  moveHistory: () => {
    const state = get();
    return state.variants[state.activeVariant]?.moves || [];
  },

  currentMoveIndex: () => {
    return get().moveIndex;
  },

  getCurrentLine: () => {
    return get().activeVariant;
  },

  getVariants: () => {
    const state = get();
    return Object.entries(state.variants).map(([name, v]) => ({
      name,
      label: v.label,
      isActive: name === state.activeVariant,
      isMain: name === 'main',
      parentVariant: v.parentVariant,
      parentMoveIndex: v.parentMoveIndex
    }));
  },

  getMoves: (variantName) => {
    const state = get();
    const variant = variantName || state.activeVariant;
    return state.variants[variant]?.moves || [];
  },

  getMoveIndex: () => {
    return get().moveIndex;
  },

  // Diğer action'lar
  setCurrentFen: (fen) => set({
    currentFen: fen,
    chess: createChessInstance(fen)
  }),

  setPositionAsPuzzleStart: () => set(state => {
    const fen = state.currentFen;
    console.log(`[setPositionAsPuzzleStart] Setting puzzle FEN: ${fen}`);
    return {
      ...state,
      puzzleInitialFen: fen, // Puzzle başlangıç FEN'ini sakla
      initialFen: state.initialFen, // Standart FEN'i koru
      puzzleMetadata: {
        ...state.puzzleMetadata,
        fen: fen
      },
      variants: {
        main: {
          label: 'Ana Hat',
          moves: [],
          parentMoveIndex: -1,
          parentVariant: null
        }
      },
      activeVariant: 'main',
      moveIndex: -1,
      currentFen: fen, // Mevcut FEN'i koru
      statusMessage: 'Başlangıç pozisyonu kaydedildi'
    };
  }),

  updatePuzzleMetadata: (updates) => set(state => ({
    puzzleMetadata: {
      ...state.puzzleMetadata,
      ...updates
    }
  })),

  updatePuzzleSetData: (updates) => set(state => ({
    puzzleSetData: {
      ...state.puzzleSetData,
      ...updates
    }
  })),

  createAndAddPuzzle: () => {
    const state = get();
    
    // Tüm varyantları JSON formatına uygun şekilde dönüştür
    const mainLine = state.variants.main.moves.map(move => ({
      move: move.san || `${move.from}${move.to}`,
      fen: move.fen,
      isLast: move.isLast || false
    }));
    
    const alternatives = Object.entries(state.variants)
      .filter(([name]) => name !== 'main')
      .map(([name, variant]) => ({
        name: name,
        moves: variant.moves.map(move => ({
          move: move.san || `${move.from}${move.to}`,
          fen: move.fen,
          isLast: move.isLast || false
        }))
      }));
    
    const puzzleData = {
      ...state.puzzleMetadata,
      fen: state.initialFen, // Puzzle başlangıç FEN'i
      mainLine,
      alternatives
    };
    
    // Puzzle'ı set'e ekle
    const updatedPuzzleSet = {
      ...state.puzzleSetData,
      puzzles: [...state.puzzleSetData.puzzles, puzzleData]
    };
    
    // State'i güncelle
    set({
      puzzleSetData: updatedPuzzleSet,
      // Yeni puzzle için resetle
      puzzleMetadata: {
        id: '',
        index: state.puzzleMetadata.index + 1,
        title: '',
        fen: ''
      },
      variants: {
        main: {
          label: 'Ana Hat',
          moves: [],
          parentMoveIndex: -1,
          parentVariant: null
        }
      },
      activeVariant: 'main',
      moveIndex: -1,
      currentFen: state.initialFen, // Başlangıç FEN'ine dön
      statusMessage: 'Puzzle kaydedildi!'
    });
    
    return { success: true, message: 'Puzzle başarıyla kaydedildi' };
  },

  exportPuzzleSetAsJson: () => {
    const state = get();
    console.log("Export işlemi başlıyor, puzzle set data:", state.puzzleSetData);
    
    try {
      const jsonData = JSON.stringify(state.puzzleSetData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${state.puzzleSetData.id || 'puzzle-set'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log("JSON başarıyla indirildi");
      return { success: true };
    } catch (error) {
      console.error("JSON export hatası:", error);
      return { success: false, error: error.message };
    }
  },

  addVariant: (variantName, parentVariant, parentMoveIndex) => set(state => {
    console.log("Yeni varyant ekleniyor:", { variantName, parentVariant, parentMoveIndex });
    
    const newVariant = {
      label: variantName,
      moves: [],
      parentMoveIndex: parentMoveIndex,
      parentVariant: parentVariant
    };
    
    // Mevcut pozisyonda varyant oluşturuluyorsa
    const currentFen = state.currentFen;
    const currentIndex = state.moveIndex;
    
    console.log(`[addVariant] Creating variant from position: FEN=${currentFen}, index=${currentIndex}`);
    
    // Aktif varyanta göre yeni varyantın index'ini ayarla
    return {
      ...state,
      variants: {
        ...state.variants,
        [variantName]: newVariant
      },
      activeVariant: variantName,
      moveIndex: -1, // Yeni varyant -1'den başlar
      currentFen: currentFen // Mevcut pozisyonu koru
    };
  }),

  setActiveVariant: (variantName) => set(state => {
    const { getVariantStartingFen } = get();
    const variant = state.variants[variantName];
    
    if (!variant) {
      console.error('[setActiveVariant] Varyant bulunamadı:', variantName);
      return state;
    }
    
    // Varyantın doğru başlangıç FEN'ini al
    const startFen = getVariantStartingFen(variantName);
    
    // Her zaman varyantın başlangıcına git (index: -1)
    const targetFen = startFen;
    const targetIndex = -1;
    
    console.log('[setActiveVariant]', {
      variantName,
      startFen,
      targetFen,
      targetIndex
    });
    
    return {
      ...state,
      activeVariant: variantName,
      currentFen: targetFen,
      moveIndex: targetIndex,
      chess: createChessInstance(targetFen)
    };
  })
}));

export default useBoardEditorStore;