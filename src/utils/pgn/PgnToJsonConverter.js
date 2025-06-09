// utils/pgn/PgnToJsonConverter.js - Step 4: smartCode field + FEN Error Fix

import { splitPgnGames } from './PgnGameSplitter.js';
import { parsePgnMoves } from './PgnMoveParser.js';
import { calculateMovesWithFen, calculateVariantStartFen } from './FenCalculator.js';

/**
 * PGN'den JSON'a dönüştürücü ana sınıf
 */
export class PgnToJsonConverter {
  constructor(setId = "003fc3") {
    this.setId = setId;
    this.pieceSet = "merida";
  }

  /**
   * PGN içeriğini JSON formatına dönüştürür
   * @param {string} pgnContent - PGN dosya içeriği
   * @returns {Object} - JSON format
   */
  convertPgnToJson(pgnContent) {
    console.log('\n🔄 PGN to JSON Conversion Starting...');
    console.log(`📋 Set ID: ${this.setId}`);
    
    // 1. Oyunları ayır
    const games = splitPgnGames(pgnContent);
    console.log(`📊 ${games.length} oyun bulundu`);
    
    // 2. Her oyunu puzzle'a dönüştür
    const puzzles = games.map((game, index) => {
      return this.convertGameToPuzzle(game, index);
    }).filter(Boolean); // null olanları filtrele
    
    // 3. Final JSON oluştur
    const result = {
      id: this.setId,
      smartCode: this.setId,  // ⭐ EKLENEN: Set level smartCode
      pieceSet: this.pieceSet,
      nextSetId: this.generateNextSetId(this.setId),
      puzzles: puzzles,
      puzzleCount: puzzles.length
    };
    
    console.log(`\n✅ Dönüşüm tamamlandı: ${puzzles.length} puzzle oluşturuldu`);
    console.log(`📋 Set smartCode: ${result.smartCode}`);
    
    return result;
  }

