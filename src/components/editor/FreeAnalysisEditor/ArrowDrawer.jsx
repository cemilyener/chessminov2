import React, { useState } from 'react';
import useAnalysisStore from '@/store/useAnalysisStore';

/**
 * Ok çizme bileşeni
 * Satranç tahtasındaki kareler arasına ok çizmek için fonksiyonlar sağlar
 */
const ArrowDrawer = () => {
  const {
    arrows,
    clearArrows,
    undoLastArrow,
    currentArrowColor
  } = useAnalysisStore();

  // Bu bileşen doğrudan render edilmiyor, sadece fonksiyonel mantık sağlıyor
  // Kontrol butonları oluşturur
  return (
    <div className="arrow-drawer">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Seçili renk:</span>
          <div 
            className={`w-5 h-5 rounded-full bg-${currentArrowColor}-500`} 
            style={{ backgroundColor: currentArrowColor }}
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded-md text-sm flex-grow"
            onClick={clearArrows}
            disabled={arrows.length === 0}
          >
            Okları Temizle
            <span className="ml-1 text-xs">({arrows.length})</span>
          </button>
          
          <button
            className="bg-orange-200 hover:bg-orange-300 text-gray-800 py-1 px-3 rounded-md text-sm"
            onClick={undoLastArrow}
            disabled={arrows.length === 0}
            title="Son çizilen oku geri al"
          >
            <span>↩️</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Ok çizimi için kullanılacak state ve fonksiyonları sağlar
 * İki kare seçiminden sonra ok çizme mantığını yönetir
 */
export const useArrowDrawing = () => {
  const [fromSquare, setFromSquare] = useState(null);
  const { addArrow, currentArrowColor } = useAnalysisStore();

  const handleSquareClick = (square) => {
    // Eğer daha önce bir kare seçilmişse, ok çiz
    if (fromSquare) {
      // Aynı kareye tıklanırsa işlemi iptal et
      if (fromSquare === square) {
        setFromSquare(null);
        return;
      }

      // İki kare arasında ok çiz ve state'i temizle
      addArrow(fromSquare, square, currentArrowColor);
      setFromSquare(null);
    } else {
      // İlk kare seçimi
      setFromSquare(square);
    }
  };

  return {
    fromSquare,
    handleSquareClick
  };
};

export default ArrowDrawer;