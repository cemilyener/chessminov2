import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

// Örnek puzzle verisi yükleme fonksiyonu
const fetchPuzzleById = async (puzzleId) => {
  return {
    id: puzzleId,
    title: `Puzzle ${puzzleId}`,
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1", // İlginç bir başlangıç pozisyonu
    description: "Basit bir deneme bulmacası"
  };
};

const PuzzlePage = () => {
  const { puzzleId } = useParams();
  const [puzzle, setPuzzle] = useState(null);
  const [position, setPosition] = useState("start");
  const [game, setGame] = useState(new Chess());
  const [message, setMessage] = useState("Puzzle yükleniyor...");
  const [selectedSquare, setSelectedSquare] = useState(null);

  // Puzzle verisi yükleme
  useEffect(() => {
    const loadPuzzle = async () => {
      try {
        const loadedPuzzle = await fetchPuzzleById(puzzleId);
        setPuzzle(loadedPuzzle);
        
        // Chess.js ile pozisyonu ayarla
        const newGame = new Chess();
        try {
          newGame.load(loadedPuzzle.fen);
          setGame(newGame);
          setPosition(loadedPuzzle.fen);
          setMessage(loadedPuzzle.title);
        } catch (err) {
          setMessage("Geçersiz pozisyon!");
          console.error("FEN yükleme hatası:", err);
        }
      } catch (err) {
        setMessage(`Puzzle yükleme hatası: ${err.message}`);
      }
    };
    
    loadPuzzle();
  }, [puzzleId]);

  // Kare tıklama işleyicisi
  const handleSquareClick = (square) => {
    // Daha önce bir kare seçilmiş mi?
    if (selectedSquare) {
      // Hamle yapmayı dene
      try {
        const move = game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q' // Otomatik vezir terfi
        });
        
        // Geçerli hamle ise tahtayı güncelle
        if (move) {
          setPosition(game.fen());
          setMessage("Hamle yapıldı!");
        }
      } catch (err) {
        console.error("Hamle hatası:", err);
      }
      
      // Her durumda seçimi temizle
      setSelectedSquare(null);
      return;
    }
    
    // Yeni kare seç
    setSelectedSquare(square);
  };
  
  // Tahtayı sıfırlama
  const resetBoard = () => {
    if (puzzle) {
      const newGame = new Chess();
      newGame.load(puzzle.fen);
      setGame(newGame);
      setPosition(puzzle.fen);
      setMessage(puzzle.title);
      setSelectedSquare(null);
    }
  };
  
  // Seçili kareleri vurgulama
  const getSquareStyles = () => {
    const styles = {};
    
    if (selectedSquare) {
      styles[selectedSquare] = { background: 'rgba(255, 255, 0, 0.4)' };
      
      // Seçili taşın gidebileceği kareleri vurgula
      try {
        const moves = game.moves({
          square: selectedSquare,
          verbose: true
        });
        
        moves.forEach(move => {
          styles[move.to] = {
            background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
            borderRadius: '50%'
          };
        });
      } catch (err) {
        console.error("Hareket hesaplama hatası:", err);
      }
    }
    
    return styles;
  };
  
  return (
    <div className="puzzle-page min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-8 px-2 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-indigo-700 mb-4 text-center">
          {puzzle?.title || 'Puzzle'}
        </h2>
        
        <div className="message-area w-full mb-4">
          <div className="message text-center rounded-lg py-2 px-4 mb-2 bg-indigo-50 text-indigo-700">
            {message}
          </div>
        </div>
        
        <div className="puzzle-layout flex flex-col md:flex-row items-center gap-8 w-full">
          <div className="flex-shrink-0">
            <Chessboard
              position={position}
              onSquareClick={handleSquareClick}
              customSquareStyles={getSquareStyles()}
              boardWidth={340}
              boardOrientation="white"
              areArrowsAllowed={true}
              className="rounded-xl shadow-md border border-indigo-100"
            />
          </div>
          
          <div className="puzzle-controls flex flex-col gap-3 w-full md:w-48">
            <button onClick={() => setMessage("Bu özellik henüz hazır değil.")}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg shadow transition">
              İpucu Göster
            </button>
            
            <button onClick={resetBoard}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition">
              Yeniden Başlat
            </button>
            
            <button onClick={() => window.history.back()}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow transition">
              Puzzle Listesine Dön
            </button>
            
            <button onClick={() => window.location.href = '/'}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition">
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
        
        {puzzle?.description && (
          <div className="puzzle-description mt-6 p-4 bg-blue-50 rounded-lg w-full">
            <p className="text-gray-700">{puzzle.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzlePage;