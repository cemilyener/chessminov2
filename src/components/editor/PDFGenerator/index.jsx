import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePDFStore from '../../store/usePDFStore';
import PDFGeneratorPage from './PDFGenerator';
import PDFGeneratorMain from './components/PDFGeneratorMain';
import PDFRenderer from './components/PDFRenderer';
import ChessboardCapture from './components/ChessboardCapture';
import * as ImageProcessorUtils from './utils/imageProcessor';

// Re-export all components
export { PDFGeneratorPage, PDFGeneratorMain, PDFRenderer, ChessboardCapture, ImageProcessorUtils };

/**
 * PDF Çalışma Sayfası Oluşturucu
 * 
 * Satranç pozisyonlarından PDF çalışma sayfaları oluşturmak için 
 * kullanılan ana bileşen.
 * 
 * Bu bileşen geriye uyumluluk için korunmuştur.
 */
const PDFGenerator = () => {
  const navigate = useNavigate();
  const { positions } = usePDFStore();
  
  const goToWorksheet = () => {
    navigate('/worksheet');
  };
  
  return (
    <div className="pdf-generator-container">
      {/* Floating button to access worksheet */}      {positions && positions.length > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={goToWorksheet}
            className="flex items-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg text-lg"
            title="6 diyagramlı çalışma sayfası görünümüne git"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Çalışma Sayfasını Oluştur
          </button>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6">Satranç Çalışma Sayfası Oluşturucu</h2>
      
      <p className="text-gray-600 mb-6">
        Satranç pozisyonlarını düzenleyip PDF çalışma sayfası olarak indirebilirsiniz.
        Önce sol taraftaki editör ile pozisyonları oluşturun, sonra PDF ayarlarını yapılandırın
        ve "PDF İndir" butonu ile çalışma sayfanızı indirin.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Panel - Pozisyon Editörü */}
        <div className="lg:col-span-1">
          <PDFPositionEditor />
        </div>
        
        {/* Orta Panel - Pozisyon Listesi ve Ayarlar */}
        <div className="lg:col-span-1 space-y-6">
          <PDFPositionList />
          <PDFSettings />
        </div>
        
        {/* Sağ Panel - PDF Önizleme */}
        <div className="lg:col-span-1">
          <PDFPreview />
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;