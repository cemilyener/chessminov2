import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

import useAnalysisStore from '@/store/useAnalysisStore';
import ColorPalette from './ColorPalette';
import ArrowDrawer, { useArrowDrawing } from './ArrowDrawer';
import SquareHighlighter, { getSquareStyles } from './SquareHighlighter';

/**
 * Serbest Analiz Editör Bileşeni
 * Ok çizme ve kare renklendirme özellikleri içeren satranç tahtası
 */
const FreeAnalysisEditor = () => {
  // Chess.js state
  const [game] = useState(new Chess());
  const [boardWidth, setBoardWidth] = useState(500);
  const [boardPosition, setBoardPosition] = useState('start');

  // Store'dan veri çekme
  const {
    arrows,
    highlightedSquares,
    highlightSquare,
    clearAll,
    undoLastArrow,
    currentArrowColor,
    currentHighlightColor
  } = useAnalysisStore();

  // Ok çizme mantığı
  const { fromSquare, handleSquareClick } = useArrowDrawing();

  // Tahtayı responsive yapmak için
  useEffect(() => {
    const updateBoardWidth = () => {
      // Mobil için daha küçük
      if (window.innerWidth < 768) {
        setBoardWidth(Math.min(window.innerWidth - 40, 400));
      } else {
        // Desktop için daha büyük
        setBoardWidth(Math.min(window.innerWidth * 0.4, 560));
      }
    };

    updateBoardWidth();
    window.addEventListener('resize', updateBoardWidth);
    return () => window.removeEventListener('resize', updateBoardWidth);
  }, []);

  // Sağ tık ile kare renklendirme
  const handleSquareRightClick = (square) => {
    highlightSquare(square, currentHighlightColor);
  };

  // Uzun dokunma (mobil sağ tık)
  const handleTouchStart = (square) => {
    const timer = setTimeout(() => {
      handleSquareRightClick(square);
    }, 500);
    
    return () => clearTimeout(timer);
  };

  return (
    <div className="free-analysis-editor min-h-screen bg-gray-100">
      {/* Üst Menü */}
      <div className="sticky top-0 z-10 bg-gray-800 text-white p-4 shadow-md flex justify-between items-center">
        <Link to="/" className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md text-sm flex items-center">
          <span className="mr-1">←</span> Ana Sayfa
        </Link>
        <h1 className="text-xl font-bold">Serbest Analiz Tahtası</h1>
        <div className="w-20"> {/* Boş alan (dengeli görünüm için) */}</div>
      </div>

      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sol Taraf - Tahta */}
          <div className="md:w-2/3 flex flex-col items-center">
            <div className="mb-4 w-full flex justify-between items-center">
              <div className="flex space-x-2">
                <button 
                  onClick={clearAll}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md text-sm"
                  title="Tüm ok ve renklendirmeleri temizle"
                >
                  Tümünü Temizle
                </button>
                
                <button 
                  onClick={undoLastArrow}
                  className="bg-orange-400 hover:bg-orange-500 text-white py-1 px-3 rounded-md text-sm"
                  disabled={arrows.length === 0}
                  title="Son çizilen oku geri al"
                >
                  Son Oku Geri Al
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                {fromSquare ? (
                  <span>Hedef kareye tıklayın...</span>
                ) : (
                  <span>Ok çizmek için bir kareye tıklayın</span>
                )}
              </div>
            </div>
            
            {/* Satranç Tahtası */}
            <div className="board-container relative shadow-lg rounded-md overflow-hidden">
              <Chessboard
                id="free-analysis-board"
                position={boardPosition}
                boardWidth={boardWidth}
                areArrowsAllowed={true}
                customArrows={arrows}
                customSquareStyles={getSquareStyles(highlightedSquares)}
                onSquareClick={(square) => handleSquareClick(square)}
                onSquareRightClick={handleSquareRightClick}
                onTouchStart={(e) => {
                  const square = e.target.getAttribute('data-square');
                  if (square) {
                    handleTouchStart(square);
                  }
                }}
              />
            </div>

            {/* Mobil kontroller (küçük ekranlarda görünür) */}
            <div className="mt-6 md:hidden w-full">
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium mb-3">Kontroller</h3>
                <div className="grid grid-cols-2 gap-3">
                  <ArrowDrawer />
                  <SquareHighlighter />
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Kontroller (büyük ekranlarda görünür) */}
          <div className="md:w-1/3 space-y-4">
            <div className="hidden md:block">
              <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <h3 className="text-lg font-bold mb-4">Analiz Araçları</h3>
                
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2 text-gray-600">Ok Çizimi</h4>
                  <p className="text-sm text-gray-500 mb-2">
                    İlk kareye tıkladıktan sonra hedef kareye tıklayın
                  </p>
                  <div className="mt-2">
                    <ArrowDrawer />
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2 text-gray-600">Kare Renklendirme</h4>
                  <p className="text-sm text-gray-500 mb-2">
                    Sağ tıklayarak kareleri renklendirebilirsiniz
                  </p>
                  <div className="mt-2">
                    <SquareHighlighter />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Renk paleti */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ColorPalette />
            </div>
            
            {/* Yardım kartı */}
            <div className="bg-white rounded-lg shadow-md p-4 hidden md:block">
              <h3 className="text-lg font-medium mb-2">İpuçları</h3>
              <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                <li>Ok çizmek için: İki kareye sırayla tıklayın</li>
                <li>Kare renklendirme: Sağ tık ile kare renklendirin</li>
                <li>Mobil cihazlarda: Uzun basma = sağ tık</li>
                <li>Son çizilen oku geri almak için "Son Oku Geri Al" butonunu kullanın</li>
                <li>İşaretlemeleri kaldırmak için ilgili temizleme butonlarını kullanın</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeAnalysisEditor;