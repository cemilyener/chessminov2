import React, { useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { usePDFStore } from '../store/usePDFStore';
import BasicBoardPage from '../../../board/BasicBoardPage';

const PositionEditor = () => {
  // Zustand store'dan fonksiyonları al
  const addPosition = usePDFStore(state => state.addPosition);
  const updatePosition = usePDFStore(state => state.updatePosition);
  const currentPositionId = usePDFStore(state => state.currentPositionId);
  const positions = usePDFStore(state => state.positions);

  // State'ler
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moveOrder, setMoveOrder] = useState('white');
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);

  // Ref'ler
  const captureRef = useRef(null);

  // Düzenleme modu mu yoksa yeni oluşturma modu mu?
  const editMode = currentPositionId ? 'edit' : 'create';

  // Mevcut pozisyonu yükle (eğer düzenleme modundaysa)
  React.useEffect(() => {
    if (currentPositionId) {
      const position = positions.find(p => p.id === currentPositionId);
      if (position) {
        setTitle(position.title || '');
        setDescription(position.description || '');
        setMoveOrder(position.moveOrder || 'white');
        setFen(position.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      }
    }
  }, [currentPositionId, positions]);

  // FEN değişikliklerini işle
  const handleFenChange = useCallback((newFen) => {
    setFen(newFen);
    
    // FEN'den hamle sırasını belirle
    const fenParts = newFen.split(' ');
    if (fenParts.length > 1) {
      setMoveOrder(fenParts[1] === 'w' ? 'white' : 'black');
    }
  }, []);

  // Hamle sırasını değiştir
  const handleMoveOrderChange = useCallback((e) => {
    const newMoveOrder = e.target.value;
    setMoveOrder(newMoveOrder);
    
    // FEN'deki hamle sırasını güncelle
    const fenParts = fen.split(' ');
    if (fenParts.length > 1) {
      fenParts[1] = newMoveOrder === 'white' ? 'w' : 'b';
      setFen(fenParts.join(' '));
    }
  }, [fen]);

  // Pozisyonu yakala ve kaydet
  const capturePosition = useCallback(async () => {
    if (!captureRef.current) {
      setError('Yakalanacak tahta elementi bulunamadı');
      return;
    }

    setIsCapturing(true);
    setError(null);
    
    try {
      console.log('Pozisyon yakalanıyor...');
      
      // html-to-image ile görüntüyü yakala
      const screenshot = await toPng(captureRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        width: 400,
        height: 400,
        backgroundColor: '#FFFFFF',
        style: {
          transform: 'none',
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
      
      console.log('Pozisyon başarıyla yakalandı ve eklendi');
      
      // Yeni pozisyon eklediyse form alanlarını temizle
      if (editMode === 'create') {
        setTitle('');
        setDescription('');
        // FEN'i sıfırlama - kullanıcının düzenlemeye devam etmesine izin ver
      }
    } catch (error) {
      console.error('Pozisyon yakalama hatası:', error);
      setError('Hata: ' + error.message);
    } finally {
      setIsCapturing(false);
    }
  }, [fen, title, description, moveOrder, positions.length, editMode, currentPositionId, updatePosition, addPosition]);

  return (
    <div className="position-editor">
      <h3 className="text-xl font-bold mb-4">
        {editMode === 'edit' ? 'Pozisyon Düzenle' : 'Yeni Pozisyon Oluştur'}
      </h3>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6" ref={captureRef}>
        <div style={{ width: '400px', height: '400px', margin: '0 auto' }}>
          <BasicBoardPage
            onFenChange={handleFenChange}
            initialFen={fen}
            hideHeader={true}
            hideFooter={true}
            compact={true}
            customWidth={400}
          />
          
          <div className="text-center mt-2 py-2 font-medium">
            {moveOrder === 'white' ? 'Hamle Beyazda' : 'Hamle Siyahta'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label htmlFor="moveOrder" className="block text-sm font-medium mb-1">
            Hamle Sırası
          </label>
          <select
            id="moveOrder"
            value={moveOrder}
            onChange={handleMoveOrderChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="white">Beyaz</option>
            <option value="black">Siyah</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Başlık
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ör: Açılış Tuzağı"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Açıklama
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Bu pozisyon hakkında not ekleyin..."
          />
        </div>
        
        <button
          onClick={capturePosition}
          disabled={isCapturing}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-blue-300"
        >
          {isCapturing ? 'İşleniyor...' : editMode === 'edit' ? 'Güncelle' : 'Pozisyon Ekle'}
        </button>
      </div>
    </div>
  );
};

export default React.memo(PositionEditor);