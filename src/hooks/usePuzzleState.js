// src/hooks/usePuzzleState.js - VARIANT TRACKING EKLENMİŞ VERSİYON
import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';

// 1. Computer move delay'i ayarlanabilir yap
const DEFAULT_COMPUTER_MOVE_DELAY = process.env.NODE_ENV === 'development' ? 300 : 800; // Debug'da hızlı

// 2. Console.log'ları production'da kapat
const debugLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

const usePuzzleState = (puzzleSet) => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [boardPosition, setBoardPosition] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [lastMoveResult, setLastMoveResult] = useState(null); // 'correct', 'incorrect', 'illegal', 'error'
  const [moveHistory, setMoveHistory] = useState([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false); // Bilgisayar hamlesi sırasında true
  const [isWaitingForUser, setIsWaitingForUser] = useState(true);
  
  const [currentPath, setCurrentPath] = useState('main');
  const [variantMoveIndex, setVariantMoveIndex] = useState(0);
  const [expectedMovesList, setExpectedMovesList] = useState([]);

  // 3. Fast mode toggle
  const [fastMode, setFastMode] = useState(false);
  const [computerMoveDelay, setComputerMoveDelay] = useState(DEFAULT_COMPUTER_MOVE_DELAY);

  useEffect(() => {
    setComputerMoveDelay(fastMode ? 100 : DEFAULT_COMPUTER_MOVE_DELAY);
  }, [fastMode]);

  const game = useRef(new Chess()).current;
  const autoPlayTimeoutRef = useRef(null);

  // Ref for latest values
  const stateRef = useRef({
    currentMoveIndex,
    currentPuzzle: puzzleSet?.puzzles?.[currentPuzzleIndex], // Initialize with currentPuzzle
    currentPath,
    variantMoveIndex,
    isAutoPlaying,
    isWaitingForUser,
    isComplete,
    // fastMode da eklenebilir eğer callback'ler içinde doğrudan erişim gerekiyorsa
  });

  const currentPuzzle = puzzleSet?.puzzles?.[currentPuzzleIndex];
  const totalPuzzles = puzzleSet?.puzzles?.length || 0;

  // Update ref
  useEffect(() => {
    stateRef.current = {
      currentMoveIndex,
      currentPuzzle,
      currentPath,
      variantMoveIndex,
      isAutoPlaying,
      isWaitingForUser,
      isComplete,
    };
  }, [currentMoveIndex, currentPuzzle, currentPath, variantMoveIndex, isAutoPlaying, isWaitingForUser, isComplete]);

  const clearAutoPlayTimeout = useCallback(() => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
  }, []);

  const getMoveLineAndIndex = useCallback(() => {
    const {
      currentPath: path,
      currentMoveIndex: mainIdx,
      variantMoveIndex: varIdx,
      currentPuzzle: puzzle,
    } = stateRef.current;

    if (!puzzle) return { moveLine: null, moveIndexToPlay: -1 };

    let moveLine = null;
    let moveIndexToPlay = -1;

    if (path === 'main') {
      moveLine = puzzle.mainLine;
      moveIndexToPlay = mainIdx;
    } else {
      const variant = puzzle.alternatives?.find(alt => alt.name === path);
      if (variant) {
        moveLine = variant.moves;
        moveIndexToPlay = varIdx;
      }
    }
    return { moveLine, moveIndexToPlay };
  }, []); // stateRef.current'a dayandığı için bağımlılıkları boş olabilir veya stateRef'in kendisine olabilir.

  // Helper function to parse SAN notation - TANIMI BURAYA TAŞIYIN
  const parseSANtoMoveObject = useCallback((san, gameInstance) => {
    try {
      const moves = gameInstance.moves({ verbose: true });
      return moves.find(move => move.san === san) || null;
    } catch (error) {
      console.error('Error parsing SAN:', error);
      return null;
    }
  }, []); // Bağımlılık dizisi boş kalabilir, çünkü dışarıdan bir şey kullanmıyor.

  const getExpectedMoves = useCallback(() => {
    const { currentPath: path, currentMoveIndex: mainIndex, variantMoveIndex: varIndex, currentPuzzle: puzzle } = stateRef.current;
    // YENİ DEBUG: Destructuring sonrası varIndex'i kontrol et
    debugLog('[getExpectedMoves] After destructuring stateRef - path:', path, 'mainIndex:', mainIndex, 'varIndex:', varIndex, 'puzzle exists:', !!puzzle);

    if (!puzzle) {
      console.warn('getExpectedMoves called with no puzzle in stateRef');
      return [];
    }
    
    const moves = [];
    let currentIndexForLog; 

    if (path === 'main') {
      currentIndexForLog = mainIndex; 
      // Ana hattaki bir sonraki beklenen hamle
      if (puzzle.mainLine && mainIndex < puzzle.mainLine.length) {
        const mainMove = puzzle.mainLine[mainIndex];
        if (mainMove && mainMove.move) {
          moves.push({
            move: mainMove.move,
            type: 'main',
            isLast: mainMove.isLast
          });
        } else {
          console.warn('Main move or mainMove.move is undefined at index:', mainIndex, puzzle.mainLine);
        }
      } else if (puzzle.mainLine) {
         debugLog('No more moves in mainLine or mainIndex out of bounds. mainIndex:', mainIndex, 'mainLine length:', puzzle.mainLine.length);
      }

      // Bu ana hamle için alternatif başlangıç hamleleri
      // mainIndex burada bir sonraki hamlenin indeksi olduğu için, parentMoveIndex'in mainIndex - 1 olması gerekir
      // Eğer kullanıcı bir hamle yaptıysa ve sıra bilgisayardaysa, mainIndex bir sonraki bilgisayar hamlesini gösterir.
      // Eğer sıra kullanıcıdaysa, mainIndex kullanıcının yapacağı hamleyi gösterir.
      // Alternatifler, kullanıcının yapabileceği hamleler olduğu için, o anki mainIndex'e göre (eğer sıra kullanıcıdaysa)
      // veya bir önceki hamlenin indeksine göre (eğer sıra bilgisayardaysa ve kullanıcı bir önceki hamleyi yaptıysa) belirlenmeli.
      // Şu anki mantıkta getExpectedMoves, kullanıcının yapabileceği hamleleri döndürüyor.
      // Bu durumda, parentMoveIndex, bir önceki hamlenin indeksi olmalı.
      // Eğer mainIndex = 0 (ilk hamle) ise, parentMoveIndex = -1 (bu durumda alternatif olmaz)
      // Eğer mainIndex = 1 (ikinci hamle) ise, parentMoveIndex = 0 (ilk hamleden sonraki alternatifler)
      // Bu nedenle, `alt.parentMoveIndex === mainIndex` mantığı, eğer mainIndex bir sonraki *yapılacak* hamleyi gösteriyorsa
      // ve alternatifler bu yapılacak hamle yerine geçiyorsa doğru olabilir.
      // Ancak, JSON yapınızda parentMoveIndex'in tam olarak neyi ifade ettiğini (0-tabanlı önceki hamlenin indeksi mi, yoksa başka bir şey mi)
      // netleştirmek önemli. Genellikle bir önceki hamlenin indeksi olur.
      // Şimdilik mevcut `alt.parentMoveIndex === mainIndex` mantığını koruyorum, ancak bu JSON yapınıza göre gözden geçirilmeli.
      puzzle.alternatives?.forEach(alt => {
        if (alt.parentMoveIndex === mainIndex && alt.moves && alt.moves.length > 0 && alt.moves[0].move) {
          moves.push({
            move: alt.moves[0].move,
            type: 'variant',
            variantName: alt.name,
            isLast: alt.moves[0].isLast
          });
        }
      });
    } else { // Varyant yolundayız
      // DÜZELTİLMİŞ SATIRLAR: varIdx -> varIndex
      debugLog('[getExpectedMoves] In variant path. varIndex from destructuring:', varIndex, 'Path:', path); 
      currentIndexForLog = varIndex; 
      const variant = puzzle.alternatives?.find(alt => alt.name === path);
      if (variant && variant.moves && varIndex < variant.moves.length) { // varIndex burada doğru kullanılmış
        const variantMove = variant.moves[varIndex]; // varIndex burada doğru kullanılmış
        if (variantMove && variantMove.move) {
          moves.push({
            move: variantMove.move,
            type: 'variant-continuation',
            isLast: variantMove.isLast
          });
        } else {
          console.warn('Variant move or variantMove.move is undefined at index:', varIndex, variant.moves); // varIndex burada doğru kullanılmış
        }
      } else if (variant && variant.moves) {
        debugLog('No more moves in variant path or varIndex out of bounds. varIndex:', varIndex, 'variant moves length:', variant.moves.length); // varIndex burada doğru kullanılmış
      } else if (!variant) {
        debugLog('[getExpectedMoves] Variant not found for path:', path);
      }
    }
    
    if (typeof currentIndexForLog === 'undefined') {
        const currentVarIdx = stateRef.current.variantMoveIndex; 
        debugLog('[getExpectedMoves] ERROR: currentIndexForLog is undefined. Path:', path, 'mainIndex:', mainIndex, 'currentVarIdx from stateRef (direct):', currentVarIdx);
    }
    const finalLogPath = stateRef.current.currentPath;
    const finalLogIndex = finalLogPath === 'main' ? stateRef.current.currentMoveIndex : stateRef.current.variantMoveIndex;

    debugLog('🎯 getExpectedMoves (Path:', finalLogPath, 'Index:', finalLogIndex, '):', moves.map(m => `${m.move} (${m.type}, last: ${m.isLast})`));
    
    return moves;
  }, [game]);

  useEffect(() => {
    if (stateRef.current.currentPuzzle) {
      setExpectedMovesList(getExpectedMoves());
    } else {
      setExpectedMovesList([]); // Puzzle yoksa boşalt
    }
  }, [currentMoveIndex, currentPath, variantMoveIndex, currentPuzzle, getExpectedMoves]);


  const playComputerMove = useCallback(() => {
    // stateRef'ten en güncel değerleri al
    const { currentMoveIndex: mainIndex, variantMoveIndex: varIndex, currentPath: path, currentPuzzle: puzzle, isAutoPlaying: autoPlayingStatus } = stateRef.current;
    
    if (!puzzle || autoPlayingStatus) { 
        debugLog('🚫 Computer move cancelled - already playing or no puzzle. Status:', { autoPlayingStatus, puzzleExists: !!puzzle });
        return;
    }
    
    const { moveLine, moveIndexToPlay } = getMoveLineAndIndex();
    if (!moveLine || moveIndexToPlay >= moveLine.length) {
        debugLog('🚫 No more moves in current path for computer. Path:', path, 'Index:', moveIndexToPlay, 'Line Length:', moveLine?.length);
        setIsWaitingForUser(true); 
        return;
    }
    
    const nextMove = moveLine[moveIndexToPlay];
    if (!nextMove || !nextMove.move) { 
        debugLog('🚫 Invalid nextMove object for computer.', nextMove);
        setIsWaitingForUser(true); 
        return;
    }

    setIsAutoPlaying(true); 

    debugLog('🤖 Computer will play:', nextMove.move, `(${stateRef.current.currentPath} path, index ${moveIndexToPlay})`);

    autoPlayTimeoutRef.current = setTimeout(() => {
      try {
        let moveResult = null; 
        
        try {
          moveResult = game.move(nextMove.move);
        } catch (e) {
          debugLog('Computer move with SAN failed, trying parseSANtoMoveObject. Error:', e);
          // ŞİMDİ parseSANtoMoveObject GÜVENLE ÇAĞRILABİLİR
          const parsed = parseSANtoMoveObject(nextMove.move, game); 
          if (parsed) {
            debugLog('Parsed SAN to object:', parsed);
            moveResult = game.move(parsed);
          } else if (nextMove.fen) {
            debugLog('Falling back to FEN load for computer move:', nextMove.fen);
            game.load(nextMove.fen); 
            setBoardPosition(game.fen()); 
            moveResult = { san: nextMove.move, fen: nextMove.fen }; 
          } else {
            debugLog('Computer move failed completely for:', nextMove.move);
          }
        }

        if (moveResult && moveResult.san) { // moveResult ve moveResult.san varlığını kontrol et
          debugLog('🤖 Computer played:', moveResult.san, `on ${stateRef.current.currentPath} path`);
          
          // FEN fallback durumunda setBoardPosition zaten timeout içinde yapıldı,
          // diğer durumlarda (başarılı game.move) setBoardPosition burada yapılmalı.
          if (!nextMove.fen || (nextMove.fen && moveResult.fen !== nextMove.fen)) { // Eğer FEN fallback değilse veya FEN fallback ama moveResult'ta FEN yoksa
            setBoardPosition(game.fen());
          }
          setMoveHistory(prev => [...prev, moveResult.san]);
          
          if (path === 'main') {
            setCurrentMoveIndex(mainIndex + 1);
          } else {
            setVariantMoveIndex(varIndex + 1);
          }
          
          if (nextMove.isLast) {
            setIsComplete(true);
            debugLog('🎉 Puzzle complete by computer!');
          } else {
            setIsWaitingForUser(true);
          }
        } else {
          debugLog('Computer move resulted in null or no SAN. Move attempted:', nextMove.move, 'Result:', moveResult);
          setIsWaitingForUser(true);
        }
      } catch (error) {
        console.error('Computer move execution error:', error);
        setIsWaitingForUser(true); 
      } finally {
        setIsAutoPlaying(false);
        autoPlayTimeoutRef.current = null; 
      }
    }, computerMoveDelay); 
  }, [game, getMoveLineAndIndex, computerMoveDelay, parseSANtoMoveObject]); // parseSANtoMoveObject şimdi bağımlılık olarak doğru çalışacak

  const initializePuzzle = useCallback(() => {
    if (!currentPuzzle) return;

    clearAutoPlayTimeout(); // Önceki timeout'ları temizle

    try {
      game.load(currentPuzzle.fen);
      setBoardPosition(game.fen());
      setCurrentMoveIndex(0);
      setVariantMoveIndex(0);
      setCurrentPath('main');
      setIsComplete(false);
      setMoveHistory([]);
      setLastMoveResult(null);
      setIsAutoPlaying(false); // Başlangıçta autoPlaying false olmalı
      
      debugLog('🎯 Puzzle initialized:', currentPuzzle.id);
      
      // HER ZAMAN İLK HAMLE KULLANICIDA OLACAK ŞEKİLDE AYARLA
      setIsWaitingForUser(true);
      debugLog('🎮 First move: USER (regardless of FEN turn)');
      
      // Bilgisayarın otomatik ilk hamle yapmasını sağlayan kısım kaldırıldı.
      // const firstMoveTurn = game.turn();
      // setIsWaitingForUser(firstMoveTurn === 'b');
      
      // if (firstMoveTurn === 'w') {
      //   // autoPlayTimeoutRef kullanarak timeout'u yönet
      //   autoPlayTimeoutRef.current = setTimeout(() => playComputerMove(), 500);
      // }
    } catch (error) {
      console.error('Puzzle initialization error:', error);
    }
  }, [currentPuzzle, game, clearAutoPlayTimeout, getExpectedMoves]); // getExpectedMoves eklendi (useEffect içinde kullanılıyor)

  const makeMove = useCallback((moveData) => {
    const {
      isAutoPlaying: autoPlaying,
      isWaitingForUser: waitingUser,
      isComplete: puzzleCompleted,
      currentPuzzle: puzzle,
      currentMoveIndex: refCurrentMoveIndex, // stateRef'ten güncel index'leri al
      variantMoveIndex: refVariantMoveIndex, // stateRef'ten güncel index'leri al
      currentPath: refCurrentPath // stateRef'ten güncel path'i al
    } = stateRef.current;

    debugLog('[makeMove] State check at entry:', { autoPlaying, waitingUser, puzzleCompleted });

    if (autoPlaying || !waitingUser || puzzleCompleted) {
      console.log('[makeMove] Rejected by initial state check. Conditions: autoPlayingStatus:', autoPlaying, '!waitingStatus:', !waitingUser, 'completeStatus:', puzzleCompleted);
      return false;
    }

    try {
      const testGame = new Chess(game.fen());
      const testMove = testGame.move({
        from: moveData.from,
        to: moveData.to,
        promotion: moveData.promotion || 'q'
      });

      if (!testMove) {
        console.log('[makeMove] Rejected because testMove is null (illegal move).');
        setLastMoveResult('illegal');
        return false;
      }

      const expected = getExpectedMoves();

      debugLog('--- makeMove DEBUG ---');
      debugLog('User SAN:', testMove.san);
      debugLog('Expected SANs:', expected.map(e => e.move));

      const matchedMove = expected.find(em => em.move === testMove.san);

      if (matchedMove) {
        const actualMove = game.move({
          from: moveData.from,
          to: moveData.to,
          promotion: moveData.promotion || 'q'
        });

        debugLog(`✅ User played: ${actualMove.san} (${matchedMove.type})`);
        setBoardPosition(game.fen());
        setMoveHistory(prev => [...prev, actualMove.san]);
        setLastMoveResult('correct');
        
        if (matchedMove.type === 'variant' && matchedMove.variantName) {
          debugLog(`🔀 Switching to variant: ${matchedMove.variantName}`);
          setCurrentPath(matchedMove.variantName);
          setVariantMoveIndex(1); 
        } else { // Ana hat veya varyant devamı
          if (refCurrentPath === 'main') { // stateRef'ten alınan güncel path'i kullan
            setCurrentMoveIndex(refCurrentMoveIndex + 1);
          } else { // Varyant devamı
            setVariantMoveIndex(refVariantMoveIndex + 1);
          }
        }
        
        setIsWaitingForUser(false);
        if (matchedMove.isLast) {
          setIsComplete(true);
          debugLog('🎉 Puzzle complete!');
        } else {
          // playComputerMove çağrısını computerMoveDelay ile yap
          autoPlayTimeoutRef.current = setTimeout(() => playComputerMove(), computerMoveDelay);
        }
        
        return true;
      } else {
        debugLog(`❌ Wrong move: ${testMove.san}`);
        debugLog('Expected:', expected.map(e => e.move));
        setLastMoveResult('incorrect');
        return false;
      }
    } catch (error) {
      console.error('Move error:', error);
      setLastMoveResult('error');
      return false;
    }
  }, [game, playComputerMove, getExpectedMoves, computerMoveDelay]); // computerMoveDelay bağımlılığa eklendi

  // Navigation functions
  const resetPuzzle = useCallback(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  // Initialize on mount
  useEffect(() => {
    if (currentPuzzle) {
      initializePuzzle();
    }
  }, [currentPuzzleIndex, initializePuzzle]);

  // Toggle fast mode
  const toggleFastMode = useCallback(() => {
    setFastMode(prev => !prev);
  }, []);

  return {
    // States
    currentPuzzle,
    currentPuzzleIndex,
    currentMoveIndex,
    totalPuzzles,
    boardPosition,
    isComplete, // <<--- BU SATIRIN OLDUĞUNDAN EMİN OLUN
    lastMoveResult,
    moveHistory,
    expectedMoves: expectedMovesList,
    isAutoPlaying,
    isWaitingForUser,
    currentPath,
    variantMoveIndex,
    fastMode,
    // Methods
    makeMove,
    nextPuzzle: () => setCurrentPuzzleIndex(p => Math.min(p + 1, totalPuzzles - 1)),
    previousPuzzle: () => setCurrentPuzzleIndex(p => Math.max(p - 1, 0)),
    resetPuzzle,
    toggleFastMode,
    getMoveLineAndIndex,
    getExpectedMoves,
  };
};

export default usePuzzleState;