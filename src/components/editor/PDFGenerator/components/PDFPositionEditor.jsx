import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { usePDFStore } from '../store/usePDFStore';
import { toPng } from 'html-to-image';
import BasicBoardPage from '../../../board/BasicBoardPage';

/**
 * PDFPositionEditor - PDF için pozisyon düzenleyici bileşeni
 * BasicBoardPage'i satranç pozisyonları oluşturmak için kullanır
 */
const PDFPositionEditor = () => {
  // Store'dan gerekli state ve action'ları al
  const addPosition = usePDFStore(state => state.addPosition);
  const currentPositionId = usePDFStore(state => state.currentPositionId);
  const positions = usePDFStore(state => state.positions);
  const updatePosition = usePDFStore(state => state.updatePosition);

  // Form state'leri
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  
  // Referanslar
  const boardRef = useRef(null);
  const captureRef = useRef(null);
  const editMode = currentPositionId ? 'edit' : 'create';

  // Eğer düzenleme modundaysa, mevcut pozisyonu yükle
  useEffect(() => {
    if (currentPositionId) {
      const currentPosition = positions.find(p => p.id === currentPositionId);
      if (currentPosition) {
        setTitle(currentPosition.title || '');
        setDescription(currentPosition.description || '');
        setFen(currentPosition.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      }
    } else {
      // Yeni pozisyon için alanları sıfırla
      setTitle('');
      setDescription('');
      setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    }
  }, [currentPositionId, positions]);

  // FEN değişikliğini işle - memoize
  const handleFenChange = useCallback((newFen) => {
    setFen(newFen);
  }, []);

  // FEN'den hamle sırasını belirle
  const moveOrder = useMemo(() => {
    const fenParts = fen.split(' ');
    return fenParts.length > 1 && fenParts[1] === 'b' ? 'black' : 'white';
  }, [fen]);

  // Ekran görüntüsü al ve pozisyon kaydet
  const captureAndSave = useCallback(async () => {
    if (!captureRef.current) {
      setError('Tahta bulunamadı');
      return;
    }

    try {
      setIsCapturing(true);
      setError(null);

      // html-to-image kütüphanesi ile görüntü alın
      const screenshot = await toPng(captureRef.current, {
        quality: 1.0,
        pixelRatio: 2, // Daha yüksek çözünürlük için
        backgroundColor: '#FFFFFF',
        style: {
          // Yazdırma için özel stiller
          boxShadow: 'none',
          border: '1px solid #ccc'
        }
      });

      // Pozisyon objesi oluştur
      const position = {
        fen,
        title: title || `Pozisyon ${positions.length + 1}`,
        description,
        moveOrder,
        screenshot
      };

      // Store'a kaydet
      if (editMode === 'edit' && currentPositionId) {
        updatePosition(currentPositionId, position);
      } else {
        addPosition(position);
      }

      // Yeni pozisyon eklediyse alanları temizle
      if (editMode === 'create') {
        setTitle('');
        setDescription('');
        // FEN'i sıfırlama - bunun yerine kullanıcının düzenlemeye devam etmesine izin ver
      }

    } catch (err) {
      console.error('Pozisyon kaydedilirken hata:', err);
      setError(`Hata: ${err.message}`);
    } finally {
      setIsCapturing(false);
    }
  }, [fen, title, description, moveOrder, positions.length, editMode, currentPositionId, updatePosition, addPosition]);

  return (
    <div className="pdf-position-editor bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">
        {editMode === 'edit' ? 'Pozisyon Düzenle' : 'Yeni Pozisyon Oluştur'}
      </h3>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          {error}
        </div>
      )}      
      
      {/* Yakalama için optimize edilmiş konteyner */}
      <div className="board-container mb-6" ref={boardRef}>
        <div 
          id="capture-this-board" 
          className="relative bg-white p-4 rounded border border-gray-300" 
          ref={captureRef}
        >
          {/* Sabit genişlik ve yükseklikli div, ölçekli çıktı için */}
          <div style={{ width: '400px', height: 'auto', margin: '0 auto' }}>
            <BasicBoardPage 
              onFenChange={handleFenChange}
              initialFen={fen}
              hideHeader={true}
              hideFooter={true}
              hideControls={false} // Kontrolleri göster
              compact={true} // Kompakt mod
              customWidth={400} // Sabit genişlik
              key={`board-${currentPositionId || 'new'}`} // Yalnızca gerektiğinde yeniden render
            />
            
            {/* Hamle göstergesi */}
            <div className="text-center mt-2 py-2 font-medium">
              {moveOrder === 'white' ? 'Hamle Beyazda' : 'Hamle Siyahta'}
            </div>
          </div>
        </div>
      </div>

      {/* Form alanları */}
      <div className="form-fields space-y-4">
        <div>
          <label htmlFor="position-title" className="block text-sm font-medium mb-1 text-gray-700">
            Başlık
          </label>
          <input
            id="position-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Pozisyon başlığı"
          />
        </div>

        <div>
          <label htmlFor="position-description" className="block text-sm font-medium mb-1 text-gray-700">
            Açıklama
          </label>
          <textarea
            id="position-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Pozisyon açıklaması"
            rows={3}
          />
        </div>

        <div className="pt-2">
          <button
            onClick={captureAndSave}
            disabled={isCapturing}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isCapturing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                İşleniyor...
              </>
            ) : editMode === 'edit' ? (
              'Pozisyonu Güncelle'
            ) : (
              'Pozisyonu Ekle'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// React.memo kullanarak gereksiz yeniden render'ları engelle
export default React.memo(PDFPositionEditor);