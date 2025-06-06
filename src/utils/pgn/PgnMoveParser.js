// utils/pgn/PgnMoveParser.js

/**
 * PGN hamle metnini parse eder ve varyantları ayırır
 * @param {string} movesText - PGN hamle metni
 * @returns {Object} - { mainLine: [], variants: [] }
 */
export function parsePgnMoves(movesText) {
  if (!movesText) {
    return { mainLine: [], variants: [] };
  }
  
  const result = {
    mainLine: [],
    variants: []
  };
  
  // Sonuç göstergesini kaldır (0-1, 1-0, 1/2-1/2, *)
  const cleanMoves = movesText.replace(/\s*(0-1|1-0|1\/2-1\/2|\*)\s*$/, '').trim();
  
  // Ana hat ve varyantları ayırmak için regex
  const tokens = [];
  let currentToken = '';
  let parenDepth = 0;
  
  // Karakterleri tek tek işle
  for (let i = 0; i < cleanMoves.length; i++) {
    const char = cleanMoves[i];
    
    if (char === '(') {
      if (parenDepth === 0 && currentToken.trim()) {
        tokens.push({ type: 'move', value: currentToken.trim() });
        currentToken = '';
      }
      parenDepth++;
      currentToken += char;
    } else if (char === ')') {
      parenDepth--;
      currentToken += char;
      if (parenDepth === 0) {
        tokens.push({ type: 'variant', value: currentToken.trim() });
        currentToken = '';
      }
    } else {
      currentToken += char;
    }
  }
  
  // Son token'ı ekle
  if (currentToken.trim()) {
    tokens.push({ type: 'move', value: currentToken.trim() });
  }
  
  // Token'ları işle
  let mainLineText = '';
  const variantTexts = [];
  
  tokens.forEach(token => {
    if (token.type === 'move') {
      mainLineText += ' ' + token.value;
    } else if (token.type === 'variant') {
      // Varyantı ve hangi hamleden sonra geldiğini bul
      const variantContent = token.value.slice(1, -1); // Parantezleri kaldır
      const lastMainMove = extractLastMove(mainLineText);
      
      variantTexts.push({
        text: variantContent,
        afterMove: lastMainMove
      });
    }
  });
  
  // Ana hattı parse et
  result.mainLine = extractMoves(mainLineText);
  
  // Varyantları parse et
  result.variants = variantTexts.map((variant, index) => {
    const moves = extractVariantMoves(variant.text); // ⭐ Özel fonksiyon kullan
    const parentMoveIndex = findParentMoveIndex(result.mainLine, variant.afterMove, moves[0]);
    
    return {
      name: `variant_${String.fromCharCode(97 + index)}`, // a, b, c...
      parentVariant: "main",
      parentMoveIndex: parentMoveIndex,
      moves: moves
    };
  });
  
  return result;
}

/**
 * Hamle metninden tek tek hamleleri çıkarır - DÜZELTME
 * @param {string} movesText - Hamle metni
 * @returns {Array<string>} - Hamle dizisi
 */
