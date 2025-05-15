import React from 'react';
import { Chessboard } from 'react-chessboard';
import usePDFStore from '@/store/usePDFStore';

/**
 * Eklenen pozisyonların listesini gösteren ve yöneten bileşen
 */
const PositionList = () => {
  const { positions, removePosition, reorderPositions } = usePDFStore();
  
  // Pozisyonu sil
  const handleRemovePosition = (id) => {
    if (window.confirm('Bu pozisyonu silmek istediğinizden emin misiniz?')) {
      removePosition(id);
    }
  };
  
  // Pozisyonu yukarı taşı
  const handleMoveUp = (index) => {
    if (index === 0) return; // İlk eleman zaten en üstte
    
    const newPositions = [...positions];
    const temp = newPositions[index];
    newPositions[index] = newPositions[index - 1];
    newPositions[index - 1] = temp;
    
    reorderPositions(newPositions);
  };
  
  // Pozisyonu aşağı taşı
  const handleMoveDown = (index) => {
    if (index === positions.length - 1) return; // Son eleman zaten en altta
    
    const newPositions = [...positions];
    const temp = newPositions[index];
    newPositions[index] = newPositions[index + 1];
    newPositions[index + 1] = temp;
    
    reorderPositions(newPositions);
  };

  // Eğer pozisyon yoksa
  if (positions.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 my-4">
        <p className="text-gray-500 text-center">
          Henüz hiç pozisyon eklenmedi. Pozisyon düzenleyiciyi kullanarak yeni pozisyonlar ekleyin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-4">
      <h2 className="text-xl font-bold">Eklenen Pozisyonlar ({positions.length})</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {positions.map((position, index) => (
          <div 
            key={position.id}
            className="bg-white border rounded-lg shadow-sm overflow-hidden"
          >
            <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
              <span className="font-medium">{position.title || 'Pozisyon'}</span>
              <span className="text-sm text-gray-500">#{index + 1}</span>
            </div>
            
            <div className="p-3">
              {/* Minyatür Tahta */}
              {position.screenshot ? (
                <div className="flex justify-center">
                  <img 
                    src={position.screenshot} 
                    alt={`Pozisyon ${index + 1}`} 
                    className="w-full max-w-[200px] mb-2" 
                  />
                </div>
              ) : (
                <div className="flex justify-center mb-2">
                  <Chessboard 
                    position={position.fen} 
                    boardWidth={160}
                    arePiecesDraggable={false}
                  />
                </div>
              )}
              
              {/* Açıklama */}
              {position.description && (
                <div className="text-sm text-gray-600 my-2 border-t border-gray-100 pt-2">
                  {position.description}
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-2 border-t flex justify-between">
              {/* Sıra Değiştirme Butonları */}
              <div className="space-x-1">
                <button 
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                  title="Yukarı Taşı"
                >
                  ↑
                </button>
                <button 
                  onClick={() => handleMoveDown(index)}
                  disabled={index === positions.length - 1}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                  title="Aşağı Taşı"
                >
                  ↓
                </button>
              </div>
              
              {/* Silme Butonu */}
              <button 
                onClick={() => handleRemovePosition(position.id)}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                title="Pozisyonu Sil"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PositionList;