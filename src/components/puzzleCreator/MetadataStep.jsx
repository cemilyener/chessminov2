import React, { useState } from 'react';
import SmartNamingDecoder from '@/utils/smartNaming/SmartNamingDecoder';
import { Chess } from 'chess.js';

const MetadataStep = ({ puzzleSet, setPuzzleSet, onNext, onPgnImport, generateNextSetId }) => {
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [isProcessing, setIsProcessing] = useState(false);
  const [pgnPreview, setPgnPreview] = useState(null);

  // Smart Code değişiklik handler'ı
  const handleSmartCodeChange = (e) => {
    const code = e.target.value;
    setPuzzleSet({ ...puzzleSet, id: code });
    
    // 6 karakter olduğunda otomatik decode
    if (code.length === 6) {
      const decoded = SmartNamingDecoder.decode(code);
      if (decoded.isValid) {
        setPuzzleSet(prev => ({
          ...prev,
          id: code,
          title: decoded.generatedTitle,
          description: decoded.generatedDescription,
          nextSetId: generateNextSetId(code)
        }));
      }
    }
  };

  // Enter tuşu handler'ı
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isSmartCodeValid) {
      e.preventDefault();
      onNext();
    }
  };

  // Basit PGN işleme fonksiyonu - DÜZELTME
  const processPgnSimple = (pgnContent) => {
    console.log('🎮 Starting PGN processing...');
    
    try {
      // Her oyunu ayrı puzzle olarak işle - BURAYI DÜZELTELİM
      const games = pgnContent.split(/\n\s*\n/).filter(game => 
        game.trim() && 
        game.includes('1.') && 
        !game.startsWith('[')  // Header satırlarını filtrele
      );
      
      console.log('🎮 Found games:', games.length);
      console.log('🎮 Games preview:', games.map((g, i) => `Game ${i+1}: ${g.substring(0, 50)}...`));
      
      if (games.length === 0) {
        // Tek blok PGN ise manuel ayır
        const movePattern = /\d+\.\s*[a-zA-Z0-9+#-]+/g;
        const allMoves = pgnContent.match(movePattern) || [];
        
        if (allMoves.length > 0) {
          // Her 3-6 hamleyi ayrı puzzle yap
          const puzzles = [];
          for (let i = 0; i < allMoves.length; i += 4) {
            const puzzleMoves = allMoves.slice(i, i + 4);
            if (puzzleMoves.length >= 2) {
              puzzles.push({
                id: `pgn_${puzzles.length + 1}`,
                fen: customFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                mainLine: puzzleMoves.map(move => move.replace(/\d+\.\s*/, '')),
                alternatives: []
              });
            }
          }
          return puzzles;
        }
      }
      
      // Normal game processing
      const puzzles = games.map((game, index) => {
        const moves = extractMovesFromGame(game);
        console.log(`🎮 Game ${index + 1} moves:`, moves);
        
        return {
          id: `pgn_${index + 1}`,
          fen: customFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          mainLine: moves,
          alternatives: []
        };
      }).filter(puzzle => puzzle.mainLine.length > 0);
      
      console.log('🎮 Final puzzles:', puzzles.length);
      return puzzles;
      
    } catch (error) {
      console.error('❌ PGN processing error:', error);
      return [];
    }
  };

  // Yardımcı fonksiyon ekle:
  const extractMovesFromGame = (gameText) => {
    // Temizlik
    let cleanText = gameText
      .replace(/\{[^}]*\}/g, '') // Yorumları sil
      .replace(/\([^)]*\)/g, '') // Parantezleri sil
      .replace(/\$\d+/g, '')     // Annotation'ları sil
      .replace(/[?!]+/g, '')     // Soru/ünlem işaretlerini sil
      .replace(/\d+-\d+/g, '')   // Sonuçları sil (1-0, 0-1, 1/2-1/2)
      .replace(/\*/g, '');       // Yıldızları sil
    
    // Hamleleri çıkar
    const movePattern = /\d+\.+\s*([a-zA-Z0-9+#=-]+)(?:\s+([a-zA-Z0-9+#=-]+))?/g;
    const moves = [];
    let match;
    
    while ((match = movePattern.exec(cleanText)) !== null) {
      if (match[1]) moves.push(match[1]);
      if (match[2]) moves.push(match[2]);
    }
    
    return moves.filter(move => 
      move && 
      move.length > 1 && 
      /^[a-zA-Z]/.test(move) // Harf ile başlamalı
    );
  };

  // PGN dosyası yükleme handler'ı
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const pgnContent = e.target.result;
      
      try {
        // PGN'i işle
        const puzzleData = processPgnSimple(pgnContent);
        
        // Preview için sakla
        setPgnPreview({
          filename: file.name,
          moveCount: puzzleData.mainLine.length,
          startFen: puzzleData.fen,
          firstMoves: puzzleData.mainLine.slice(0, 5).join(' ')
        });
        
        // Import et
        if (onPgnImport) {
          onPgnImport({
            id: puzzleSet.id || '001ka1',
            title: `${file.name.replace('.pgn', '')} Puzzle`,
            pieceSet: puzzleSet.pieceSet || 'merida',
            puzzles: [{
              id: 1,
              fen: puzzleData.fen,
              startingFen: puzzleData.fen,
              mainLine: puzzleData.mainLine,
              alternatives: puzzleData.alternatives
            }],
            puzzleCount: 1
          });
        }
        
        alert(`✅ PGN başarıyla yüklendi! ${puzzleData.mainLine.length} hamle içe aktarıldı.`);
        
      } catch (error) {
        alert(`❌ PGN yükleme hatası: ${error.message}`);
        setPgnPreview(null);
      } finally {
        setIsProcessing(false);
        setFileInputKey(Date.now());
      }
    };
    
    reader.onerror = () => {
      alert('Dosya okuma hatası!');
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };

  // PGN verilerini işlemek için yeni fonksiyon
  const handlePgnUpload = (pgnData) => {
    console.log('🧪 PGN RAW DATA:', pgnData);
    
    // PGN'i oyunlara ayır
    const games = pgnData.split(/\n\s*\n/).filter(game => game.trim());
    console.log('🧪 SPLIT GAMES:', games.length);
    
    games.forEach((game, index) => {
      console.log(`🧪 GAME ${index + 1}:`, game.substring(0, 100) + '...');
    });
    
    // Her oyunu ayrı puzzle olarak işle
    const puzzles = games.map((game, index) => {
      const moves = extractMovesFromPGN(game);
      console.log(`🧪 MOVES FOR GAME ${index + 1}:`, moves);
      
      return {
        id: `pgn_${index + 1}`,
        fen: extractFenFromPGN(game) || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        mainLine: moves,
        alternatives: []
      };
    });
    
    console.log('🧪 FINAL PUZZLES:', puzzles);
    
    // Puzzle set'e ekle
    setPuzzleSet(prev => ({
      ...prev,
      puzzles: [...prev.puzzles, ...puzzles]
    }));
  };

  // Smart Code validation
  const isSmartCodeValid = puzzleSet.id.length === 6 && /^\d{3}[kfvsapmtrgbh][aibcs][123]$/.test(puzzleSet.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Puzzle Set Bilgileri</h2>
        
        <div className="space-y-6">
          {/* Smart Code Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Smart Code (6 karakter):
              <span className="text-xs text-gray-500 ml-2">
                Örn: 001ka1 (Set-Taş-Egzersiz-Zorluk)
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={puzzleSet.id}
                onChange={handleSmartCodeChange}
                onKeyDown={handleKeyPress}
                placeholder="001ka1"
                maxLength="6"
                className={`w-full p-3 border rounded-lg font-mono text-lg tracking-wider ${
                  isSmartCodeValid 
                    ? 'border-green-300 bg-green-50' 
                    : puzzleSet.id.length > 0 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                }`}
              />
              <div className="absolute right-3 top-3">
                {isSmartCodeValid ? (
                  <span className="text-green-600">✓</span>
                ) : puzzleSet.id.length > 0 ? (
                  <span className="text-red-600">✗</span>
                ) : null}
              </div>
            </div>
            
            {/* Smart Code açıklama */}
            {isSmartCodeValid && (
              <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                <div className="text-sm text-blue-800">
                  <div><strong>Otomatik Başlık:</strong> {puzzleSet.title}</div>
                  <div><strong>Açıklama:</strong> {puzzleSet.description}</div>
                  <div className="mt-2 text-xs text-blue-600">
                    💡 Enter tuşuna basarak veya butona tıklayarak devam edebilirsiniz
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Piece Set Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Piece Set:</label>
            <select
              value={puzzleSet.pieceSet}
              onChange={(e) => setPuzzleSet({...puzzleSet, pieceSet: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="merida">Merida (Varsayılan)</option>
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="wooden">Wooden</option>
              <option value="marble">Marble</option>
            </select>
          </div>

          {/* PGN Preview */}
          {pgnPreview && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-medium text-amber-800 mb-2">📄 PGN Önizleme</h3>
              <div className="text-sm text-amber-700 space-y-1">
                <div><strong>Dosya:</strong> {pgnPreview.filename}</div>
                <div><strong>Hamle Sayısı:</strong> {pgnPreview.moveCount}</div>
                <div><strong>İlk Hamleler:</strong> {pgnPreview.firstMoves}...</div>
              </div>
            </div>
          )}

          {/* Hızlı İçe Aktarım Seçenekleri */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              🚀 Hızlı İçe Aktarım Seçenekleri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PGN Dosyası Yükleme */}
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">📁 Dosyadan Yükle</h4>
                <p className="text-sm text-green-700 mb-3">
                  PGN dosyanızı seçin
                </p>
                
                <input
                  key={fileInputKey}
                  type="file"
                  accept=".pgn,.txt"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                  id="pgn-file-input"
                />
                <label
                  htmlFor="pgn-file-input"
                  className={`cursor-pointer w-full inline-flex items-center justify-center px-4 py-2 ${
                    isProcessing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white rounded-lg text-sm`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      PGN Dosyası Seç
                    </>
                  )}
                </label>
              </div>

              {/* Manuel Puzzle Oluşturma */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">⚙️ Manuel Oluşturma</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Board editör ile puzzle oluştur
                </p>
                
                <button
                  onClick={onNext}
                  disabled={!isSmartCodeValid}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isSmartCodeValid ? '🎯 Puzzle Editörü Aç' : '⚠️ Smart Code Gerekli'}
                </button>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-600 bg-gray-50 p-3 rounded">
              <div className="font-medium mb-1">💡 İpuçları:</div>
              <div>• Smart Code girdikten sonra <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> tuşuna basabilirsiniz</div>
              <div>• PGN dosyaları otomatik parse edilir</div>
              <div>• Maksimum 18 puzzle oluşturulabilir</div>
              <div>• Varyantlar manuel eklenmelidir</div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-gray-500">
            {puzzleSet.puzzles.length > 0 && (
              <span className="text-green-600">
                ✓ {puzzleSet.puzzles.length} puzzle hazır
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onNext}
              disabled={!isSmartCodeValid}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>🎯</span>
              {puzzleSet.puzzles.length > 0 ? 'Export →' : 'Manuel Oluştur →'}
            </button>
          </div>
        </div>

        {/* Debug Button - Geçici */}
        <div className="mt-4">
          <button
            onClick={() => {
              console.log('🧪 PGN IMPORT DEBUG');
              console.log('🧪 Current puzzle set:', puzzleSet);
              console.log('🧪 Total puzzles:', puzzleSet.puzzles.length);
              
              puzzleSet.puzzles.forEach((puzzle, index) => {
                console.log(`🧪 Puzzle ${index + 1}:`);
                console.log(`  - ID: ${puzzle.id}`);
                console.log(`  - FEN: ${puzzle.fen}`);
                console.log(`  - Main Line: ${puzzle.mainLine}`);
                console.log(`  - Alternatives: ${puzzle.alternatives?.length || 0}`);
              });
            }}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
          >
            🧪 Puzzle Set Debug
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetadataStep;