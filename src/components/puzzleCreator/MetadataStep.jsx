import React, { useState } from 'react';
import PgnImporter from './PgnImporter';
import SmartNamingDecoder from '@/utils/smartNaming/SmartNamingDecoder';

const MetadataStep = ({ puzzleSet, setPuzzleSet, onNext, onPgnImport, generateNextSetId }) => {
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // Smart Code değişiklik handler'ı - FIX
  const handleSmartCodeChange = (e) => {
    const code = e.target.value; // ❌ .toUpperCase() kaldır
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

  // ✅ Enter tuşu handler'ı düzelt
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isSmartCodeValid) {
      e.preventDefault();
      onNext(); // Puzzle editörüne geç
    }
  };

  // PGN dosyası yükleme handler'ı
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const pgnContent = e.target.result;
      
      // PGN içeriğini import et
      handlePgnImport({ 
        pgn: pgnContent, 
        filename: file.name,
        source: 'file_upload'
      });
      
      // File input'u reset et
      setFileInputKey(Date.now());
    };
    reader.readAsText(file);
  };

  // PGN Import handler
  const handlePgnImport = (importData) => {
    if (typeof importData === 'object' && importData.pgn) {
      const pgnText = importData.pgn;
      
      try {
        // Basit PGN parsing
        const puzzleCount = (pgnText.match(/\[FEN /g) || []).length;
        
        const autoSetId = puzzleSet.id || '001ka1';
        
        // onPgnImport fonksiyonunu çağır
        if (onPgnImport) {
          onPgnImport({
            id: autoSetId,
            title: `${importData.filename || 'İçe Aktarılan'} Puzzle Seti`,
            pieceSet: puzzleSet.pieceSet || 'merida',
            puzzles: [], // Gerçek parsing sonrası dolacak
            puzzleCount: puzzleCount
          });
        }
        
        alert(`${puzzleCount} puzzle tespit edildi!`);
        
      } catch (error) {
        alert('PGN dosyası işlenirken hata oluştu');
      }
    }
  };

  // Smart Code validation
  const isSmartCodeValid = puzzleSet.id.length === 6 && /^\d{3}[kfvsapmtrgb][aibcs][123]$/.test(puzzleSet.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Puzzle Set Bilgileri</h2>
        
        <div className="space-y-6">
          {/* Smart Code Input - ✅ onKeyDown kullan */}
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
                onKeyDown={handleKeyPress} // ✅ onKeyPress → onKeyDown
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
                  ChessBase PGN dosyanızı seçin
                </p>
                
                <input
                  key={fileInputKey}
                  type="file"
                  accept=".pgn,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pgn-file-input"
                />
                <label
                  htmlFor="pgn-file-input"
                  className="cursor-pointer w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  PGN Dosyası Seç
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
              <div>• Varyantlar otomatik hesaplanır</div>
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
            {/* ✅ Ana manuel oluştur butonu geri eklendi */}
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
      </div>
    </div>
  );
};

export default MetadataStep;