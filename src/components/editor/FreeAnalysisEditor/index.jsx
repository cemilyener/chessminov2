import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Chessboard, ChessboardDnDProvider, SparePiece } from 'react-chessboard';
import { ExtendedChess } from '@/utils/chess/ExtendedChess.js';
import { HTML5Backend } from "react-dnd-html5-backend";
import { useId } from "react";

import useAnalysisStore from '@/store/useAnalysisStore';
import ColorPalette from './ColorPalette';
import ArrowDrawer, { useArrowDrawing } from './ArrowDrawer';
import SquareHighlighter, { getSquareStyles } from './SquareHighlighter';

/**
 * Serbest Analiz Editör Bileşeni
 * Ok çizme ve kare renklendirme özellikleri içeren satranç tahtası
 */
const FreeAnalysisEditor = () => {
  // Start with empty board like BasicBoardPage for free piece placement
  const emptyFen = "8/8/8/8/8/8/8/8 w - - 0 1";
  const game = useMemo(() => new ExtendedChess(emptyFen, { bypass: [10] }), []);
  
  const [boardWidth, setBoardWidth] = useState(500);
  const [boardPosition, setBoardPosition] = useState(emptyFen);
  const [boardOrientation, setBoardOrientation] = useState("white");
  const boardRef = useRef(null);
  const uniqueId = useId();
  // Store'dan veri çekme
  const {
    arrows,
    highlightedSquares,
    highlightSquare,
    clearAll,
    undoLastArrow,
    currentHighlightColor
  } = useAnalysisStore();

  // Ok çizme mantığı
  const { fromSquare, handleSquareClick } = useArrowDrawing();

  // Piece handling functions like BasicBoardPage
  const handleSparePieceDrop = (piece, targetSquare) => {
    const color = piece[0];
    const type = piece[1].toLowerCase();
    
    try {
      // Remove existing piece from target square
      game.remove(targetSquare);
      
      // Place new piece
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        setBoardPosition(game.fen());
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Piece placement error:", error.message);
      return false;
    }
  };

  // Handle piece movement on the board
  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    try {
      // Remove pieces from source and target squares
      game.remove(sourceSquare);
      game.remove(targetSquare);
      
      const color = piece[0];
      const type = piece[1].toLowerCase();
      
      // Place piece on target square
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        setBoardPosition(game.fen());
      }
      
      return success;
    } catch (error) {
      console.error("Piece movement error:", error.message);
      return false;
    }
  };

  // Handle piece drop off board (remove piece)
  const handlePieceDropOffBoard = (sourceSquare) => {
    game.remove(sourceSquare);
    setBoardPosition(game.fen());
    return true;
  };

  // Board control functions like BasicBoardPage
  const handleClearBoard = () => {
    game.clear();
    setBoardPosition(game.fen());
  };

  const handleStartPosition = () => {
    game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", { bypass: [10] });
    setBoardPosition(game.fen());
  };

  const handlePlaceKings = () => {
    game.clear();
    game.put({ type: 'k', color: 'w' }, 'h1');
    game.put({ type: 'k', color: 'b' }, 'h8');
    setBoardPosition(game.fen());
  };

  const handleFlipBoard = () => {
    setBoardOrientation(boardOrientation === "white" ? "black" : "white");
  };

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
  // Board pieces for the palette
  const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];

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

            {/* Board Control Buttons */}
            <div className="mb-4 w-full flex justify-center flex-wrap gap-2">
              <button 
                onClick={handleStartPosition}
                className="cursor-pointer px-4 py-2 rounded-md bg-amber-100 border border-gray-300 hover:bg-amber-200 text-sm"
              >
                Başlangıç konumu ♟️
              </button>
              <button 
                onClick={handleClearBoard}
                className="cursor-pointer px-4 py-2 rounded-md bg-amber-100 border border-gray-300 hover:bg-amber-200 text-sm"
              >
                Tahtayı temizle 🗑️
              </button>
              <button 
                onClick={handleFlipBoard}
                className="cursor-pointer px-4 py-2 rounded-md bg-amber-100 border border-gray-300 hover:bg-amber-200 text-sm"
              >
                Tahtayı çevir 🔁
              </button>
              <button 
                onClick={handlePlaceKings}
                className="cursor-pointer px-4 py-2 rounded-md bg-amber-100 border border-gray-300 hover:bg-amber-200 text-sm"
              >
                Şahları Yerleştir 👑
              </button>
            </div>
            
            {/* Satranç Tahtası with Piece Palette */}
            <ChessboardDnDProvider backend={HTML5Backend}>
              <div ref={boardRef} className="board-container relative shadow-lg rounded-md overflow-hidden">
                {/* Black pieces palette */}
                <div style={{
                  display: "flex",
                  margin: `${boardWidth / 32}px ${boardWidth / 8}px`,
                  justifyContent: "center"
                }}>
                  {pieces.slice(6, 12).map(piece => (
                    <SparePiece
                      key={piece}
                      piece={piece}
                      width={boardWidth / 8}
                      dndId={uniqueId}
                    >
                      <img 
                        src={`/pieces/${piece}.png`}
                        alt={piece}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </SparePiece>
                  ))}
                </div>

                <Chessboard
                  id={uniqueId}
                  position={boardPosition}
                  boardOrientation={boardOrientation}
                  boardWidth={boardWidth}
                  areArrowsAllowed={true}
                  customArrows={arrows}
                  customSquareStyles={getSquareStyles(highlightedSquares)}
                  onSquareClick={(square) => handleSquareClick(square)}
                  onSquareRightClick={handleSquareRightClick}
                  onPieceDrop={handlePieceDrop}
                  onPieceDropOffBoard={handlePieceDropOffBoard}
                  onSparePieceDrop={handleSparePieceDrop}
                  allowDragOutsideBoard={true}
                  dropOffBoardAction="trash"
                  customBoardStyle={{ borderRadius: "4px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)" }}
                  customDarkSquareStyle={{ backgroundColor: '#b58863' }}
                  customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                  customPieces={pieces.reduce((acc, piece) => ({
                    ...acc,
                    [piece]: ({ squareWidth }) => (
                      <img
                        src={`/pieces/${piece}.png`}
                        alt={piece}
                        style={{ width: squareWidth, height: squareWidth }}
                      />
                    ),
                  }), {})}
                  onTouchStart={(e) => {
                    const square = e.target.getAttribute('data-square');
                    if (square) {
                      handleTouchStart(square);
                    }
                  }}
                />

                {/* White pieces palette */}
                <div style={{
                  display: "flex",
                  margin: `${boardWidth / 32}px ${boardWidth / 8}px`,
                  justifyContent: "center"
                }}>
                  {pieces.slice(0, 6).map(piece => (
                    <SparePiece
                      key={piece}
                      piece={piece}
                      width={boardWidth / 8}
                      dndId={uniqueId}
                    >
                      <img 
                        src={`/pieces/${piece}.png`}
                        alt={piece}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </SparePiece>
                  ))}
                </div>
              </div>
            </ChessboardDnDProvider>            {/* Mobil kontroller (küçük ekranlarda görünür) */}
            <div className="mt-6 md:hidden w-full">
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium mb-3">Kontroller</h3>
                
                {/* Board Controls for Mobile */}
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-2 text-gray-600">Tahta Kontrolleri</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleStartPosition}
                      className="cursor-pointer px-3 py-2 rounded-md bg-amber-100 border border-gray-300 hover:bg-amber-200 text-xs"
                    >
                      Başlangıç ♟️
                    </button>
                    <button 
                      onClick={handleClearBoard}
                      className="cursor-pointer px-3 py-2 rounded-md bg-amber-100 border border-gray-300 hover:bg-amber-200 text-xs"
                    >
                      Temizle 🗑️
                    </button>
                    <button 
                      onClick={handleFlipBoard}
                      className="cursor-pointer px-3 py-2 rounded-md bg-amber-100 border border-gray-300 hover:bg-amber-200 text-xs"
                    >
                      Çevir 🔁
                    </button>
                    <button 
                      onClick={handlePlaceKings}
                      className="cursor-pointer px-3 py-2 rounded-md bg-amber-100 border border-gray-300 hover:bg-amber-200 text-xs"
                    >
                      Şahlar 👑
                    </button>
                  </div>
                </div>

                {/* Analysis Controls for Mobile */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-600">Analiz Araçları</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <ArrowDrawer />
                    <SquareHighlighter />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Kontroller (büyük ekranlarda görünür) */}          <div className="md:w-1/3 space-y-4">
            <div className="hidden md:block">
              <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <h3 className="text-lg font-bold mb-4">Analiz Araçları</h3>
                
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2 text-gray-600">Taş Yerleştirme</h4>
                  <p className="text-sm text-gray-500 mb-2">
                    Üst ve alt paletlerden taşları tahtaya sürükleyebilirsiniz
                  </p>
                  <div className="text-xs text-gray-400">
                    • Serbest yerleştirme (kural yok)<br/>
                    • Taşları tahta dışına atarak silebilirsiniz
                  </div>
                </div>
                
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
                <li>Taş yerleştirme: Paletlerden taşları tahtaya sürükleyin</li>
                <li>Taş taşıma: Tahta üzerindeki taşları hareket ettirin</li>
                <li>Taş silme: Taşları tahta dışına sürükleyin</li>
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