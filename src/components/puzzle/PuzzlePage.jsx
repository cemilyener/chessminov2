import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {Chessboard} from 'react-chessboard'; // veya kullandığınız tahta bileşeni
import useChessContent from "../../utils/chess/ChessContentManager";

// Örnek puzzle verisi yükleme fonksiyonu (projenize göre değiştirin)
const fetchPuzzleById = async (puzzleId) => {
  // API'den veya local JSON'dan yükleme
  // Bu örnek için basitleştirilmiş
  const examplePuzzle = {
    id: puzzleId,
    title: `Puzzle ${puzzleId}`,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Örnek FEN
    mainLine: [
      // Örnek hamleler
      { move: "e4", from: "e2", to: "e4", fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1" },
      { move: "e5", from: "e7", to: "e5", fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1" },
      { move: "Nf3", from: "g1", to: "f3", fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2", isLast: true }
    ],
    alternatives: []
  };
  
  return examplePuzzle;
};

const PuzzlePage = () => {
  const { puzzleId } = useParams();
  const [activePuzzle, setActivePuzzle] = useState(null);
  const [message, setMessage] = useState('Puzzle yükleniyor...');
  const [puzzleCompleted, setPuzzleCompleted] = useState(false);
  const [moveState, setMoveState] = useState(null); // 'correct', 'incorrect', null
  
  const {
    boardPosition,
    loading,
    error,
    setupPuzzle,
    validateMove,
    goToNode,
    getMainLine
  } = useChessContent({ contentType: 'puzzle' });
  
  // Puzzle verisi yükleme
  useEffect(() => {
    const loadPuzzle = async () => {
      try {
        const puzzle = await fetchPuzzleById(puzzleId);
        setActivePuzzle(puzzle);
      } catch (err) {
        setMessage(`Puzzle yükleme hatası: ${err.message}`);
      }
    };
    
    loadPuzzle();
  }, [puzzleId]);
  
  // Puzzle değiştiğinde setup
  useEffect(() => {
    if (activePuzzle) {
      setupPuzzle(activePuzzle);
      setMessage(activePuzzle.title || "Puzzle");
      setPuzzleCompleted(false);
      setMoveState(null);
    }
  }, [activePuzzle, setupPuzzle]);
  
  // Kare tıklandığında
  const [selectedSquare, setSelectedSquare] = useState(null);
  
  const handleSquareClick = (square) => {
    // Puzzle tamamlanmışsa işlem yapma
    if (puzzleCompleted) return;
    
    // Daha önce bir kare seçilmiş mi?
    if (selectedSquare) {
      // Hamleyi doğrula
      const result = validateMove(selectedSquare, square);
      
      if (result.valid) {
        if (result.correct) {
          setMoveState('correct');
          
          if (result.completed) {
            setMessage("Harika! Puzzle tamamlandı.");
            setPuzzleCompleted(true);
          } else {
            setMessage("Doğru hamle! Devam edin.");
          }
        } else {
          setMoveState('incorrect');
          setMessage("Hatalı hamle. Tekrar deneyin.");
          // Hamlelerden biri yanlışsa ağaçta önceki düğüme dön
          setTimeout(() => {
            goToNode(result.lastCorrectNodeId || "root");
            setMoveState(null);
          }, 1000);
        }
      }
      
      // Seçimi temizle
      setSelectedSquare(null);
      return;
    }
    
    // Yeni kare seç
    setSelectedSquare(square);
  };
  
  // Yardım butonu - sıradaki doğru hamleyi göster
  const showHint = () => {
    // Ana hattın bir sonraki hamlesini bul
    const mainLine = getMainLine();
    const currentIndex = mainLine.findIndex(node => node.fen === boardPosition);
    
    if (currentIndex >= 0 && currentIndex < mainLine.length - 1) {
      const nextMove = mainLine[currentIndex + 1].move;
      setMessage(`İpucu: ${nextMove.from} karesindeki taşı ${nextMove.to} karesine taşıyın.`);
    } else {
      setMessage("İpucu yok. Belki puzzle zaten tamamlandı?");
    }
  };
  
  // Vurgulanan kareler için stil
  const getSquareStyles = () => {
    const styles = {};
    
    if (selectedSquare) {
      styles[selectedSquare] = { background: 'rgba(255, 0, 0, 0.4)' };
    }
    
    if (moveState === 'correct') {
      const mainLine = getMainLine();
      const currentIndex = mainLine.findIndex(node => node.fen === boardPosition);
      
      if (currentIndex > 0) {
        const lastMove = mainLine[currentIndex].move;
        styles[lastMove.from] = { background: 'rgba(0, 255, 0, 0.2)' };
        styles[lastMove.to] = { background: 'rgba(0, 255, 0, 0.4)' };
      }
    }
    
    return styles;
  };
  
  return (
    <div className="puzzle-page min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-8 px-2 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-indigo-700 mb-4 text-center">{activePuzzle?.title || 'Puzzle'}</h2>
        {loading && <div className="text-gray-500">Yükleniyor...</div>}
        {error && <div className="text-red-600 font-semibold mb-2">{error}</div>}
        <div className="message-area w-full mb-4">
          <div className={`message text-center rounded-lg py-2 px-4 mb-2 ${moveState === 'correct' ? 'bg-green-100 text-green-700' : moveState === 'incorrect' ? 'bg-red-100 text-red-700' : 'bg-indigo-50 text-indigo-700'}`}>{message}</div>
        </div>
        <div className="puzzle-layout flex flex-col md:flex-row items-center gap-8 w-full">
          <div className="flex-shrink-0">
            <Chessboard
              position={boardPosition}
              onSquareClick={handleSquareClick}
              customSquareStyles={getSquareStyles()}
              boardWidth={340}
              boardOrientation="white"
              className="rounded-xl shadow-md border border-indigo-100"
            />
          </div>
          <div className="puzzle-controls flex flex-col gap-3 w-full md:w-48">
            <button onClick={showHint} disabled={puzzleCompleted}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed">
              İpucu Göster
            </button>
            <button onClick={() => setupPuzzle(activePuzzle)}
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
      </div>
    </div>
  );
};

export default PuzzlePage;