import React, { useState, useRef } from 'react';
import useChessStore from '@/store/useChessStore';

/**
 * PgnConverterToolPage - PGN dosyalarını ve metinlerini JSON formatına dönüştürmek için sayfa
 * ChessBase formatındaki PGN dosyalarını işleyip standart JSON çıktısı üretir
 */
const PgnConverterToolPage = () => {
  const { 
    loadPgnFile, 
    loadPgnText, 
    exportAsFile,
    puzzleSets, 
    currentSetIndex, 
    isLoading, 
    error 
  } = useChessStore();
  
  const [pgnText, setPgnText] = useState('');
  const fileInputRef = useRef(null);
  
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await loadPgnFile(e.target.files[0]);
      // Dosya seçici resetle
      e.target.value = null;
    }
  };
  
  const handlePgnTextSubmit = async (e) => {
    e.preventDefault();
    if (pgnText.trim()) {
      await loadPgnText(pgnText);
      // Başarılı yükleme sonrası temizle
      setPgnText('');
    }
  };
  
  const loadSamplePgn = async () => {
    try {
      const response = await fetch('/fc3.pgn');
      const text = await response.text();
      setPgnText(text);
    } catch (err) {
      console.error("Örnek PGN yüklenirken hata oluştu:", err);
    }
  };
  
  const handleExportCurrentSet = () => {
    if (currentSetIndex >= 0) {
      exportAsFile(currentSetIndex);
    }
  };
  
  return (
    <div className="pgn-json-converter p-4">
      <h2 className="text-2xl font-bold mb-4">PGN → JSON Dönüştürücü</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">PGN Dosyası Yükle</h3>
        <div className="flex items-center gap-4">
          <input 
            type="file"
            ref={fileInputRef}
            accept=".pgn"
            onChange={handleFileChange}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            PGN Dosyası Seç
          </button>
          <span className="text-gray-600">veya</span>
          <button
            onClick={loadSamplePgn}
            disabled={isLoading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Örnek PGN Yükle
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">PGN Metni Yapıştır</h3>
        <form onSubmit={handlePgnTextSubmit}>
          <textarea 
            value={pgnText}
            onChange={(e) => setPgnText(e.target.value)}
            placeholder="PGN metnini buraya yapıştırın..."
            disabled={isLoading}
            className="w-full h-64 p-2 border border-gray-300 rounded mb-2"
          />
          <button
            type="submit"
            disabled={isLoading || !pgnText.trim()}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? 'İşleniyor...' : 'PGN Metnini İşle'}
          </button>
        </form>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2">İşleniyor...</span>
        </div>
      )}
      
      {puzzleSets.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Dönüştürülen Puzzle Setleri</h3>
          <div className="overflow-auto max-h-96 border border-gray-200 rounded p-4">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Başlık</th>
                  <th className="px-4 py-2 text-left">Puzzle Sayısı</th>
                  <th className="px-4 py-2 text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {puzzleSets.map((set, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{set.metadata?.title || "İsimsiz Set"}</td>
                    <td className="px-4 py-2">{set.puzzles?.length || 0}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => exportAsFile(index)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        JSON İndir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {currentSetIndex >= 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">JSON Önizleme</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(puzzleSets[currentSetIndex], null, 2)}
              </pre>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleExportCurrentSet}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Şu Anki Seti JSON Olarak İndir
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PgnConverterToolPage;