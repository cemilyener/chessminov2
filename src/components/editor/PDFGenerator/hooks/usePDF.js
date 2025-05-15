import { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { usePDFStore } from '../store/usePDFStore';

export const usePDF = () => {
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [error, setError] = useState(null);
  const { positions, settings } = usePDFStore();

  // A4 boyutları (mm cinsinden)
  const pageSizes = {
    A4: {
      portrait: { width: 210, height: 297 },
      landscape: { width: 297, height: 210 }
    }
  };

  // PDF oluşturma fonksiyonu
  const generatePDF = useCallback(async () => {
    if (positions.length === 0) {
      setError('Lütfen en az bir pozisyon ekleyin');
      return null;
    }

    setGeneratingPDF(true);
    setError(null);

    try {
      // PDF boyutları ve yönü
      const pageSize = pageSizes[settings.pageSize || 'A4'][settings.orientation || 'portrait'];
      const doc = new jsPDF({
        orientation: settings.orientation || 'portrait',
        unit: 'mm',
        format: settings.pageSize || 'a4'
      });

      // Yazı tipleri
      doc.setFont('helvetica');
      
      // Başlık ve üst bilgi
      doc.setFontSize(18);
      doc.text(settings.title || 'Satranç Çalışma Sayfası', pageSize.width / 2, 15, { align: 'center' });
      
      // Alt bilgi
      if (settings.author || settings.schoolName) {
        doc.setFontSize(10);
        const footerText = [
          settings.author && `Hazırlayan: ${settings.author}`,
          settings.schoolName && `Okul: ${settings.schoolName}`
        ].filter(Boolean).join(' | ');
        
        doc.text(footerText, pageSize.width / 2, pageSize.height - 10, { align: 'center' });
      }

      // Logo ekleme (varsa)
      if (settings.schoolLogo) {
        try {
          doc.addImage(settings.schoolLogo, 'PNG', 15, 10, 20, 20);
        } catch (logoError) {
          console.error('Logo eklenirken hata:', logoError);
        }
      }

      // Layout tipine göre pozisyonları yerleştir
      const layoutConfig = {
        '1': { cols: 1, rows: 1 },
        '2': { cols: 1, rows: 2 },
        '4': { cols: 2, rows: 2 },
        '6': { cols: 2, rows: 3 },
        '8': { cols: 2, rows: 4 }
      };

      const layout = layoutConfig[settings.layoutType] || layoutConfig['6'];
      
      // Pozisyonları sayfaya göre düzenle
      const positionsPerPage = layout.cols * layout.rows;
      
      // Sayfa içi margin
      const margin = 20;
      const contentWidth = pageSize.width - (2 * margin);
      const contentHeight = pageSize.height - (2 * margin) - 35; // Başlık ve alt bilgi için ek boşluk
      
      // Her hücre için boyutlar
      const cellWidth = contentWidth / layout.cols;
      const cellHeight = contentHeight / layout.rows;
      
      let currentPage = 0;
      
      // Tüm pozisyonları yerleştir
      for (let i = 0; i < positions.length; i++) {
        const position = positions[i];
        
        // Yeni sayfa gerekiyor mu?
        if (i > 0 && i % positionsPerPage === 0) {
          doc.addPage();
          currentPage++;
        }
        
        // Pozisyonun grid içindeki konumu
        const positionIndexOnPage = i % positionsPerPage;
        const col = positionIndexOnPage % layout.cols;
        const row = Math.floor(positionIndexOnPage / layout.cols);
        
        const x = margin + (col * cellWidth);
        const y = margin + (row * cellHeight) + 25; // Başlık için biraz ek boşluk
        
        // Pozisyon başlığı
        doc.setFontSize(12);
        doc.text(position.title || `Pozisyon ${i+1}`, x + (cellWidth / 2), y - 10, { align: 'center' });
        
        // Eğer ekran görüntüsü varsa ekle
        if (position.screenshot) {
          try {
            // 90% doluluk oranı
            const imageWidth = cellWidth * 0.9;
            const imageHeight = (cellHeight * 0.6) * 0.9;
            doc.addImage(position.screenshot, 'PNG', x + (cellWidth - imageWidth) / 2, y, imageWidth, imageHeight);
            
            // Açıklama ekle
            if (position.description) {
              doc.setFontSize(10);
              const descriptionY = y + imageHeight + 5;
              
              const splitDescription = doc.splitTextToSize(
                position.description,
                cellWidth * 0.9
              );
              
              doc.text(splitDescription, x + (cellWidth / 2), descriptionY, { 
                align: 'center',
                maxWidth: cellWidth * 0.9
              });
            }
          } catch (imgError) {
            console.error(`Pozisyon ${i+1} görüntüsü eklenirken hata:`, imgError);
            
            // Görüntü eklenemediğinde hata mesajı göster
            doc.setFontSize(10);
            doc.setTextColor(255, 0, 0);
            doc.text('Görüntü eklenemedi', x + (cellWidth / 2), y + 20, { align: 'center' });
            doc.setTextColor(0, 0, 0);
          }
        } else {
          // Ekran görüntüsü yoksa FEN pozisyonunu yaz
          doc.setFontSize(10);
          doc.text(`FEN: ${position.fen || 'Mevcut değil'}`, x + (cellWidth / 2), y + 20, { align: 'center' });
        }
      }

      setGeneratingPDF(false);
      return doc;
      
    } catch (err) {
      console.error('PDF oluşturma hatası:', err);
      setError(`PDF oluşturma hatası: ${err.message}`);
      setGeneratingPDF(false);
      return null;
    }
  }, [positions, settings]);

  // PDF'i indir
  const downloadPDF = useCallback(async () => {
    const doc = await generatePDF();
    if (doc) {
      doc.save(`${settings.title || 'satranc-calisma-sayfasi'}.pdf`);
      return true;
    }
    return false;
  }, [generatePDF, settings.title]);

  // PDF'i ön izleme (blob URL olarak döner)
  const previewPDF = useCallback(async () => {
    const doc = await generatePDF();
    if (doc) {
      const blob = doc.output('blob');
      return URL.createObjectURL(blob);
    }
    return null;
  }, [generatePDF]);

  return {
    generatePDF,
    downloadPDF,
    previewPDF,
    generatingPDF,
    error
  };
};