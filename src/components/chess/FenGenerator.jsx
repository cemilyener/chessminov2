import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import usePDFStore from '../../store/usePDFStore';
import { ExtendedChess } from '../../utils/chess/ExtendedChess';

/**
 * FenGenerator bileşeni - 6 satranç pozisyonu oluşturmak ve worksheet'e göndermek için basit bir araç
 */
const FenGenerator = () => {
  const navigate = useNavigate();
  const { positions, setPositionsForWorksheet, clearAll } = usePDFStore();
  const [currentPositions, setCurrentPositions] = useState(
    positions.length > 0 
      ? positions 
      : Array(6).fill().map((_, idx) => ({
          id: `pos_${idx}`,
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          title: `Pozisyon ${idx + 1}`,
          description: ''
        }))
  );
  
  // Satranç tahtası ayarları
  const [boardWidth, setBoardWidth] = useState(300);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState(0);
  const [game, setGame] = useState(new Chess(currentPositions[0].fen));
  
  // Tahtanın boyutunu ayarla
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBoardWidth(width * 0.85);
      } else {
        setBoardWidth(350);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Seçilen pozisyon değiştiğinde satranç oyununu güncelle
  React.useEffect(() => {
    if (currentPositions[selectedPositionIndex]) {
      try {
        const newGame = new Chess(currentPositions[selectedPositionIndex].fen);
        setGame(newGame);
      } catch (e) {
        console.error("Geçersiz FEN:", e);
        // Hata durumunda varsayılan başlangıç pozisyonunu kullan
        setGame(new Chess());
      }
    }
  }, [selectedPositionIndex, currentPositions]);
  
  // Taş hareketi
  const onPieceDrop = (sourceSquare, targetSquare, piece) => {
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() === 'p' ? 'q' : undefined,
      });
      
      if (move === null) return false;
      
      // Pozisyonu güncelle
      const updatedPositions = [...currentPositions];
      updatedPositions[selectedPositionIndex] = {
        ...updatedPositions[selectedPositionIndex],
        fen: gameCopy.fen()
      };
      
      setCurrentPositions(updatedPositions);
      setGame(gameCopy);
      return true;
    } catch (e) {
      console.error('Taş hareketi hatası:', e);
      return false;
    }
  };
  
  // Tahtayı temizle ve yeni bir pozisyon başlat
  const handleClear = () => {
    const clearedPositions = [...currentPositions];
    clearedPositions[selectedPositionIndex] = {
      ...clearedPositions[selectedPositionIndex],
      fen: '8/8/8/8/8/8/8/8 w - - 0 1'
    };
    
    setCurrentPositions(clearedPositions);
    setGame(new Chess('8/8/8/8/8/8/8/8 w - - 0 1'));
  };
  
  // Tüm pozisyonları temizle
  const handleClearAll = () => {
    const emptyPositions = Array(6).fill().map((_, idx) => ({
      id: `pos_${idx}`,
      fen: '8/8/8/8/8/8/8/8 w - - 0 1',
      title: `Pozisyon ${idx + 1}`,
      description: ''
    }));
    
    setCurrentPositions(emptyPositions);
    setGame(new Chess('8/8/8/8/8/8/8/8 w - - 0 1'));
  };
  
  // Başlangıç pozisyonuna dön
  const handleReset = () => {
    const resetPositions = [...currentPositions];
    resetPositions[selectedPositionIndex] = {
      ...resetPositions[selectedPositionIndex],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    };
    
    setCurrentPositions(resetPositions);
    setGame(new Chess());
  };
  
  // Boş bir tahta oluştur
  const handleEmpty = () => {
    handleClear();
  };
  
  // Çalışma sayfasına git
  const goToWorksheet = () => {
    setPositionsForWorksheet(currentPositions);
    navigate('/worksheet');
  };
  
  // Pozisyon başlığını güncelle
  const updatePositionTitle = (index, value) => {
    const updatedPositions = [...currentPositions];
    updatedPositions[index] = {
      ...updatedPositions[index],
      title: value
    };
    setCurrentPositions(updatedPositions);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">6 Pozisyonlu Satranç Çalışma Sayfası</h1>
        <p className="text-gray-600 mb-4">
          Bu sayfada 6 satranç pozisyonu oluşturup çalışma kağıdı olarak yazdırabilirsiniz.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Sol sütun - Satranç tahtası */}
          <div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <Chessboard
                id="fen-generator-board"
                position={game.fen()}
                boardWidth={boardWidth}
                onPieceDrop={onPieceDrop}
                customBoardStyle={{ borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              
              <div className="mt-4 space-x-2 flex flex-wrap gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  Başlangıç Pozisyonu
                </button>
                
                <button
                  onClick={handleEmpty}
                  className="px-3 py-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                >
                  Boş Tahta
                </button>
                
                <button
                  onClick={handleClear}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  Taşları Temizle
                </button>
              </div>
            </div>
          </div>
          
          {/* Sağ sütun - Pozisyonlar */}
          <div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full">
              <h2 className="text-lg font-medium mb-3">Çalışma Sayfası Pozisyonları</h2>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {currentPositions.map((position, index) => (
                  <div 
                    key={position.id} 
                    className={`p-2 border rounded cursor-pointer ${
                      selectedPositionIndex === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPositionIndex(index)}
                  >
                    <div className="text-sm font-medium mb-1 flex justify-between">
                      <span>#{index + 1}</span>
                      <span className="text-gray-500 text-xs">
                        {position.fen === '8/8/8/8/8/8/8/8 w - - 0 1' ? 'Boş' : 'Tahta'}
                      </span>
                    </div>
                    <input
                      type="text"
                      className="w-full text-xs p-1 border border-gray-300 rounded"
                      value={position.title}
                      onChange={(e) => updatePositionTitle(index, e.target.value)}
                      placeholder={`Pozisyon ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col space-y-2 mt-4">
                <button
                  onClick={goToWorksheet}
                  className="w-full py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                  </svg>
                  Çalışma Sayfası Oluştur
                </button>
                <button
                  onClick={handleClearAll}
                  className="w-full py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  Tüm Pozisyonları Temizle
                </button>
              </div>
              
              <div className="mt-4 text-sm text-gray-500 bg-blue-50 p-3 rounded">
                <p><strong>İpucu:</strong> 6 pozisyonu oluşturduktan sonra "Çalışma Sayfası Oluştur" düğmesine tıklayın ve yazdırmak için PDF oluştur seçeneğini kullanın.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FenGenerator;
