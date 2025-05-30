import { Chess } from 'chess.js';
import { PIECE_TYPES, EXERCISE_TYPES, DIFFICULTY_LEVELS } from '@/schemas/puzzleSetSchema';

/**
 * PGN string'ini puzzle set formatına dönüştürür
 * @param {string} pgnText - PGN format string
 * @param {string} setId - Puzzle set ID (örn: "001ka1")
 * @returns {Object} - Standart puzzle set formatı
 */
export function convertPgnToStandardFormat(pgnText, setId) {
  try {
    // Basit PGN parsing - improvement için daha sonra geliştirilebilir
    const puzzles = parsePgnToPuzzles(pgnText, setId);
    
    return {
      id: setId,
      title: generateTitle(setId),
      pieceSet: "merida",
      difficulty: parseInt(setId.charAt(5)) || 1,
      puzzleCount: puzzles.length,
      nextSetId: generateNextSetId(setId),
      puzzles: puzzles
    };
  } catch (error) {
    console.error('PGN conversion error:', error);
    throw new Error('PGN dosyası işlenirken hata oluştu');
  }
}

/**
 * PGN text'ini puzzle array'e dönüştürür
 * @param {string} pgnText 
 * @param {string} setId 
 * @returns {Array}
 */
function parsePgnToPuzzles(pgnText, setId) {
  const puzzles = [];
  
  // PGN'i satırlara böl ve temizle
  const lines = pgnText.split('\n').filter(line => line.trim());
  
  let currentPuzzle = null;
  let puzzleIndex = 1;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // FEN satırı mı kontrol et
    if (trimmedLine.startsWith('[FEN ') || trimmedLine.includes('rnbqkbnr')) {
      // Yeni puzzle başlangıcı
      if (currentPuzzle) {
        puzzles.push(currentPuzzle);
      }
      
      // FEN'i çıkar
      let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // default
      
      if (trimmedLine.startsWith('[FEN ')) {
        fen = trimmedLine.match(/\[FEN "([^"]+)"\]/)?.[1] || fen;
      } else if (trimmedLine.includes('/')) {
        fen = trimmedLine;
      }
      
      currentPuzzle = {
        id: `${setId}_${String(puzzleIndex).padStart(2, '0')}`,
        index: puzzleIndex,
        startFen: fen,
        solution: {
          mainLine: [],
          alternatives: []
        }
      };
      
      puzzleIndex++;
    }
    
    // Hamle satırı mı kontrol et (sayılar ve hamle notasyonu)
    else if (trimmedLine && /^[1-9]/.test(trimmedLine) && currentPuzzle) {
      const moves = extractMovesFromLine(trimmedLine);
      if (moves.length > 0) {
        currentPuzzle.solution.mainLine = calculateMovesWithFen(
          currentPuzzle.startFen, 
          moves
        );
      }
    }
  }
  
  // Son puzzle'ı ekle
  if (currentPuzzle) {
    puzzles.push(currentPuzzle);
  }
  
  return puzzles;
}

/**
 * Satırdan hamleleri çıkarır
 * @param {string} line 
 * @returns {Array}
 */
function extractMovesFromLine(line) {
  // "1. e4 e5 2. Nf3 Nc6" formatından hamleleri çıkar
  return line
    .replace(/\d+\./g, '') // Hamle numaralarını kaldır
    .replace(/[{}()]/g, '') // Parantezleri kaldır
    .split(/\s+/) // Boşluklara böl
    .filter(move => move && /^[a-zA-Z]/.test(move)) // Geçerli hamleleri filtrele
    .slice(0, 10); // Maksimum 10 hamle
}

/**
 * Hamleleri FEN ile birlikte hesaplar
 * @param {string} startFen 
 * @param {Array} moves 
 * @returns {Array}
 */
function calculateMovesWithFen(startFen, moves) {
  try {
    const chess = new Chess(startFen);
    
    return moves.map((moveStr, index) => {
      try {
        const result = chess.move(moveStr);
        
        return {
          id: `move_${index + 1}`,
          move: result ? result.san : moveStr,
          from: result ? result.from : '',
          to: result ? result.to : '',
          fen: chess.fen(),
          isLast: index === moves.length - 1
        };
      } catch (error) {
        return {
          id: `move_${index + 1}`,
          move: moveStr,
          from: '',
          to: '',
          fen: chess.fen(),
          isLast: index === moves.length - 1
        };
      }
    });
  } catch (error) {
    // Fallback: FEN hesaplayamazsa basit format döndür
    return moves.map((moveStr, index) => ({
      id: `move_${index + 1}`,
      move: moveStr,
      from: '',
      to: '',
      fen: startFen,
      isLast: index === moves.length - 1
    }));
  }
}

/**
 * Set ID'den başlık oluşturur
 * @param {string} setId 
 * @returns {string}
 */
function generateTitle(setId) {
  const pieceType = PIECE_TYPES[setId.charAt(3)] || 'Bilinmeyen';
  const exerciseType = EXERCISE_TYPES[setId.charAt(4)] || 'Egzersiz';
  const difficulty = DIFFICULTY_LEVELS[setId.charAt(5)] || 'Normal';
  
  return `${pieceType} ${exerciseType} Alıştırmaları - ${difficulty}`;
}

/**
 * Sonraki set ID'sini oluşturur
 * @param {string} currentId 
 * @returns {string}
 */
function generateNextSetId(currentId) {
  const setNumber = parseInt(currentId.substring(0, 3));
  const nextNumber = String(setNumber + 1).padStart(3, '0');
  return nextNumber + currentId.substring(3);
}