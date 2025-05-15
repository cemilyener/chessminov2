import html2canvas from 'html2canvas';

/**
 * Tahta görüntüsünü canvas'a çevirerek PNG formatında görüntü döndürür
 * @param {HTMLElement} boardElement - Görüntüsü alınacak tahta elementi
 * @param {Object} options - Görüntü alınırken kullanılacak opsiyonlar
 * @returns {Promise<string>} PNG formatında base64 kodlu görüntü
 */
export const captureBoard = async (boardElement, options = {}) => {
  if (!boardElement) {
    console.error('Tahta elementi bulunamadı');
    return null;
  }

  try {
    // Canvas ayarları - Varsayılan değerler yüksek kalite için optimize edilmiştir
    const canvasOptions = {
      backgroundColor: null, // Şeffaf arkaplan
      scale: options.scale || 2, // Yüksek çözünürlük için 2x ölçek
      logging: false,
      useCORS: true, // Cross-origin kaynakları etkinleştir
      allowTaint: true, // Harici görüntülere izin ver
      ...options
    };

    // Canvas'a çevir
    const canvas = await html2canvas(boardElement, canvasOptions);
    
    // PNG formatına dönüştür
    return canvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Görüntü alınırken hata oluştu:', error);
    return null;
  }
};

/**
 * Tahta görüntüsünü alıp store'a kaydetmek için yardımcı hook
 * @param {Function} updatePositionScreenshot - Store'dan gelen güncelleme fonksiyonu
 * @returns {{captureAndSave: Function}} Yakalama ve kaydetme fonksiyonu
 */
export const useBoardCapture = (updatePositionScreenshot) => {
  /**
   * Tahta elementinin görüntüsünü al ve store'a kaydet
   * @param {number} positionId - Pozisyon ID'si
   * @param {React.RefObject} boardRef - Tahta elementinin ref'i
   */
  const captureAndSave = async (positionId, boardRef) => {
    if (!boardRef.current) {
      console.error('Tahta referansı geçerli değil');
      return;
    }

    // Tahta elementini seç - react-chessboard içerisindeki board elementi
    const boardElement = boardRef.current.querySelector('.board-container');
    if (!boardElement) {
      console.error('Tahta elementi bulunamadı');
      return;
    }

    try {
      // Görüntüyü al
      const screenshot = await captureBoard(boardElement);
      
      // Görüntüyü store'a kaydet
      if (screenshot) {
        updatePositionScreenshot(positionId, screenshot);
      }
    } catch (error) {
      console.error('Görüntü yakalama hatası:', error);
    }
  };

  return { captureAndSave };
};

export default {
  captureBoard,
  useBoardCapture
};