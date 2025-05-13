import { useState, useMemo, useCallback } from 'react';
import { ExtendedChess } from '@/utils/chess/ExtendedChess.js';

/**
 * Satranç mantığı için özel hook
 * @param {Object|string} options - Başlangıç FEN pozisyonu veya seçenekler nesnesi
 * @returns {Object} - Satranç mantığı fonksiyonları ve durumu
 */
const useChessLogic = (options = "8/8/8/8/8/8/8/8 w - - 0 1") => {
  // initialFen'i options'dan çıkar (string veya options.initialFen)
  const initialFen = typeof options === 'string' 
    ? options 
    : (options.initialFen || "8/8/8/8/8/8/8/8 w - - 0 1");
  
  // contentType'ı kontrol et (varsayılan 'editor')
  const contentType = typeof options === 'object' && options.contentType 
    ? options.contentType 
    : 'editor';
  
  const [fen, setFen] = useState(initialFen);
  const [boardPosition, setBoardPosition] = useState(initialFen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMainLine, setCurrentMainLine] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState('root');
  
  // ExtendedChess örneğini oluştur
  const game = useMemo(() => new ExtendedChess(initialFen, { bypass: [10] }), [initialFen]);
  
  /**
   * Belirli bir FEN pozisyonunu yükler
   * @param {string} newFen - Yüklenecek FEN pozisyonu
   * @returns {boolean} - İşlem başarılı ise true döner
   */
  const loadFen = useCallback((newFen) => {
    try {
      // Şah kontrolünü bypass et
      game.load(newFen, { bypass: [10] });
      setFen(game.fen());
      setBoardPosition(game.fen());
      return true;
    } catch (error) {
      console.error("Geçersiz FEN:", error.message);
      setError("Geçersiz FEN: " + error.message);
      return false;
    }
  }, [game]);
  
  /**
   * Tahtayı başlangıç pozisyonuna getirir
   */
  const resetBoard = useCallback(() => {
    game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", { bypass: [10] });
    setFen(game.fen());
    setBoardPosition(game.fen());
  }, [game]);
  
  /**
   * Tahtayı temizler
   */
  const clearBoard = useCallback(() => {
    game.clear();
    setFen(game.fen());
    setBoardPosition(game.fen());
  }, [game]);
  
  /**
   * Belirtilen kareye taş yerleştirir
   * @param {string} piece - Taşın kodu (örn: "wP", "bK")
   * @param {string} square - Hedef kare (örn: "e4", "a1")
   * @returns {boolean} - İşlem başarılı ise true döner
   */
  const putPiece = useCallback((piece, square) => {
    try {
      const color = piece[0];
      const type = piece[1].toLowerCase();
      
      // Karedeki mevcut taşı kaldır
      game.remove(square);
      
      // Yeni taşı yerleştir
      const success = game.put({ type, color }, square);
      
      if (success) {
        setFen(game.fen());
        setBoardPosition(game.fen());
      }
      
      return success;
    } catch (error) {
      console.error("Taş yerleştirme hatası:", error.message);
      setError("Taş yerleştirme hatası: " + error.message);
      return false;
    }
  }, [game]);
  
  /**
   * Belirtilen kareden taşı kaldırır
   * @param {string} square - Kaldırılacak taşın karesi
   * @returns {boolean} - İşlem başarılı ise true döner
   */
  const removePiece = useCallback((square) => {
    try {
      game.remove(square);
      setFen(game.fen());
      setBoardPosition(game.fen());
      return true;
    } catch (error) {
      console.error("Taş kaldırma hatası:", error.message);
      setError("Taş kaldırma hatası: " + error.message);
      return false;
    }
  }, [game]);
  
  /**
   * Bir taşı bir kareden diğerine taşır
   * @param {string} sourceSquare - Kaynak kare
   * @param {string} targetSquare - Hedef kare
   * @param {string} piece - Taş kodu
   * @returns {boolean} - İşlem başarılı ise true döner
   */
  const movePiece = useCallback((sourceSquare, targetSquare, piece) => {
    try {
      // Kaynak ve hedef karelerdeki taşları kaldır
      game.remove(sourceSquare);
      game.remove(targetSquare);
      
      const color = piece[0];
      const type = piece[1].toLowerCase();
      
      // Taşı hedef kareye yerleştir
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        setFen(game.fen());
        setBoardPosition(game.fen());
      }
      
      return success;
    } catch (error) {
      console.error("Taş taşıma hatası:", error.message);
      setError("Taş taşıma hatası: " + error.message);
      return false;
    }
  }, [game]);
  
  /**
   * Varsayılan şahları yerleştirir (beyaz h1, siyah h8)
   */
  const placeDefaultKings = useCallback(() => {
    game.clear();
    game.put({ type: 'k', color: 'w' }, 'h1');
    game.put({ type: 'k', color: 'b' }, 'h8');
    setFen(game.fen());
    setBoardPosition(game.fen());
  }, [game]);
  
  // Puzzle-specific functions
  
  /**
   * Bulmacayı kurar ve başlangıç pozisyonunu yükler
   * @param {Object} puzzle - Bulmaca verisi
   */
  const setupPuzzle = useCallback((puzzle) => {
    if (!puzzle) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // FEN pozisyonunu yükle
      loadFen(puzzle.fen);
      
      // Ana hattı kaydet
      setCurrentMainLine(puzzle.mainLine || []);
      
      setCurrentNodeId('root');
      setLoading(false);
    } catch (err) {
      setError(`Bulmaca kurulumu hatası: ${err.message}`);
      setLoading(false);
    }
  }, [loadFen]);
  
  /**
   * Hamlenin doğru olup olmadığını kontrol eder
   * @param {string} sourceSquare - Kaynak kare
   * @param {string} targetSquare - Hedef kare
   * @returns {Object} - Hamle sonucu
   */
  const validateMove = useCallback((sourceSquare, targetSquare) => {
    // Ana hatta aktif pozisyonun indeksini bul
    const currentFen = game.fen();
    const currentIndex = currentMainLine.findIndex(move => move.fen === currentFen);
    
    // Sonuç nesnesi
    const result = {
      valid: false,
      correct: false,
      completed: false,
      lastCorrectNodeId: currentNodeId
    };
    
    try {
      // Geçerli bir hamle mi kontrol et
      const moveInstance = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Otomatik vezir terfi
      });
      
      if (!moveInstance) {
        return result;
      }
      
      // Hamle geçerli
      result.valid = true;
      
      // Hamle doğru mu?
      const nextCorrectMove = currentMainLine[currentIndex + 1];
      if (nextCorrectMove && 
          nextCorrectMove.from === sourceSquare && 
          nextCorrectMove.to === targetSquare) {
        
        result.correct = true;
        result.lastCorrectNodeId = `node_${currentIndex + 1}`;
        
        // Bulmaca tamamlandı mı?
        if (currentIndex + 1 === currentMainLine.length - 1 || nextCorrectMove.isLast) {
          result.completed = true;
        }
        
        // Pozisyonu güncelle
        setBoardPosition(game.fen());
        setCurrentNodeId(`node_${currentIndex + 1}`);
      } else {
        // Yanlış hamle ise geri al
        game.undo();
      }
      
      return result;
    } catch (error) {
      console.error("Hamle doğrulama hatası:", error.message);
      setError("Hamle doğrulama hatası: " + error.message);
      return result;
    }
  }, [game, currentMainLine, currentNodeId]);
  
  /**
   * Belirli bir düğüme git
   * @param {string} nodeId - Düğüm ID'si
   */
  const goToNode = useCallback((nodeId) => {
    // nodeId'den sayısal indeksi çıkar
    const match = nodeId.match(/node_(\d+)/);
    const index = match ? parseInt(match[1]) : 0;
    
    if (index === 0 || nodeId === 'root') {
      // Kök düğüme dön (başlangıç pozisyonu)
      loadFen(currentMainLine.length > 0 ? currentMainLine[0].fen : initialFen);
      setCurrentNodeId('root');
      return;
    }
    
    // İndekse göre ana hattan FEN pozisyonunu al
    if (index > 0 && index < currentMainLine.length) {
      loadFen(currentMainLine[index].fen);
      setCurrentNodeId(nodeId);
    }
  }, [loadFen, currentMainLine, initialFen]);
  
  /**
   * Ana hattı döndürür
   * @returns {Array} - Ana hat hamleleri
   */
  const getMainLine = useCallback(() => {
    return currentMainLine;
  }, [currentMainLine]);
  
  // Hook content type'a göre farklı arayüz döndürür
  if (contentType === 'puzzle') {
    return {
      boardPosition,
      loading,
      error,
      setupPuzzle,
      validateMove,
      goToNode,
      getMainLine
    };
  }
  
  // Standart (editor) arayüz
  return {
    fen,
    boardPosition,
    loadFen,
    resetBoard,
    clearBoard,
    putPiece,
    removePiece,
    movePiece,
    placeDefaultKings
  };
};

export default useChessLogic;