  /**
   * Tek bir oyunu puzzle formatına dönüştürür
   * @param {Object} game - Oyun verisi
   * @param {number} index - Oyun index'i
   * @returns {Object|null} - Puzzle object
   */
  convertGameToPuzzle(game, index) {
    const puzzleId = `${this.setId}_${String(index + 1).padStart(2, '0')}`;
    
    console.log(`\n🧩 Puzzle ${index + 1} işleniyor...`);
    
    // FEN kontrolü
    const startFen = game.headers.FEN;
    if (!startFen) {
      console.error(`❌ Puzzle ${index + 1}: FEN bulunamadı`);
      return null;
    }
    
    // Hamleleri parse et
    const moveData = parsePgnMoves(game.moves);
    if (moveData.mainLine.length === 0) {
      console.error(`❌ Puzzle ${index + 1}: Hamle bulunamadı`);
      return null;
    }
    
    console.log(`  📋 Ana hat: ${moveData.mainLine.length} hamle`);
    console.log(`  📋 Varyant: ${moveData.variants.length} adet`);
    
    // ✅ DÜZELTME 1: Ana hat FEN'lerini güvenli hesapla
    let mainLine = [];
    try {
      mainLine = calculateMovesWithFen(startFen, moveData.mainLine);
      console.log(`  ✅ Ana hat başarıyla hesaplandı: ${mainLine.length} hamle`);
    } catch (error) {
      console.error(`  ❌ Ana hat FEN hesaplama hatası: ${error.message}`);
      // Ana hat başarısız olursa puzzle'ı atla
      return null;
    }
    
    // ✅ DÜZELTME 2: Varyantları güvenli işle
    const alternatives = [];
    
    for (const [varIndex, variant] of moveData.variants.entries()) {
      try {
        console.log(`\n🔍 Varyant ${varIndex + 1} işleniyor: ${variant.name}`);
        console.log(`  📋 Parent move index: ${variant.parentMoveIndex}`);
        console.log(`  📋 Variant moves: ${variant.moves.slice(0, 3).join(', ')}${variant.moves.length > 3 ? '...' : ''}`);
        
        // Varyant başlangıç FEN'ini hesapla
        const variantStartFen = calculateVariantStartFen(
          startFen, 
          moveData.mainLine, 
          variant.parentMoveIndex
        );
        
        if (!variantStartFen) {
          console.warn(`  ⚠️ Varyant ${variant.name}: Başlangıç FEN hesaplanamadı`);
          continue;
        }
        
        console.log(`  🔍 Variant start FEN: ${variantStartFen.substring(0, 30)}...`);
        
        // Varyant hamlelerinin FEN'lerini hesapla
        const variantMovesWithFen = calculateMovesWithFen(
          variantStartFen, 
          variant.moves
        );
        
        // ✅ DÜZELTME 3: Hatalı hamleleri filtrele
        const validMoves = variantMovesWithFen.filter(move => {
          if (!move || move.error) {
            console.warn(`    ⚠️ Invalid move filtered: ${move?.move || 'unknown'}`);
            return false;
          }
          return true;
        });
        
        if (validMoves.length === 0) {
          console.warn(`  ⚠️ Varyant ${variant.name}: Hiç geçerli hamle yok`);
          continue;
        }
        
        if (validMoves.length !== variantMovesWithFen.length) {
          console.warn(`  ⚠️ Varyant ${variant.name}: ${variantMovesWithFen.length - validMoves.length} geçersiz hamle filtrelendi`);
        }
        
        // Geçerli varyantı ekle
        alternatives.push({
          name: variant.name,
          parentVariant: variant.parentVariant,
          parentMoveIndex: variant.parentMoveIndex,
          moves: validMoves
        });
        
        console.log(`  ✅ Varyant ${variant.name}: ${validMoves.length} geçerli hamle eklendi`);
        
      } catch (variantError) {
        console.error(`  ❌ Varyant ${variant.name} işleme hatası: ${variantError.message}`);
        // Varyant hatası puzzle'ı durdurmasın, sadece o varyantı atla
        continue;
      }
    }
    
    // ✅ DÜZELTME 4: Puzzle object oluştur
    const puzzle = {
      id: puzzleId,
      smartCode: this.setId,  // ⭐ EKLENEN: Puzzle level smartCode
      index: index + 1,
      fen: startFen,
      mainLine: mainLine,
      alternatives: alternatives  // ✅ Sadece geçerli varyantlar
    };
    
    console.log(`  ✅ Puzzle ${puzzleId} başarıyla oluşturuldu`);
    console.log(`  📋 Puzzle smartCode: ${puzzle.smartCode}`);
    console.log(`  📋 Alternatives: ${alternatives.length} geçerli varyant`);
    
    return puzzle;
  }

  /**
   * Sonraki set ID'sini oluştur
   * @param {string} currentId - Mevcut set ID
   * @returns {string} - Sonraki set ID
   */
  generateNextSetId(currentId) {
    if (!currentId || currentId.length < 6) return "001ka1";
    
    const num = parseInt(currentId.substring(0, 3)) + 1;
    return String(num).padStart(3, '0') + currentId.substring(3);
  }
}

/**
 * Test fonksiyonu - fc3.pgn ile test et
 */
