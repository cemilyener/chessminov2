// src/hooks/usePuzzleState.js - VARIANT TRACKING EKLENMİŞ VERSİYON
import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { parseSANtoMoveObject } from '../utils/chess/SANParser';

const usePuzzleState = (puzzleSet) => {
  // Mevcut state'ler...
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [game] = useState(() => new Chess());
  const [boardPosition, setBoardPosition] = useState('start');
  const [isComplete, setIsComplete] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMoveResult, setLastMoveResult] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isWaitingForUser, setIsWaitingForUser] = useState(true);
  
  // ⭐ YENİ: Variant tracking states
  const [currentPath, setCurrentPath] = useState('main'); // 'main' veya 'variant_a'
  const [variantMoveIndex, setVariantMoveIndex] = useState(0);

  // ⭐ YENİ: Beklenen hamleleri state olarak tut
  const [expectedMovesList, setExpectedMovesList] = useState([]);
  
  // Ref for latest values
  const stateRef = useRef({
    currentMoveIndex: 0,
    currentPuzzle: null,
    currentPath: 'main',
    variantMoveIndex: 0,
    isAutoPlaying: false,
    isWaitingForUser: true, // Varsayılan olarak true, initializePuzzle güncelleyecek
    isComplete: false
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
      isWaitingForUser, // EKLENDİ
      isComplete      // EKLENDİ
    };
  }, [currentMoveIndex, currentPuzzle, currentPath, variantMoveIndex, isAutoPlaying, isWaitingForUser, isComplete]); // EKLENEN BAĞIMLILIKLAR

  // Timeout management
  const autoPlayTimeoutRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, []);
  
  // Clear auto-play timeout
  const clearAutoPlayTimeout = useCallback(() => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
  }, []);

  // ⭐ YENİ: Get current move line (main or variant)
  const getCurrentMoveLine = useCallback(() => {
    const { currentPath: path, currentPuzzle: puzzle } = stateRef.current;
    
    if (path === 'main') {
      return puzzle?.mainLine || [];
    } else {
      const variant = puzzle?.alternatives?.find(alt => alt.name === path);
      return variant?.moves || [];
    }
  }, []); // stateRef.current okumaları için bağımlılık gerekmez

  // ⭐ YENİ: Get current move index based on path
  const getCurrentMoveIndex = useCallback(() => {
    const { currentPath: path, currentMoveIndex: mainIndex, variantMoveIndex: varIndex } = stateRef.current;
    return path === 'main' ? mainIndex : varIndex;
  }, []); // stateRef.current okumaları için bağımlılık gerekmez

  // ⭐ UPDATED: Get expected moves with variant support
  // useCallback sarmalayıcısı kaldırıldı, böylece her zaman en güncel state'lere erişir.
  const getExpectedMoves = () => { 
    const { currentPath: path, currentMoveIndex: mainIndex, variantMoveIndex: varIndex, currentPuzzle: puzzle } = stateRef.current;
    
    if (!puzzle) {
      console.warn('getExpectedMoves called with no puzzle in stateRef');
      return [];
    }
    
    const moves = [];
    
    if (path === 'main') {
      // Ana hattaki bir sonraki beklenen hamle
      if (puzzle.mainLine && mainIndex < puzzle.mainLine.length) { // mainIndex kontrolü eklendi
        const mainMove = puzzle.mainLine[mainIndex];
        if (mainMove && mainMove.move) { // mainMove ve mainMove.move var mı kontrol et
          moves.push({
            move: mainMove.move,
            type: 'main',
            isLast: mainMove.isLast
          });
        } else {
          console.warn('Main move or mainMove.move is undefined at index:', mainIndex, puzzle.mainLine);
        }
      } else if (puzzle.mainLine) {
         console.log('No more moves in mainLine or mainIndex out of bounds. mainIndex:', mainIndex, 'mainLine length:', puzzle.mainLine.length);
      }

      // Bu ana hamle için alternatif başlangıç hamleleri
      puzzle.alternatives?.forEach(alt => {
        if (alt.parentMoveIndex === mainIndex && alt.moves && alt.moves.length > 0 && alt.moves[0].move) { // alt.moves ve alt.moves[0].move kontrolü
          moves.push({
            move: alt.moves[0].move,
            type: 'variant',
            variantName: alt.name,
            // variant: alt // Tüm variant objesini taşımak yerine sadece gerekli bilgileri taşıyabiliriz
            isLast: alt.moves[0].isLast // Varyantın ilk hamlesinin isLast durumu
          });
        }
      });
    } else { // Varyant yolundayız
      const variant = puzzle.alternatives?.find(alt => alt.name === path);
      if (variant && variant.moves && varIndex < variant.moves.length) { // varIndex kontrolü eklendi
        const variantMove = variant.moves[varIndex];
        if (variantMove && variantMove.move) { // variantMove ve variantMove.move var mı kontrol et
          moves.push({
            move: variantMove.move,
            type: 'variant-continuation',
            isLast: variantMove.isLast
          });
        } else {
          console.warn('Variant move or variantMove.move is undefined at index:', varIndex, variant.moves);
        }
      } else if (variant && variant.moves) {
        console.log('No more moves in variant path or varIndex out of bounds. varIndex:', varIndex, 'variant moves length:', variant.moves.length);
      }
    }
    
    // Loglamayı fonksiyonun içine taşıdım ve daha detaylı hale getirdim
    console.log(`🎯 getExpectedMoves (Path: ${path}, Index: ${path === 'main' ? mainIndex : varIndex}):`, moves.map(m => `${m.move} (${m.type}, last: ${m.isLast})`));
    
    return moves;
  };

  // ⭐ YENİ: Beklenen hamleleri güncellemek için useEffect
  useEffect(() => {
    if (stateRef.current.currentPuzzle) { // Sadece puzzle varsa güncelle
      setExpectedMovesList(getExpectedMoves());
    }
  }, [currentMoveIndex, currentPath, variantMoveIndex, currentPuzzle]); // currentPuzzle da eklendi, getExpectedMoves onu kullanıyor

  // ⭐ UPDATED: Computer move with variant support (ÖNCE TANIMLA)
  const playComputerMove = useCallback(() => {
    // stateRef'ten en güncel değerleri al
    const { currentMoveIndex: mainIndex, variantMoveIndex: varIndex, currentPath: path, currentPuzzle: puzzle, isAutoPlaying: autoPlayingStatus } = stateRef.current;
    
    if (!puzzle || autoPlayingStatus) { // ref'teki isAutoPlaying'i kontrol et
        console.log('🚫 Computer move cancelled - already playing or no puzzle');
        return;
    }
    
    const moveLine = path === 'main' ? puzzle.mainLine : puzzle.alternatives?.find(alt => alt.name === path)?.moves;
    const moveIndexToPlay = path === 'main' ? mainIndex : varIndex; // Değişken adını değiştirdim karışıklığı önlemek için
    
    if (!moveLine || moveIndexToPlay >= moveLine.length) {
        console.log('🚫 No more moves in current path');
        return;
    }
    
    const nextMove = moveLine[moveIndexToPlay];
    if (!nextMove) return;

    setIsAutoPlaying(true); // Bu, bir sonraki render'da hook'un yeniden çalışmasını tetikleyebilir
    // stateRef.current.isAutoPlaying = true; // useEffect içinde zaten güncelleniyor

    console.log(`🤖 Computer will play: ${nextMove.move} (${path} path, index ${moveIndexToPlay})`);

    autoPlayTimeoutRef.current = setTimeout(() => {
      try {
        let moveResult = null; // 'move' yerine 'moveResult' kullandım, chess.js'den dönen obje için
        
        try {
          moveResult = game.move(nextMove.move);
        } catch (e) {
          const parsed = parseSANtoMoveObject(nextMove.move, game);
          if (parsed) {
            moveResult = game.move(parsed);
          } else if (nextMove.fen) {
            game.load(nextMove.fen); // FEN yüklemesi sonrası tahta güncellenir
            setBoardPosition(game.fen()); // FEN yüklendikten sonra boardPosition'ı hemen güncelle
            moveResult = { san: nextMove.move }; // chess.js move objesine benzer bir yapı
          }
        }

        if (moveResult) {
          console.log(`🤖 Computer played: ${moveResult.san} on ${path} path`);
          // FEN fallback durumunda setBoardPosition zaten yapıldı
          if (!nextMove.fen) { 
            setBoardPosition(game.fen());
          }
          setMoveHistory(prev => [...prev, moveResult.san]);
          
          // Index'leri stateRef'ten alınan güncel değerlere göre artır
          if (path === 'main') {
            setCurrentMoveIndex(mainIndex + 1);
          } else {
            setVariantMoveIndex(varIndex + 1);
          }
          
          if (nextMove.isLast) {
            setIsComplete(true);
            console.log('🎉 Puzzle complete!');
          } else {
            setIsWaitingForUser(true);
          }
        }
      } catch (error) {
        console.error('Computer move error:', error);
      } finally {
        setIsAutoPlaying(false);
        // stateRef.current.isAutoPlaying = false; // useEffect içinde zaten güncelleniyor
        autoPlayTimeoutRef.current = null; // Timeout referansını temizle
      }
    }, 800);
  }, [game, parseSANtoMoveObject]); // isAutoPlaying'i bağımlılıktan çıkardık, ref kullanıyoruz

  // Initialize puzzle (playComputerMove'dan SONRA TANIMLA)
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
      
      console.log('🎯 Puzzle initialized:', currentPuzzle.id);
      
      // HER ZAMAN İLK HAMLE KULLANICIDA OLACAK ŞEKİLDE AYARLA
      setIsWaitingForUser(true);
      console.log('🎮 First move: USER (regardless of FEN turn)');
      
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
  }, [currentPuzzle, game, clearAutoPlayTimeout]); // playComputerMove bağımlılıktan çıkarıldı, çünkü artık başlangıçta çağrılmıyor.

  // ⭐ UPDATED: User move with variant switching
  const makeMove = useCallback((moveData) => {
    // stateRef'ten en güncel değerleri al
    const { isAutoPlaying: autoPlayingStatus, isWaitingForUser: waitingStatus, isComplete: completeStatus, currentMoveIndex: refCurrentMoveIndex, variantMoveIndex: refVariantMoveIndex, currentPath: refCurrentPath } = stateRef.current;

    // HATA AYIKLAMA LOGLARI BAŞLANGICI
    console.log('[makeMove] State check at entry: autoPlaying:', autoPlayingStatus, 'waitingForUser:', waitingStatus, 'isComplete:', completeStatus);
    // HATA AYIKLAMA LOGLARI SONU

    if (autoPlayingStatus || !waitingStatus || completeStatus) {
      console.log('[makeMove] Rejected by initial state check. Conditions: autoPlayingStatus:', autoPlayingStatus, '!waitingStatus:', !waitingStatus, 'completeStatus:', completeStatus);
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

      // DEBUG LOGS BAŞLANGICI (Zaten vardı, kontrol için bırakıldı)
      console.log('--- makeMove DEBUG ---');
      console.log('User SAN:', testMove.san);
      console.log('Expected SANs:', expected.map(e => e.move));
      // console.log('Full expected objects:', JSON.stringify(expected, null, 2)); // Çok uzun olabilir, gerekirse açın
      // DEBUG LOGS SONU

      const matchedMove = expected.find(em => em.move === testMove.san);

      if (matchedMove) {
        const actualMove = game.move({
          from: moveData.from,
          to: moveData.to,
          promotion: moveData.promotion || 'q'
        });

        console.log(`✅ User played: ${actualMove.san} (${matchedMove.type})`);
        setBoardPosition(game.fen());
        setMoveHistory(prev => [...prev, actualMove.san]);
        setLastMoveResult('correct');
        
        if (matchedMove.type === 'variant' && matchedMove.variantName) {
          console.log(`🔀 Switching to variant: ${matchedMove.variantName}`);
          setCurrentPath(matchedMove.variantName);
          setVariantMoveIndex(1); 
        } else if (refCurrentPath === 'main') {
          setCurrentMoveIndex(refCurrentMoveIndex + 1);
        } else {
          setVariantMoveIndex(refVariantMoveIndex + 1);
        }
        
        setIsWaitingForUser(false);

        if (matchedMove.isLast) {
          setIsComplete(true);
          console.log('🎉 Puzzle complete!');
        } else {
          autoPlayTimeoutRef.current = setTimeout(() => playComputerMove(), 1000);
        }
        
        return true;
      } else {
        console.log('❌ Wrong move:', testMove.san);
        console.log('Expected:', expected.map(e => e.move));
        setLastMoveResult('incorrect');
        return false;
      }
    } catch (error) {
      console.error('Move error:', error);
      setLastMoveResult('error'); // Hata durumunda lastMoveResult'ı ayarla
      return false;
    }
  }, [game, getExpectedMoves, playComputerMove]); // state'ler yerine ref ve fonksiyonlar bağımlılıkta

  // Navigation functions...
  const resetPuzzle = useCallback(() => {
    initializePuzzle();
  }, [initializePuzzle]); // initializePuzzle bağımlılığı doğru

  // Initialize on mount
  useEffect(() => {
    // currentPuzzle değiştiğinde initializePuzzle'ı çağır
    if (currentPuzzle) {
        initializePuzzle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [currentPuzzleIndex, initializePuzzle]); // initializePuzzle'ı bağımlılığa ekle

  return {
    // States
    currentPuzzle,
    currentPuzzleIndex,
    currentMoveIndex,
    totalPuzzles,
    boardPosition,
    isComplete,
    lastMoveResult,
    moveHistory,
    // expectedMoves: getExpectedMoves(), // ESKİ YÖNTEM
    expectedMoves: expectedMovesList, // YENİ YÖNTEM: State'ten al
    isAutoPlaying,
    isWaitingForUser,
    currentPath, 
    variantMoveIndex, 
    // Methods
    makeMove,
    nextPuzzle: () => setCurrentPuzzleIndex(p => Math.min(p + 1, totalPuzzles - 1)),
    previousPuzzle: () => setCurrentPuzzleIndex(p => Math.max(p - 1, 0)),
    resetPuzzle,
    // getCurrentMoveLine ve getCurrentMoveIndex zaten stateRef kullandığı için her zaman günceldir.
    // Eğer dışarıya verilecekse ve useCallback ile sarmalanmışlarsa, bağımlılıkları olmamalıdır.
    getCurrentMoveLine, 
    getCurrentMoveIndex 
  };
};

export default usePuzzleState;