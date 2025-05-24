import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Chessboard, ChessboardDnDProvider, SparePiece } from "react-chessboard";
import { ExtendedChess } from "../utils/chess/ExtendedChess.js";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useId } from "react";

const ChessboardComponent = ({ onChange, onReset, orientation = "white" }) => {
  // Start with empty board like BasicBoardPage
  const emptyFen = "8/8/8/8/8/8/8/8 w - - 0 1";
  const game = useMemo(() => new ExtendedChess(emptyFen, { bypass: [10] }), []);
  
  const [boardOrientation, setBoardOrientation] = useState(orientation);  const [boardWidth, setBoardWidth] = useState(400);
  const [fenPosition, setFenPosition] = useState(emptyFen);
  const boardRef = useRef(null);
  const uniqueId = useId();

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (boardRef.current) {
        setBoardWidth(boardRef.current.offsetWidth);
      }
    });
    if (boardRef.current) observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, []);

  // Notify parent when position changes
  useEffect(() => {
    if (onChange) {
      onChange(fenPosition);
    }
  }, [fenPosition, onChange]);

  // Handle piece drop from spare pieces (piece palette)
  const handleSparePieceDrop = (piece, targetSquare) => {
    const color = piece[0];
    const type = piece[1].toLowerCase();
    
    try {
      // Remove existing piece from target square
      game.remove(targetSquare);
      
      // Place new piece
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        setFenPosition(game.fen());
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
        setFenPosition(game.fen());
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
    setFenPosition(game.fen());
    return true;
  };
  // Reset board function
  const resetBoard = useCallback((type = "standard") => {
    if (type === "empty") {
      game.clear();
      setFenPosition(game.fen());
    } else {
      game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", { bypass: [10] });
      setFenPosition(game.fen());
    }
  }, [game]);

  // Provide reset function to parent
  useEffect(() => {
    if (onReset && typeof onReset === 'function') {
      onReset(resetBoard);
    }
  }, [onReset, resetBoard]);

  // Update orientation when prop changes
  useEffect(() => {
    setBoardOrientation(orientation);
  }, [orientation]);

  const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];

  return (
    <div className="w-full max-w-md">
      <ChessboardDnDProvider backend={HTML5Backend}>
        <div ref={boardRef}>
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
      </ChessboardDnDProvider>
    </div>
  );
};

export default ChessboardComponent;
