import React from 'react';
import PDFPositionEditor from './components/PDFPositionEditor';
import PDFPositionList from './components/PDFPositionList';
import PDFSettings from './components/PDFSettings';
import PDFPreview from './components/PDFPreview';

/**
 * PDF Çalışma Sayfası Oluşturucu
 * 
 * Satranç pozisyonlarından PDF çalışma sayfaları oluşturmak için 
 * kullanılan ana bileşen.
 */
const PDFGenerator = () => {
  return (
    <div className="pdf-generator-container">
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