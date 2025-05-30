// src/components/puzzleCreator/PgnImporter.jsx - YENİ BILEŞEN
import React, { useState } from 'react';
import { createStandardPuzzleSet } from '@/schemas/puzzleSetSchema';
import { convertPgnToStandardFormat } from '@/utils/pgnUtils';

const PgnImporter = ({ onImport, setId }) => {
  const [pgnText, setPgnText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handlePgnImport = async () => {
    if (!pgnText.trim()) return;
    
    setIsProcessing(true);
    try {
      // PGN'i parse et
      const puzzleData = await convertPgnToStandardFormat(pgnText, setId);
      
      // Admin editöre aktar
      onImport(puzzleData);
      
      // Modal'ı kapat
      setShowModal(false);
      setPgnText('');
      
    } catch (error) {
      console.error('PGN import hatası:', error);
      alert('PGN dosyası işlenirken hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Import Button */}
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        PGN İçe Aktar
      </button>

      {/* Import Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">PGN Dosyası İçe Aktar</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Set ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{setId}</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">PGN İçeriği:</label>
                <textarea
                  value={pgnText}
                  onChange={(e) => setPgnText(e.target.value)}
                  placeholder="PGN dosyasının içeriğini buraya yapıştırın..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={handlePgnImport}
                  disabled={!pgnText.trim() || isProcessing}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      İşleniyor...
                    </>
                  ) : (
                    'İçe Aktar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PgnImporter;