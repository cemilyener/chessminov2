import React from 'react';
import jsPDF from 'jspdf';
import Spinner from '../../common/Spinner';
import PositionEditor from './PositionEditor';
import usePdfStore from './usePdfStore';

// Türkçe karakter desteği için font ekleme (Helvetica yerine Arial kullan)
import { addFont } from 'jspdf';
// Not: Arial fontunu eklemek gerekebilir

const PDFGenerator = () => {
  const { positions, addPosition } = usePdfStore();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState(null);

  // Pozisyon ekleme fonksiyonu
  const handleAddPosition = (position) => {
    console.log('Pozisyon eklendi:', position);
    addPosition(position);
  };

  // handleGeneratePDF fonksiyonunu şu şekilde güvenli hale getirin:
  const handleGeneratePDF = async () => {
    if (positions.length === 0) {
      setError('Eklenmiş pozisyon bulunamadı.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    
    try {
      // Basitleştirilmiş PDF oluşturma
      const doc = new jsPDF({ 
        orientation: 'portrait', 
        unit: 'mm', 
        format: 'a4',
        compress: true
      });
      
      // Başlık ekle - Türkçe karakter sorununu aşmak için
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Satranc Calisma Sayfasi", 105, 15, { align: 'center' });
      
      let currentPage = 1;
      const itemsPerPage = 2;
      
      // Her pozisyon için
      for (let i = 0; i < positions.length; i++) {
        // Yeni sayfa kontrolü
        if (i > 0 && i % itemsPerPage === 0) {
          doc.addPage();
          currentPage++;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(20);
          doc.text("Satranc Calisma Sayfasi", 105, 15, { align: 'center' });
        }
        
        // Sayfa içindeki pozisyon
        const pagePos = i % itemsPerPage;
        const yOffset = 30 + (pagePos * 120); // Her pozisyon 120mm
        const pos = positions[i];
        
        // Başlık ekle
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(pos.title || `Pozisyon ${i+1}`, 15, yOffset);
        
        // Görsel ekle - kritik kısım
        if (pos.screenshot && pos.screenshot.startsWith('data:image')) {
          try {
            console.log(`Görüntü ${i} işleniyor, uzunluk: ${pos.screenshot.length}`);
            
            // Görüntüyü eklemeden önce doğrula
            const img = new Image();
            img.src = pos.screenshot;
            
            // Görüntüyü ekle - JPEG'e dönüştür (PDF için daha uyumlu)
            const imgFormat = 'JPEG';
            
            doc.addImage(
              pos.screenshot, 
              imgFormat, 
              15,  // X pozisyonu
              yOffset + 5,  // Y pozisyonu  
              80,  // Genişlik (mm)
              80,  // Yükseklik (mm)
              `pos-${i}`,  // Özel ID
              'MEDIUM'  // Hız/kalite dengesi
            );
            
            console.log(`Görüntü ${i} başarıyla eklendi`);
          } catch (imgErr) {
            console.error("Görsel PDF'e eklenirken hata:", imgErr);
            doc.setTextColor(255, 0, 0);
            doc.text(`Görsel eklenemedi: ${imgErr.message}`, 15, yOffset + 30);
            doc.setTextColor(0);
          }
        } else {
          // Eğer screenshot yoksa veya geçersizse
          console.error(`Pozisyon ${i} için geçersiz görüntü:`, 
            pos.screenshot ? pos.screenshot.substring(0, 30) + '...' : 'undefined');
          
          doc.setTextColor(255, 0, 0);
          doc.text("Tahta görüntüsü mevcut değil", 15, yOffset + 30);
          doc.setTextColor(0);
        }
        
        // Açıklama ekle
        if (pos.description) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(pos.description, 105, yOffset + 30, { 
            maxWidth: 90,
            align: 'left'
          });
        }
        
        // İlerleme güncelle
        setProgress(Math.round(((i + 1) / positions.length) * 100));
        
        // Her pozisyondan sonra kısa bekleme
        await new Promise(r => setTimeout(r, 50));
      }
      
      // Alt bilgi
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("ChessMino PDF Generator", 105, 280, {align: 'center'});
      
      // PDF'i kaydet - güvenli isim
      doc.save(`satranc_calisma_${Date.now()}.pdf`);
      
    } catch (err) {
      setError('PDF oluşturulurken bir hata oluştu: ' + err.message);
      console.error("PDF hatası:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pdf-generator-container">
      <PositionEditor onAddPosition={handleAddPosition} />
      
      <div className="my-4 flex items-center gap-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleGeneratePDF}
          disabled={positions.length === 0 || isGenerating}
        >
          PDF Oluştur
        </button>
        {isGenerating && (
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <span>{progress}%</span>
          </div>
        )}
        {error && <span className="text-red-500 ml-2">{error}</span>}
      </div>
      
      <div className="positions-list mt-6">
        <h3 className="text-lg font-medium mb-3">Eklenen Pozisyonlar ({positions.length})</h3>
        {positions.length === 0 ? (
          <p className="text-gray-500">Henüz pozisyon eklenmedi.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {positions.map((position, index) => (
              <div key={index} className="position-card p-4 border rounded shadow-sm">
                {position.screenshot ? (
                  <img 
                    src={position.screenshot}
                    alt={`Pozisyon ${index + 1}`}
                    className="mb-2"
                    style={{ maxWidth: "100%" }}
                  />
                ) : (
                  <div className="p-8 bg-gray-100 text-gray-500 text-center">
                    Görsel bulunamadı
                  </div>
                )}
                <div className="text-sm text-gray-700">
                  {position.title && <p className="font-medium">{position.title}</p>}
                  <p className="text-xs text-gray-500">{position.fen}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFGenerator;