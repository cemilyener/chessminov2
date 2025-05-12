import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Chessboard, ChessboardDnDProvider, SparePiece } from 'react-chessboard';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { ExtendedChess } from '../../utils/chess/ExtendedChess.js';
import useChessStore from '../../store/useChessStore';
import { CustomDragLayer } from './CustomDragLayer';
import { useId } from 'react';

// Tahta üst/alt kenarları için satranç taşı sembolleri
const PieceSymbols = ({ pieces, boardWidth }) => (
  <div className="flex justify-center mb-2">
    <div className="flex space-x-2">
      {pieces.map(piece => (
        <img key={piece} src={`/pieces/${piece}.png`} alt={piece} className="w-9 h-9" />
      ))}
    </div>
  </div>
);

const ManualBoardEditor = () => {
  const { 
    currentFen, 
    setPosition,
    arrows, 
    addArrow, 
    clearArrows,
    highlightedSquares, 
    highlightSquare, 
    clearHighlightedSquare, 
    clearAllHighlights 
  } = useChessStore();
  
  const [customFen, setCustomFen] = useState('');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [currentArrowColor, setCurrentArrowColor] = useState("blue");
  const [currentHighlightColor, setCurrentHighlightColor] = useState("blue");
  const [boardWidth, setBoardWidth] = useState(400);
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [boardContainer, setBoardContainer] = useState({ left: 0, top: 0 });
  const boardRef = useRef(null);
  const uniqueId = useId();
  
  // Mobil cihaz tespiti
  const isMobile = typeof window !== 'undefined' && 'ontouchstart' in window;
  const backend = isMobile ? TouchBackend : HTML5Backend;
  
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        setBoardContainer({ left: rect.left, top: rect.top });
        setBoardWidth(boardRef.current.offsetWidth);
      }
    });
    if (boardRef.current) observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle when a spare piece is dropped on the board
  const handleSparePieceDrop = useCallback((piece, targetSquare) => {
    try {
      // Create a new chess instance to manipulate
      const chessInstance = new ExtendedChess(currentFen, { bypass: [10] });
      const pieceColor = piece[0];
      const pieceType = piece[1].toLowerCase();
      
      // Remove any existing piece at the target square
      chessInstance.remove(targetSquare);
      
      // Place the new piece
      const success = chessInstance.put({ type: pieceType, color: pieceColor }, targetSquare);
      
      if (success) {
        setPosition(chessInstance.fen(), true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error placing piece:", error);
      return false;
    }
  }, [currentFen, setPosition]);

  // Handle when a board piece is moved
  const handlePieceDrop = useCallback((sourceSquare, targetSquare) => {
    try {
      const chessInstance = new ExtendedChess(currentFen, { bypass: [10] });
      const piece = chessInstance.get(sourceSquare);
      
      if (!piece) return false;
      
      chessInstance.remove(sourceSquare);
      const success = chessInstance.put(piece, targetSquare);
      
      if (success) {
        setPosition(chessInstance.fen(), true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error moving piece:", error);
      return false;
    }
  }, [currentFen, setPosition]);

  // Handle when a piece is dropped off the board
  const handlePieceDropOffBoard = useCallback((sourceSquare) => {
    try {
      const chessInstance = new ExtendedChess(currentFen, { bypass: [10] });
      chessInstance.remove(sourceSquare);
      setPosition(chessInstance.fen(), true);
      return true;
    } catch (error) {
      console.error("Error removing piece:", error);
      return false;
    }
  }, [currentFen, setPosition]);

  const handleSquareClick = useCallback((square) => {
    if (selectedSquare) {
      if (selectedSquare !== square) {
        addArrow(selectedSquare, square, currentArrowColor);
      }
      setSelectedSquare(null);
    } else {
      setSelectedSquare(square);
    }
  }, [selectedSquare, addArrow, currentArrowColor]);

  const handleSquareRightClick = useCallback((square) => {
    if (highlightedSquares[square]) {
      clearHighlightedSquare(square);
    } else {
      highlightSquare(square, currentHighlightColor);
    }
    return false;
  }, [highlightedSquares, highlightSquare, clearHighlightedSquare, currentHighlightColor]);

  const handleFenChange = (e) => {
    setCustomFen(e.target.value);
  };

  const loadFen = useCallback((fen = customFen) => {
    if (!fen) return;
    
    try {
      const chess = new ExtendedChess(fen, { bypass: [10] });
      setPosition(chess.fen(), true);
      setCustomFen('');
    } catch (error) {
      console.error('Invalid FEN:', error);
      alert('Geçersiz FEN formatı!');
    }
  }, [customFen, setPosition]);

  // Create custom square styles for highlights
  const customSquareStyles = {};
  Object.entries(highlightedSquares).forEach(([square, color]) => {
    customSquareStyles[square] = { 
      backgroundColor: typeof color === 'string' ? 
        `rgba(${color === 'blue' ? '0, 0, 255' : 
              color === 'red' ? '255, 0, 0' : 
              color === 'green' ? '0, 128, 0' : 
              color === 'yellow' ? '255, 255, 0' : '0, 0, 255'}, 0.4)` : undefined
    };
  });

  if (selectedSquare) {
    customSquareStyles[selectedSquare] = { 
      ...customSquareStyles[selectedSquare],
      border: '2px solid rgba(255, 165, 0, 0.8)',
      boxSizing: 'border-box'
    };
  }

  const whitePieces = ["wP", "wN", "wB", "wR", "wQ", "wK"];
  const blackPieces = ["bP", "bN", "bB", "bR", "bQ", "bK"];

  return (
    <div className="chess-editor-container">
      <ChessboardDnDProvider backend={backend}>
        <div ref={boardRef}>
          {/* FEN Input */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="text"
                className="flex-grow p-2 border rounded text-sm"
                placeholder="FEN pozisyonu girin..."
                value={customFen}
                onChange={handleFenChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadFen();
                }}
              />
              <button 
                className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
                onClick={() => loadFen()}
              >
                Yükle
              </button>
              <button 
                className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
                onClick={() => navigator.clipboard.writeText(currentFen)}
              >
                Kopyala
              </button>
            </div>
          </div>
          
          {/* Spare pieces (black) */}
          <div className="flex justify-center mb-2">
            <div className="grid grid-cols-6 gap-1">
              {blackPieces.map(piece => (
                <SparePiece
                  key={piece}
                  piece={piece}
                  dndId={uniqueId}
                >
                  <img 
                    src={`/pieces/${piece}.png`}
                    alt={piece}
                    className="w-12 h-12"
                  />
                </SparePiece>
              ))}
            </div>
          </div>
          
          {/* Chessboard */}
          <Chessboard
            id={uniqueId}
            position={currentFen}
            boardOrientation={boardOrientation}
            onPieceDrop={handlePieceDrop}
            onSparePieceDrop={handleSparePieceDrop}
            onPieceDropOffBoard={handlePieceDropOffBoard}
            onSquareClick={handleSquareClick}
            onSquareRightClick={handleSquareRightClick}
            customSquareStyles={customSquareStyles}
            customArrows={arrows}
            boardWidth={boardWidth}
            onBoardWidthChange={setBoardWidth}
            allowDragOutsideBoard={true}
            dropOffBoardAction="trash"
            customBoardStyle={{ 
              borderRadius: "4px", 
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)" 
            }}
          />
          
          {/* Spare pieces (white) */}
          <div className="flex justify-center mt-2">
            <div className="grid grid-cols-6 gap-1">
              {whitePieces.map(piece => (
                <SparePiece
                  key={piece}
                  piece={piece}
                  dndId={uniqueId}
                >
                  <img 
                    src={`/pieces/${piece}.png`}
                    alt={piece}
                    className="w-12 h-12"
                  />
                </SparePiece>
              ))}
            </div>
          </div>
        </div>
        
        {/* Control buttons */}
        <div className="flex justify-center mt-4 space-x-2 flex-wrap">
          <button 
            onClick={() => setPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')}
            className="px-4 py-2 bg-amber-100 hover:bg-amber-200 rounded text-sm border"
          >
            Başlangıç konumu
          </button>
          <button 
            onClick={() => setPosition('8/8/8/8/8/8/8/8 w - - 0 1', true)}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-sm border"
          >
            Tahtayı temizle
          </button>
          <button
            onClick={clearArrows}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm border"
          >
            Okları temizle
          </button>
          <button
            onClick={clearAllHighlights}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm border"
          >
            Renkleri temizle
          </button>
          <button
            onClick={() => setBoardOrientation(boardOrientation === "white" ? "black" : "white")}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded text-sm border"
          >
            Tahtayı çevir
          </button>
        </div>
        
        {/* Instructions */}
        <div className="mt-4 text-sm text-gray-600">
          <p>• Taş paletinden taşları sürükleyip tahta üzerine bırakabilirsiniz</p>
          <p>• Sol tıklama ile ok çizebilirsiniz (iki kareye sırayla tıklayın)</p>
          <p>• Sağ tıklama ile kareleri vurgulayabilirsiniz</p>
          <p>• Taşları tahtanın dışına sürükleyerek silebilirsiniz</p>
        </div>
        
        <CustomDragLayer 
          boardContainer={boardContainer}
          boardWidth={boardWidth}
          id={uniqueId}
          snapToCursor={true}
          allowDragOutsideBoard={true}
        />
      </ChessboardDnDProvider>
    </div>
  );
};

export default ManualBoardEditor;