function extractMoves(movesText) {
  const moves = [];
  
  // SADELEŞTİRİLMİŞ REGEX - Sadece hamleleri al, numaraları ALMA
  const moveRegex = /([a-zA-Z][a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?)/g;
  
  let match;
  while ((match = moveRegex.exec(movesText)) !== null) {
    const move = match[1];
    if (move) {
      moves.push(move); // ⭐ SADECE HAMLE, NUMARA YOK
    }
  }
  
  return moves;
}

/**
 * Varyant hamleleri için özel parsing (numaraları koru)
 * @param {string} variantText - Varyant metni
 * @returns {Array<string>} - İlk hamle numaralı, geri kalanlar sadece hamle
 */
function extractVariantMoves(variantText) {
  const moves = [];
  
  // İlk hamle için numara dahil regex
  const firstMoveRegex = /(\d+\.{1,3})\s*([a-zA-Z][a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?)/;
  const firstMatch = variantText.match(firstMoveRegex);
  
  if (firstMatch) {
    // İlk hamleyi numara ile birlikte ekle
    moves.push(firstMatch[1] + ' ' + firstMatch[2]); // "7... Bxd5"
    
    // Geri kalan hamleleri normal parse et
    const remainingText = variantText.replace(firstMoveRegex, '');
    const remainingMoves = extractMoves(remainingText);
    moves.push(...remainingMoves);
  } else {
    // Fallback: Normal parsing
    moves.push(...extractMoves(variantText));
  }
  
  return moves;
}

/**
 * Ana hattaki son hamleyi bulur
 * @param {string} mainLineText - Ana hat metni
 * @returns {Object} - { moveNumber, color, move }
 */
function extractLastMove(mainLineText) {
  const moves = extractMoves(mainLineText);
  const moveCount = moves.length;
  
  if (moveCount === 0) return null;
  
  const lastMove = moves[moveCount - 1];
  const moveNumber = Math.ceil(moveCount / 2);
  const color = moveCount % 2 === 1 ? 'w' : 'b';
  
  return { moveNumber, color, move: lastMove };
}

/**
 * Varyantın hangi ana hat hamlesinden sonra başladığını bulur
 * @param {Array} mainLine - Ana hat hamleleri
 * @param {Object} afterMove - Varyanttan önceki son hamle
 * @param {string} firstVariantMove - Varyantın ilk hamlesi
 * @returns {number} - Parent move index (0-based)
 */
function findParentMoveIndex(mainLine, afterMove, firstVariantMove) {
  console.log('🔍 findParentMoveIndex Debug:', {
    mainLineLength: mainLine.length,
    afterMove,
    firstVariantMove
  });

  // "7... Bxd5" formatını kontrol et
  if (firstVariantMove && firstVariantMove.includes('...')) {
    const moveNumMatch = firstVariantMove.match(/^(\d+)\.\.\./);
    if (moveNumMatch) {
      const moveNumber = parseInt(moveNumMatch[1]);
      
      // 7... demek 7. beyaz hamleden sonra varyant başlayacak
      // 7. beyaz hamlesi = (7-1) * 2 = index 12 (0-based)
      // Ama PuzzleCreationStep mantığında parent = beyaz hamlenin index'i
      
      const whiteIndex = (moveNumber - 1) * 2; // 7. beyaz = index 12
      const blackIndex = whiteIndex + 1;       // 7. siyah = index 13
      
      console.log(`  Hamle ${moveNumber}: Beyaz[${whiteIndex}] Siyah[${blackIndex}]`);
      console.log(`  Varyant ${moveNumber}... beyaz hamle sonrası başlar`);
      
      // Parent = Beyaz hamlenin index'i (PuzzleCreationStep mantığı)
      if (whiteIndex < mainLine.length) {
        console.log(`  ✅ Parent Index: ${whiteIndex} (${moveNumber}. beyaz hamle)`);
        return whiteIndex;
      }
    }
  }

  // Fallback: afterMove kullan
  if (afterMove) {
    for (let i = mainLine.length - 1; i >= 0; i--) {
      if (mainLine[i] === afterMove.move) {
        console.log(`  Fallback: afterMove "${afterMove.move}" index ${i}'de bulundu`);
        return i;
      }
    }
  }
  
  return 0;
}

/**
 * Test fonksiyonu
 */
export function testParser(movesText) {
  console.log('\n🧪 PGN Move Parser Test');
  console.log('📄 Input:', movesText.substring(0, 100) + '...');
  
  const result = parsePgnMoves(movesText);
  
  console.log('\n📊 Sonuçlar:');
  console.log(`  Ana Hat: ${result.mainLine.length} hamle`);
  console.log(`  İlk 5 hamle: ${result.mainLine.slice(0, 5).join(' ')}`);
  console.log(`  Varyant Sayısı: ${result.variants.length}`);
  
  // Ana hat hamlelerini numaralandır (debug için)
  console.log('\n📋 Ana Hat Detay:');
  result.mainLine.forEach((move, index) => {
    const moveNumber = Math.floor(index / 2) + 1;
    const color = index % 2 === 0 ? '.' : '...';
    console.log(`  [${index}] ${moveNumber}${color} ${move}`);
  });
    result.variants.forEach((variant) => {
    console.log(`\n  Varyant ${variant.name}:`);
    console.log(`    Parent Index: ${variant.parentMoveIndex}`);
    console.log(`    Parent Move: ${result.mainLine[variant.parentMoveIndex] || 'Başlangıç'}`);
    console.log(`    Hamleler: ${variant.moves.join(' ')}`);
  });
  
  return result;
}