// src/components/editor/PgnImporter.jsx
import { useState, useRef } from 'react';
import { convertPgnToChessMinoFormat } from '../../utils/chess/pgnUtils';

/**
 * PGN dosyalarını içe aktarma bileşeni
 */
export default function PgnImporter() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // PGN dosyasını işle
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    
    try {
      // Dosyayı oku
      const fileContent = await readFileAsText(file);
      
      // PGN'i dönüştür
      const puzzleSet = convertPgnToChessMinoFormat(fileContent, {
        id: '', // Otomatik oluşturulsun
        fileName: file.name
      });
      
      setResult(puzzleSet);
    } catch (err) {
      console.error("PGN işleme hatası:", err);
      setError(err.message || "PGN dosyası işlenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Dosyayı metin olarak oku
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  // Sonucu kopyala
  const copyToClipboard = () => {
    if (!result) return;
    
    const json = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(json)
      .then(() => alert("JSON kopyalandı!"))
      .catch(err => console.error("Kopyalama hatası:", err));
  };

  // Dosyayı indir
  const downloadJson = () => {
    if (!result) return;
    
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.id || 'puzzle_set'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">PGN İçe Aktar</h2>
      
      {/* Dosya yükleme */}
      <div className="mb-4">
        <input
          type="file"
          ref={fileInputRef}
          accept=".pgn"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          PGN Dosyası Seç
        </button>
      </div>

      {/* Yükleniyor göstergesi */}
      {loading && (
        <div className="my-4 text-center">
          <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2">PGN işleniyor...</p>
        </div>
      )}

      {/* Hata mesajı */}
      {error && (
        <div className="my-4 p-4 bg-red-100 text-red-700 rounded-lg">
          <p className="font-bold">Hata:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Sonuç */}
      {result && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Dönüştürme Başarılı</h3>
            <div className="space-x-2">
              <button 
                onClick={copyToClipboard}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                Kopyala
              </button>
              <button 
                onClick={downloadJson}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
              >
                İndir
              </button>
            </div>
          </div>
          
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="mb-3">
              <span className="font-bold">ID:</span> {result.id}<br/>
              <span className="font-bold">Başlık:</span> {result.title}<br/>
              <span className="font-bold">Puzzle Sayısı:</span> {result.puzzles?.length || 0}
            </div>
            
            <div className="max-h-96 overflow-y-auto bg-gray-800 text-green-300 p-3 rounded font-mono text-sm">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}