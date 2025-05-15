import React, { useState, useCallback } from 'react';
import PDFBoardEditor from './PDFBoardEditor';
import html2canvas from 'html2canvas';

// Debounce utility to prevent multiple rapid calls
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const PositionEditor = ({ positionId, onUpdate, onAddPosition = () => console.warn('onAddPosition prop is not provided') }) => {
  const [positionData, setPositionData] = useState({
    fen: '8/8/8/8/8/8/8/8 w - - 0 1', // Boş tahta ile başla
    moveOrder: 'white',
    title: '',
    description: ''
  });
  
  const [isCapturing, setIsCapturing] = useState(false);

  // Tahta pozisyonu değişikliklerini takip et
  const handlePositionChange = useCallback((fen, moveOrder) => {
    setPositionData(prev => ({ ...prev, fen, moveOrder }));
  }, []);

  // handleCapturePosition fonksiyonunu tamamen yeniden yazın
  const handleCapturePosition = useCallback(async ({ fen, moveOrder }) => {
    if (isCapturing) return;
    
    try {
      setIsCapturing(true);
      
      // Adım 1: DOM hazır olsun diye daha uzun bekle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Adım 2: Tahta elementini doğrudan seç
      const boardElement = document.getElementById('capture-this-board');
      
      if (!boardElement) {
        throw new Error("Tahta bileşeni bulunamadı");
      }
      
      console.log("Yakalanacak tahta boyutu:", boardElement.offsetWidth, "x", boardElement.offsetHeight);
      
      // Adım 3: html2canvas seçeneklerini basitleştir
      const canvas = await html2canvas(boardElement, {
        backgroundColor: "#fff",
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        removeContainer: false, // Klonlama problemleri için false
        onclone: (clonedDoc) => {
          // Klonlanan tahtayı bul ve onayla
          const clonedBoard = clonedDoc.getElementById('capture-this-board');
          if (clonedBoard) {
            console.log("Klonlanan tahta bulundu");
            // Stili optimize et
            clonedBoard.style.transform = 'none';
            clonedBoard.style.margin = '10px';
            clonedBoard.style.padding = '10px';
            clonedBoard.style.backgroundColor = '#fff';
            clonedBoard.style.border = '1px solid #ccc';
          } else {
            console.error("Klonlanan tahtada element bulunamadı");
          }
        }
      });
      
      // Base64 görüntü verisi oluştur (kalite parametresi: 1.0 = en yüksek)
      const screenshot = canvas.toDataURL('image/png', 1.0);
      
      // BASE64 görüntü önizlemesi
      console.log("Görüntü yakalandı, ilk 50 karakter:", screenshot.substring(0, 50));
      
      // SVG görüntülerinin düzgün yakalandığını doğrula
      if (screenshot.length < 1000 || !screenshot.includes('data:image/png;base64')) {
        console.error("Yakalanan görüntü çok küçük veya geçersiz format");
        throw new Error("Geçerli bir görüntü yakalanamadı");
      }
      
      // Yeni pozisyon oluştur
      const newPosition = {
        ...positionData,
        fen,
        moveOrder,
        screenshot,
        timestamp: Date.now()
      };

      // Güvenli şekilde ekle - 100ms gecikmeyle
      setTimeout(() => {
        onAddPosition(newPosition);
        
        // Form alanlarını temizle
        setPositionData(prev => ({
          ...prev,
          title: '',
          description: ''
        }));
      }, 100);
    } catch (error) {
      console.error("Ekran görüntüsü alınırken hata:", error);
      alert("Ekran görüntüsü alınamadı: " + error.message);
    } finally {
      setIsCapturing(false);
    }
  }, [positionData, onAddPosition, isCapturing]);

  // Debounced capture function to prevent multiple rapid captures
  const debouncedCapturePosition = useCallback(
    debounce(handleCapturePosition, 300),
    [handleCapturePosition]
  );

  return (
    <div className="position-editor">
      <h3 className="text-lg font-medium mb-3">Yeni Pozisyon</h3>
        {/* Önce tahta render edilsin */}
      <div className="board-wrapper mb-4">
        <PDFBoardEditor
          initialPosition={positionData.fen}
          moveOrder={positionData.moveOrder}
          onPositionChange={handlePositionChange}
          onCapturePosition={handleCapturePosition}
          isCapturing={isCapturing}
        />
      </div>
      
      {/* Form elemanları sonra gelsin */}
      <div className="form-fields">
        {/* Başlık giriş alanı */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Başlık
          </label>
          <input
            type="text"
            value={positionData.title}
            onChange={(e) => setPositionData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Pozisyon başlığı (opsiyonel)"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
        </div>
        
        {/* Açıklama giriş alanı */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Açıklama
          </label>
          <textarea
            value={positionData.description}
            onChange={(e) => setPositionData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Pozisyon açıklaması (opsiyonel)"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-20"
          />
        </div>
      </div>
    </div>
  );
};

export default PositionEditor;