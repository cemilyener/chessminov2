// utils/pgn/PgnToJsonConverter.js

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
      pieceSet: this.pieceSet,
      nextSetId: this.generateNextSetId(this.setId),
      puzzles: puzzles,
      puzzleCount: puzzles.length
    };
    
    console.log(`\n✅ Dönüşüm tamamlandı: ${puzzles.length} puzzle oluşturuldu`);
    
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
    
    // Ana hat FEN'lerini hesapla
    const mainLine = calculateMovesWithFen(startFen, moveData.mainLine);
    
    // Varyantları işle
    const alternatives = moveData.variants.map((variant, varIndex) => {
      // Varyant başlangıç FEN'ini hesapla
      const variantStartFen = calculateVariantStartFen(
        startFen, 
        moveData.mainLine, 
        variant.parentMoveIndex
      );
      
      // Varyant hamlelerinin FEN'lerini hesapla
      const variantMovesWithFen = calculateMovesWithFen(
        variantStartFen, 
        variant.moves
      );
      
      return {
        name: variant.name,
        parentVariant: variant.parentVariant,
        parentMoveIndex: variant.parentMoveIndex,
        moves: variantMovesWithFen
      };
    });
    
    // Puzzle object oluştur
    const puzzle = {
      id: puzzleId,
      index: index + 1,
      fen: startFen,
      mainLine: mainLine,
      alternatives: alternatives
    };
    
    console.log(`  ✅ Puzzle ${puzzleId} başarıyla oluşturuldu`);
    
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
  console.log('\n🧪 PGN to JSON Converter Test');
  console.log('='*50);
  
  const converter = new PgnToJsonConverter(setId);
  const result = converter.convertPgnToJson(pgnContent);
  
  console.log('\n📊 Dönüşüm Özeti:');
  console.log(`  Set ID: ${result.id}`);
  console.log(`  Piece Set: ${result.pieceSet}`);
  console.log(`  Next Set ID: ${result.nextSetId}`);
  console.log(`  Puzzle Count: ${result.puzzleCount}`);
  
  // İlk puzzle'ı detaylı göster
  if (result.puzzles.length > 0) {
    const firstPuzzle = result.puzzles[0];
    console.log('\n📋 İlk Puzzle Detayı:');
    console.log(`  ID: ${firstPuzzle.id}`);
    console.log(`  FEN: ${firstPuzzle.fen.split(' ')[0]}...`);
    console.log(`  Ana Hat: ${firstPuzzle.mainLine.length} hamle`);
    console.log(`  İlk 3 hamle:`);
    firstPuzzle.mainLine.slice(0, 3).forEach((move, i) => {
      console.log(`    ${i + 1}. ${move.move} (FEN: ${move.fen.split(' ')[0].substring(0, 20)}...)`);
    });
    
    if (firstPuzzle.alternatives.length > 0) {
      console.log(`  Varyantlar:`);
      firstPuzzle.alternatives.forEach(alt => {
        console.log(`    ${alt.name}: ${alt.moves.length} hamle (parent: ${alt.parentMoveIndex})`);
      });
    }
  }
  
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