export function testConverter(pgnContent, setId = "003fc3") {
  console.log('\n🧪 PGN to JSON Converter Test - Step 4 Updated & FEN Fixed');
  console.log('='.repeat(50));
  
  const converter = new PgnToJsonConverter(setId);
  const result = converter.convertPgnToJson(pgnContent);
  
  console.log('\n📊 Dönüşüm Özeti:');
  console.log(`  Set ID: ${result.id}`);
  console.log(`  Set SmartCode: ${result.smartCode}`);
  console.log(`  Piece Set: ${result.pieceSet}`);
  console.log(`  Next Set ID: ${result.nextSetId}`);
  console.log(`  Puzzle Count: ${result.puzzleCount}`);
  
  // İlk puzzle'ı detaylı göster
  if (result.puzzles.length > 0) {
    const firstPuzzle = result.puzzles[0];
    console.log('\n📋 İlk Puzzle Detayı:');
    console.log(`  ID: ${firstPuzzle.id}`);
    console.log(`  SmartCode: ${firstPuzzle.smartCode}`);
    console.log(`  FEN: ${firstPuzzle.fen.split(' ')[0]}...`);
    console.log(`  Ana Hat: ${firstPuzzle.mainLine.length} hamle`);
    console.log(`  İlk 3 hamle:`);
    firstPuzzle.mainLine.slice(0, 3).forEach((move, i) => {
      console.log(`    ${i + 1}. ${move.move} (FEN: ${move.fen.split(' ')[0].substring(0, 20)}...)`);
    });
    
    if (firstPuzzle.alternatives.length > 0) {
      console.log(`  Alternatives:`);
      firstPuzzle.alternatives.forEach(alt => {
        console.log(`    ${alt.name}: ${alt.moves.length} hamle (parent: ${alt.parentMoveIndex})`);
      });
    } else {
      console.log(`  Alternatives: Yok`);
    }
  }
  
  // ✅ STEP 4 VALIDATION: SmartCode field kontrolü
  console.log('\n🔍 Step 4 Validation - SmartCode Field Kontrolü:');
  const setHasSmartCode = result.smartCode === setId;
  const puzzleHasSmartCode = result.puzzles.length > 0 && result.puzzles[0].smartCode === setId;
  const allPuzzlesHaveSmartCode = result.puzzles.every(p => p.smartCode === setId);
  
  console.log(`  ✅ Set Level SmartCode: ${setHasSmartCode ? '✓' : '✗'} (${result.smartCode})`);
  console.log(`  ✅ First Puzzle SmartCode: ${puzzleHasSmartCode ? '✓' : '✗'} (${result.puzzles[0]?.smartCode || 'N/A'})`);
  console.log(`  ✅ All Puzzles SmartCode: ${allPuzzlesHaveSmartCode ? '✓' : '✗'} (${result.puzzles.length} puzzles)`);
  
  // ✅ FEN ERROR VALIDATION: Hata kontrolü
  const totalAlternatives = result.puzzles.reduce((sum, p) => sum + p.alternatives.length, 0);
  const puzzlesWithErrors = result.puzzles.filter(p => !p.mainLine || p.mainLine.length === 0);
  
  console.log('\n🔍 FEN Error Validation:');
  console.log(`  ✅ Başarılı Puzzles: ${result.puzzles.length} / ${result.puzzleCount}`);
  console.log(`  ✅ Total Alternatives: ${totalAlternatives}`);
  console.log(`  ✅ Failed Puzzles: ${puzzlesWithErrors.length}`);
  
  const allValidations = setHasSmartCode && puzzleHasSmartCode && allPuzzlesHaveSmartCode && puzzlesWithErrors.length === 0;
  console.log(`\n🎯 Overall Validation: ${allValidations ? '✅ BAŞARILI' : '❌ SORUN VAR'}`);
  
  return result;
}

/**
 * JSON'u dosyaya kaydet
 */
export function saveJsonToFile(jsonData, filename = null) {
  const defaultFilename = `chessmino-${jsonData.id}-${new Date().toISOString().split('T')[0]}.json`;
  const finalFilename = filename || defaultFilename;
  
  const jsonString = JSON.stringify(jsonData, null, 2);
  
  // Node.js ortamı için
  if (typeof window === 'undefined') {
    const fs = require('fs');
    fs.writeFileSync(finalFilename, jsonString, 'utf8');
    console.log(`\n💾 JSON dosyası kaydedildi: ${finalFilename}`);
  } 
  // Browser ortamı için
  else {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    a.click();
    URL.revokeObjectURL(url);
    console.log(`\n💾 JSON dosyası indirildi: ${finalFilename}`);
  }
  
  return finalFilename;
}