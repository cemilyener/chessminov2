import React, { useState, useCallback, useEffect } from 'react';
import { usePDF } from '../hooks/usePDF';
import { usePDFStore } from '../store/usePDFStore';

/**
 * PDF önizleme ve indirme bileşeni
 */
const PDFPreview = () => {
  const { positions, settings } = usePDFStore();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  // PDF Hook'unu kullan
  const { downloadPDF, previewPDF, generatingPDF } = usePDF();
  
  // PDF önizleme URL'sini oluştur
  const generatePreview = useCallback(async () => {
    if (positions.length === 0) {
      setError('Önizleme için en az bir pozisyon eklemelisiniz.');
      setPreviewUrl(null);
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const url = await previewPDF();
      setPreviewUrl(url);
    } catch (err) {
      console.error('PDF önizleme hatası:', err);
      setError(`PDF oluşturma hatası: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [positions, previewPDF]);
  
  // PDF indir
  const handleDownload = async () => {
    if (positions.length === 0) {
      setError('İndirme için en az bir pozisyon eklemelisiniz.');
      return;
    }
    
    setError(null);
    
    try {
      const success = await downloadPDF();
      
      if (success) {
        // İndirme başarılı olduğunda bildirim göster
        alert('PDF başarıyla indirildi!');
      } else {
        throw new Error('PDF indirilemedi');
      }
    } catch (err) {
      console.error('PDF indirme hatası:', err);
      setError(`PDF indirme hatası: ${err.message}`);
    }
  };
  
  // Pozisyonlar veya ayarlar değiştiğinde önizlemeyi güncelle
  useEffect(() => {
    if (positions.length > 0) {
      // Önizlemeyi otomatik güncelle (opsiyonel)
      // generatePreview();
      
      // Varsa önceki önizleme URL'sini temizle
      return () => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      };
    }
  }, [positions, settings]);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">PDF Önizleme</h3>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          {error}
        </div>
      )}
      
      <div className="flex justify-between mb-4">
        <button
          onClick={generatePreview}
          disabled={positions.length === 0 || isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Oluşturuluyor...
            </span>
          ) : (
            'Önizle'
          )}
        </button>
        
        <button
          onClick={handleDownload}
          disabled={positions.length === 0 || generatingPDF}
          className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generatingPDF ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              İndiriliyor...
            </span>
          ) : (
            'PDF İndir'
          )}
        </button>
      </div>
      
      {positions.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 bg-gray-50">
          <p className="mb-2 text-lg">Henüz pozisyon eklenmedi</p>
          <p className="text-sm">PDF önizlemek için en az bir pozisyon ekleyin</p>
        </div>
      ) : previewUrl ? (
        <div className="border rounded-lg overflow-hidden">
          <iframe
            src={previewUrl}
            title="PDF Önizleme"
            className="w-full h-[600px]"
            style={{ border: 'none' }}
          />
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 bg-gray-50">
          <p className="mb-2 text-lg">{isGenerating ? 'PDF Oluşturuluyor...' : 'Önizleme Hazır Değil'}</p>
          <p className="text-sm">PDF önizlemek için "Önizle" butonuna tıklayın</p>
        </div>
      )}
      
      {positions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            <strong>Bilgi:</strong> PDF'de {positions.length} pozisyon ve {Math.ceil(positions.length / parseInt(settings.layoutType || '6'))} sayfa bulunuyor.
          </p>
        </div>
      )}
    </div>
  );
};

export default PDFPreview;