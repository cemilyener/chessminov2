import React, { useState, useEffect } from 'react';
import useChessStore from '../../store/useChessStore';
import PgnImporter from './PgnImporter';
import ChessBoard from '../chess/ChessBoard';

const BoardEditor = () => {
  const loadPgnText = useChessStore(state => state.loadPgnText);
  const currentFen = useChessStore(state => state.currentFen);
  const variations = useChessStore(state => state.variations);
  const puzzleSets = useChessStore(state => state.puzzleSets);
  const isLoading = useChessStore(state => state.isLoading);
  const error = useChessStore(state => state.error);
  const getAlternatives = useChessStore(state => state.getAlternatives);
  const switchVariant = useChessStore(state => state.switchVariant);
  const alternatives = useChessStore(state => state.alternatives);
  
  // PGN yüklendikten sonra hemen test için gösterilecek durum
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    getAlternatives();
  }, [getAlternatives, currentFen]);

  const handleVariantClick = (targetNodeId) => {
    switchVariant(targetNodeId);
  };

  // PGN içeri aktarma işleyicisi
  const handlePgnImport = async (pgnText) => {
    try {
      // PGN metnini ChessContentManager'a yükle
      const success = await loadPgnText(pgnText);
      
      if (success) {
        // İçe aktarma başarılı, sonuçları göster
        setImportResult({
          success: true,
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        // İçe aktarma başarısız
        setImportResult({
          success: false,
          error: "PGN yüklenemedi",
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch (error) {
      console.error("PGN yükleme hatası:", error);
      setImportResult({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Satranç Tahtası Editörü</h2>
      
      {/* PGN İmport Bileşeni */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <PgnImporter onImport={handlePgnImport} />
      </div>
      
      {/* Yükleme Durumu ve Hatalar */}
      {isLoading && <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 text-blue-700">Yükleniyor...</div>}
      {error && <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 text-red-700">Hata: {error}</div>}
      
      {/* İçe Aktarma Sonuçları */}
      {importResult && (
        <div className={`border-l-4 p-4 mb-6 ${importResult.success ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`}>
          <h3 className="font-bold">
            PGN İçe Aktarma {importResult.success ? 'Başarılı!' : 'Başarısız!'} 
            ({importResult.timestamp})
          </h3>
          {importResult.error && <div className="mt-2">Hata: {importResult.error}</div>}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Satranç Tahtası */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Güncel Pozisyon</h3>
            <div className="w-full max-w-md mx-auto">
              <ChessBoard position={currentFen} />
            </div>
          </div>
          
          {/* Alternatif Hamleler */}
          {alternatives.length > 1 && (
            <div className="bg-white p-4 rounded-lg shadow-md mt-6">
              <h4 className="text-lg font-semibold mb-3 text-gray-700">Alternatif Hamleler:</h4>
              <ul className="space-y-1">
                {alternatives.map(alt => (
                  <li 
                    key={alt.nodeId}
                    className={`cursor-pointer py-2 px-3 rounded ${alt.isMainLine ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => handleVariantClick(alt.nodeId)}
                  >
                    {alt.move?.san || `${alt.move?.from}-${alt.move?.to}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Debug Bilgileri */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Debug Bilgileri</h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <span className="font-medium">Mevcut FEN:</span> 
                <span className="font-mono text-sm block mt-1 p-2 bg-gray-100 rounded">{currentFen}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <span className="font-medium">Puzzle Set Sayısı:</span> {puzzleSets.length}
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <h4 className="font-semibold text-lg mb-2">Varyantlar ({variations?.length || 0}):</h4>
                {variations && variations.length > 0 ? (
                  <ul className="space-y-2 mt-3">
                    {variations.map((variant, idx) => (
                      <li key={idx} className="p-3 bg-gray-100 rounded-md">
                        <span className="font-semibold">Varyant #{idx+1}:</span> 
                        <div className="mt-1">
                          <span className="text-sm text-gray-600">Başlangıç hamle indeksi:</span> {variant.startMoveIndex}
                        </div>
                        <div className="mt-1">
                          <span className="text-sm text-gray-600">Hamleler:</span> {variant.moves?.join(', ') || "Hamle yok"}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">Varyant bulunamadı.</p>
                )}
              </div>
              
              {/* JSON Çıktı */}
              {puzzleSets.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-lg mb-2">İlk Puzzle Seti JSON:</h4>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-x-auto text-xs">
                    {JSON.stringify(puzzleSets[0], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardEditor;
