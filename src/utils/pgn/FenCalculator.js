// utils/pgn/FenCalculator.js

import { Chess } from 'chess.js';

/**
 * Hamle listesi için FEN hesaplar (PuzzleCreationStep mantığıyla)
 * @param {string} startFen - Başlangıç FEN pozisyonu
 * @param {Array<string>} moveList - Hamle listesi
 * @returns {Array<Object>} - [{move, fen, isLast}] formatında
 */
export function calculateMovesWithFen(startFen, moveList) {
  if (!moveList || moveList.length === 0) {
    return [];
  }

  console.log('🔍 calculateMovesWithFen:', {
    startFen: startFen.split(' ')[0], // Sadece pozisyon kısmı
    moveCount: moveList.length,
    firstMove: moveList[0]
  });

  try {
    // Normal Chess.js kullan (tüm puzzle'larda şah var)
    const chess = new Chess(startFen);
    const result = [];
    
    moveList.forEach((move, index) => {
      // Hamle öncesi FEN'i kaydet (PuzzleCreationStep mantığı)
      const fenBeforeMove = chess.fen();
      
      // Hamleyi normalize et (varyant göstergesini temizle)
      const cleanMove = move.replace(/^\d+\.{1,3}\s*/, '');
      
      try {
        // Hamleyi dene
        const moveResult = chess.move(cleanMove);
        
        if (moveResult) {
          result.push({
            move: moveResult.san, // Standart notasyon
            fen: fenBeforeMove,   // HAMLE ÖNCESİ FEN
            isLast: index === moveList.length - 1
          });
        } else {
          // Hamle başarısız - disambiguation gerekebilir
          const disambiguated = handleAmbiguousMove(chess, cleanMove);
          if (disambiguated) {
            result.push({
              move: disambiguated.san,
              fen: fenBeforeMove,
              isLast: index === moveList.length - 1
            });
          } else {
            console.error(`❌ Hamle başarısız: ${cleanMove} at position ${index}`);
            // Hatalı hamle için de kayıt tut
            result.push({
              move: cleanMove,
              fen: fenBeforeMove,
              isLast: index === moveList.length - 1
            });
          }
        }
      } catch (error) {
        console.error(`❌ Hamle hatası: ${cleanMove}`, error.message);
        // Hata durumunda da devam et
        result.push({
          move: cleanMove,
          fen: fenBeforeMove,
          isLast: index === moveList.length - 1
        });
      }
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ FEN Calculator hatası:', error);
    return moveList.map((move, index) => ({
      move: move.replace(/^\d+\.{1,3}\s*/, ''),
      fen: startFen,
      isLast: index === moveList.length - 1
    }));
  }
}

/**
 * Belirsiz hamleleri çözer (Bxd7 → hangi fil?)
 * @param {Chess} chess - Chess instance
 * @param {string} moveStr - Hamle string
 * @returns {Object|null} - Move result veya null
 */
function handleAmbiguousMove(chess, moveStr) {
  const legalMoves = chess.moves({ verbose: false });
  
  // Capture hamlesi mi?
  if (moveStr.includes('x')) {
    const [piece, target] = moveStr.split('x');
    
    // Bu hedef kareye gidebilecek taşları bul
    const candidates = legalMoves.filter(move => 
      move.includes(piece[0]) && 
      move.includes('x') && 
      move.includes(target)
    );
    
    if (candidates.length === 1) {
      return chess.move(candidates[0]);
    } else if (candidates.length > 1) {
      console.log(`🔍 Multiple candidates for ${moveStr}:`, candidates);
      // İlk uygun olanı dene
      return chess.move(candidates[0]);
    }
  } else {
    // Normal hamle
    const candidates = legalMoves.filter(move => 
      move.endsWith(moveStr.slice(-2)) && // Hedef kare
      move.startsWith(moveStr[0])         // Taş türü
    );
    
    if (candidates.length >= 1) {
      return chess.move(candidates[0]);
    }
  }
  
  return null;
}

/**
 * Varyant için başlangıç FEN'ini hesaplar
 * @param {string} startFen - Puzzle başlangıç FEN'i
 * @param {Array<string>} mainLineMoves - Ana hat hamleleri
 * @param {number} parentIndex - Varyantın başladığı index
 * @returns {string} - Varyant başlangıç FEN'i
 */
export function calculateVariantStartFen(startFen, mainLineMoves, parentIndex) {
  if (parentIndex <= 0) {
    return startFen;
  }
  
  try {
    const chess = new Chess(startFen);
    
    // Parent index'e kadar hamleleri oyna
    for (let i = 0; i < parentIndex && i < mainLineMoves.length; i++) {
      const cleanMove = mainLineMoves[i].replace(/^\d+\.{1,3}\s*/, '');
      const moveResult = chess.move(cleanMove);
      
      if (!moveResult) {
        // Ambiguous move handling
        const disambiguated = handleAmbiguousMove(chess, cleanMove);
        if (!disambiguated) {
          console.error(`❌ Varyant FEN hesaplanamadı, hamle ${i}: ${cleanMove}`);
          break;
        }
      }
    }
    
    return chess.fen();
    
  } catch (error) {
    console.error('❌ Varyant FEN hatası:', error);
    return startFen;
  }
}

/**
 * Test fonksiyonu
 */
export function testFenCalculator() {
  console.log('\n🧪 FEN Calculator Test\n');
  
  // Test 1: Ana hat
  const testFen = "7k/3P4/2b3P1/3P3P/P7/5P2/2P3P1/4K3 b - - 0 1";
  const testMoves = ["Bxd7", "Kd2", "Bxa4"];
  
  console.log('📋 Test 1: Ana Hat');
  const result1 = calculateMovesWithFen(testFen, testMoves);
  result1.forEach((item, i) => {
    console.log(`  [${i}] ${item.move}`);
    console.log(`      FEN: ${item.fen.split(' ')[0]}`);
    console.log(`      isLast: ${item.isLast}`);
  });
  
  // Test 2: Varyant başlangıç FEN'i
  console.log('\n📋 Test 2: Varyant Başlangıç FEN');
  const mainLine = ["Bxd7", "Kd2", "Bxa4", "Ke1", "Bxc2", "Kd2", "Bxg6"];
  const variantFen = calculateVariantStartFen(testFen, mainLine, 6);
  console.log(`  Parent Index: 6`);
  console.log(`  Varyant FEN: ${variantFen.split(' ')[0]}`);
  
  return { result1, variantFen };
}