import React, { useState, useMemo, useEffect, useRef } from "react";
import { Chessboard, ChessboardDnDProvider, SparePiece } from "react-chessboard";
import { ExtendedChess } from "../../utils/chess/ExtendedChess.js";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useId } from "react";
import useChessStore from '../../store/useChessStore';

// Styles
const boardWrapper = { margin: "0 auto", maxWidth: "60vh" };
const buttonStyle = {
  cursor: "pointer",
  padding: "10px 20px",
  margin: "10px 10px 0px 0px",
  borderRadius: "6px",
  backgroundColor: "#f0d9b5",
  border: "1px solid #d3d3d3",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
};
const inputStyle = {
  padding: "10px 20px",
  margin: "10px 0",
  borderRadius: "6px",
  border: "1px solid #d3d3d3",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
  width: "100%",
};

const BasicBoardPage = () => {
  const { setPosition } = useChessStore();
  
  // Boş tahta ile başla
  const emptyFen = "8/8/8/8/8/8/8/8 w - - 0 1";
  const game = useMemo(() => new ExtendedChess(emptyFen, { bypass: [10] }), []);
  
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [boardWidth, setBoardWidth] = useState(360);
  const [fenPosition, setFenPosition] = useState(emptyFen);
  const boardRef = useRef(null);
  const uniqueId = useId();
  const [boardContainer, setBoardContainer] = useState({ left: 0, top: 0 });

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

  // FEN pozisyonu değiştiğinde store'a kaydet
  useEffect(() => {
    setPosition(fenPosition, true);
  }, [fenPosition, setPosition]);

  // Taş yerleştirme işlevi (yedek taş paletinden)
  const handleSparePieceDrop = (piece, targetSquare) => {
    const color = piece[0];
    const type = piece[1].toLowerCase();
    
    try {
      // Karedeki mevcut taşı kaldır
      game.remove(targetSquare);
      
      // Yeni taşı yerleştir
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        setFenPosition(game.fen());
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Taş yerleştirme hatası:", error.message);
      return false;
    }
  };

  // Taş taşıma işlevi
  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    try {
      // Kaynak ve hedef karelerdeki taşları kaldır
      game.remove(sourceSquare);
      game.remove(targetSquare);
      
      const color = piece[0];
      const type = piece[1].toLowerCase();
      
      // Taşı hedef kareye yerleştir
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        setFenPosition(game.fen());
      }
      
      return success;
    } catch (error) {
      console.error("Taş taşıma hatası:", error.message);
      return false;
    }
  };

  // Taşı tahtadan kaldırma
  const handlePieceDropOffBoard = (sourceSquare) => {
    game.remove(sourceSquare);
    setFenPosition(game.fen());
    return true;
  };

  // FEN giriş değişikliğini işle
  const handleFenInputChange = (e) => {
    const fen = e.target.value;
    setFenPosition(fen);
    
    try {
      // Şah kontrolünü bypass et
      game.load(fen, { bypass: [10] });
      setFenPosition(game.fen());
    } catch (error) {
      console.error("Geçersiz FEN:", error.message);
    }
  };

  // Tahtayı temizle
  const handleClearBoard = () => {
    game.clear();
    setFenPosition(game.fen());
  };

  // Başlangıç konumu
  const handleStartPosition = () => {
    game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", { bypass: [10] });
    setFenPosition(game.fen());
  };

  // Şahları yerleştir
  const handlePlaceKings = () => {
    game.clear();
    game.put({ type: 'k', color: 'w' }, 'h1');
    game.put({ type: 'k', color: 'b' }, 'h8');
    setFenPosition(game.fen());
  };

  const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];

  return (
    <div style={boardWrapper}>
      <ChessboardDnDProvider backend={HTML5Backend}>
        <div ref={boardRef}>
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
            position={fenPosition}
            boardOrientation={boardOrientation}
            onPieceDrop={handlePieceDrop}
            onPieceDropOffBoard={handlePieceDropOffBoard}
            onSparePieceDrop={handleSparePieceDrop}
            boardWidth={boardWidth}
            onBoardWidthChange={setBoardWidth}
            customBoardStyle={{ borderRadius: "4px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)" }}
            customDarkSquareStyle={{ backgroundColor: '#b58863' }}
            customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
            allowDragOutsideBoard={true}
            dropOffBoardAction="trash"
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
          />
          
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
        
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
          <button 
            style={buttonStyle} 
            onClick={handleStartPosition}
          >
            Başlangıç konumu ♟️
          </button>
          <button 
            style={buttonStyle} 
            onClick={handleClearBoard}
          >
            Tahtayı temizle 🗑️
          </button>
          <button 
            style={buttonStyle} 
            onClick={() => setBoardOrientation(boardOrientation === "white" ? "black" : "white")}
          >
            Tahtayı çevir 🔁
          </button>
          <button 
            style={buttonStyle} 
            onClick={handlePlaceKings}
          >
            Şahları Yerleştir 👑
          </button>
        </div>
        
        <input
          value={fenPosition}
          style={inputStyle}
          onChange={handleFenInputChange}
          placeholder="FEN pozisyonu yapıştırın"
        />
      </ChessboardDnDProvider>
    </div>
  );
};

export default BasicBoardPage;