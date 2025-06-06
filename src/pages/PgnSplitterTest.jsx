// Test için src/pages/PgnSplitterTest.jsx oluştur:
import React, { useState } from 'react';
import { testPgnSplitter, debugGame } from '../utils/pgn/PgnGameSplitter';
import { testParser } from '../utils/pgn/PgnMoveParser';
import { testFenCalculator } from '../utils/pgn/FenCalculator';
import { testConverter, saveJsonToFile } from '../utils/pgn/PgnToJsonConverter'; // ⭐ EKLE

const PgnSplitterTest = () => {
  const [testResult, setTestResult] = useState('');
  const [parserResult, setParserResult] = useState('');
  const [fenResult, setFenResult] = useState(''); // ⭐ EKLE
  const [converterResult, setConverterResult] = useState(''); // ⭐ EKLE
  
  const runTest = async () => {
    try {
      // fc3.pgn içeriğini yükle
      const response = await fetch('/DevNotes/fc3.pgn');
      const pgnContent = await response.text();
      
      // Console'da test çalıştır
      console.clear();
      const games = testPgnSplitter(pgnContent);
      
      setTestResult(`✅ Başarılı! ${games.length} oyun bulundu.`);
      
      // İlk oyunu detaylı göster
      if (games.length > 0) {
        console.log('\n🎮 İlk Oyun Detayları:');
        debugGame(games[0], 0);
      }
      
    } catch (error) {
      console.error('❌ Test hatası:', error);
      setTestResult(`❌ Hata: ${error.message}`);
    }
  };

  // ⭐ YENİ TEST FONKSİYONU
  const runParserTest = async () => {
    try {
      const response = await fetch('/DevNotes/fc3.pgn');
      const pgnContent = await response.text();
      
      const games = testPgnSplitter(pgnContent);
      
      if (games.length > 0) {
        console.log('\n🔍 PGN Move Parser Test Başlatılıyor...');
        
        // İlk oyunun hamle metnini test et
        const firstGame = games[0];
        console.log('Test oyunu moves:', firstGame.moves);
        
        const result = testParser(firstGame.moves);
        
        setParserResult(`✅ Parser Test: ${result.mainLine.length} ana hamle, ${result.variants.length} varyant`);
        
        // Manuel test de ekle
        console.log('\n🧪 Manuel Test:');
        const manualTest = "1... Bxd7 2. Kd2 Bxa4 3. Ke1 Bxc2 4. Kd2 Bxg6 5. Ke1 Bxh5 6. Kd2 Bxf3 7. Ke1 Bxg2 (7... Bxd5 8. Kd2 Bxg2) 8. Kd2 Bxd5 0-1";
        testParser(manualTest);
        
      } else {
        setParserResult('❌ Oyun bulunamadı');
      }
      
    } catch (error) {
      console.error('❌ Parser test hatası:', error);
      setParserResult(`❌ Hata: ${error.message}`);
    }
  };

  // ⭐ YENİ FEN TEST FONKSİYONU
  const runFenTest = () => {
    try {
      console.log('\n🧪 FEN Calculator Test Başlatılıyor...');
      
      const result = testFenCalculator();
      
      setFenResult('✅ FEN Calculator test tamamlandı!');
      
      // Gerçek PGN verisi ile de test et
      console.log('\n🎯 Gerçek PGN Test:');
      testRealPgnData();
      
    } catch (error) {
      console.error('❌ FEN test hatası:', error);
      setFenResult(`❌ Hata: ${error.message}`);
    }
  };

  // Gerçek PGN verisini test et
  const testRealPgnData = async () => {
    const response = await fetch('/DevNotes/fc3.pgn');
    const pgnContent = await response.text();
    
    const games = testPgnSplitter(pgnContent);
    
    if (games.length > 0) {
      const game = games[0];
      console.log('🎮 Gerçek oyun test:', {
        fen: game.fen,
        moves: game.moves.substring(0, 50) + '...'
      });
      
      // İlk birkaç hamleyi test et
      const moves = ["Bxd7", "Kd2", "Bxa4"];
      console.log('🔍 Test hamleleri:', moves);
      
      const { calculateMovesWithFen } = await import('../utils/pgn/FenCalculator');
      const result = calculateMovesWithFen(game.fen, moves);
      
      console.log('📊 FEN Test Sonuçları:');
      result.forEach((item, i) => {
        console.log(`  [${i}] Move: ${item.move}`);
        console.log(`      FEN: ${item.fen.split(' ')[0]}`);
        console.log(`      Valid: ${item.fen !== game.fen || i === 0}`);
      });
    }
  };

  // ⭐ YENİ CONVERTER TEST FONKSİYONU
  const runConverterTest = async () => {
    try {
      console.log('\n🚀 PGN to JSON Converter Test Başlatılıyor...');
      
      // fc3.pgn içeriğini yükle
      const response = await fetch('/DevNotes/fc3.pgn');
      const pgnContent = await response.text();
      
      // Converter'ı test et
      const result = testConverter(pgnContent, "003fc3");
      
      setConverterResult(`✅ Converter test tamamlandı! ${result.puzzleCount} puzzle oluşturuldu.`);
      
      // Eğer beklenen sayıda puzzle oluşturulduysa JSON'u indir
      if (result.puzzleCount === 18) {
        console.log('\n💾 JSON dosyası indiriliyor...');
        saveJsonToFile(result);
        setConverterResult(prev => prev + '\n📥 JSON dosyası indirildi!');
      } else {
        console.warn(`⚠️ Beklenen puzzle sayısı 18, elde edilen: ${result.puzzleCount}`);
      }
      
    } catch (error) {
      console.error('❌ Converter test hatası:', error);
      setConverterResult(`❌ Hata: ${error.message}`);
    }
  };

  // ⭐ YENİ DEMO FONKSİYONU
  const runLiveDemo = () => {
    return (
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">🎯 Live Demo</h3>
        <p className="mb-4">Converter artık SimplePuzzleCreator'da kullanılabilir!</p>
        
        <div className="space-y-2">
          <div>📍 <strong>Konum:</strong> Puzzle Creator → Metadata Step</div>
          <div>📥 <strong>Özellik:</strong> PGN Upload → JSON Download</div>
          <div>🎮 <strong>Test URL:</strong> <code>/create-puzzle</code></div>
        </div>
        
        <a 
          href="/create-puzzle" 
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🚀 Puzzle Creator'a Git
        </a>
      </div>
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🧪 PGN Test Suite</h1>
      
      {/* Game Splitter Test */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">1. Game Splitter Test</h2>
        <button 
          onClick={runTest}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🎮 fc3.pgn Splitter Test
        </button>
        
        {testResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            {testResult}
          </div>
        )}
      </div>

      {/* Move Parser Test */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">2. Move Parser Test</h2>
        <button 
          onClick={runParserTest}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          🔍 Varyant Parser Test
        </button>
        
        {parserResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            {parserResult}
          </div>
        )}
      </div>

      {/* FEN Calculator Test */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">3. FEN Calculator Test</h2>
        <button 
          onClick={runFenTest}
          className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          🧮 FEN Calculator Test
        </button>
        
        {fenResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            {fenResult}
          </div>
        )}
      </div>

      {/* PGN to JSON Converter Test */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">4. PGN to JSON Converter Test</h2>
        <button 
          onClick={runConverterTest}
          className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          🔄 PGN → JSON Converter Test
        </button>
        
        {converterResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-line">
            {converterResult}
          </div>
        )}
      </div>

      {/* Live Demo */}
      <div className="mb-6">
        {runLiveDemo()}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        Sonuçları görmek için Developer Console'u açın (F12)
      </div>
    </div>
  );
};

export default PgnSplitterTest;