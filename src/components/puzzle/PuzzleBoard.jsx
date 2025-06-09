// src/components/puzzle/PuzzleBoard.jsx
import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';

const PuzzleBoard = ({ 
  position, 
  onMove, 
  boardWidth = 500,
  orientation = 'white',
  highlightedSquares = [],
  boardKey = 0 // Flash problem fix
}) => {
  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});

  // Reset move selection when position changes
  useEffect(() => {
    setMoveFrom('');
    setOptionSquares({});
  }, [position]);

  // Handle square click for move input
  const onSquareClick = (square) => {
    if (!moveFrom) {
      // First click - select piece
      setMoveFrom(square);
      // TODO: Highlight legal moves
    } else {
      // Second click - make move
      const moveData = {
        from: moveFrom,
        to: square,
        promotion: 'q' // Auto-promote to queen
      };
      
      // Call parent's onMove handler
      const moveResult = onMove(moveData);
      
      // Reset selection
      setMoveFrom('');
      setOptionSquares({});
    }
  };

  // Handle drag and drop
  const onDrop = (sourceSquare, targetSquare) => {
    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    };
    
    return onMove(moveData);
  };

  // Custom square styles
  const customSquareStyles = {
    ...highlightedSquares.reduce((acc, square) => ({
      ...acc,
      [square]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    }), {}),
    ...(moveFrom && {
      [moveFrom]: { backgroundColor: 'rgba(255, 255, 0, 0.6)' }
    }),
    ...optionSquares
  };

  return (
    <div className="puzzle-board-container">
      <Chessboard
        key={boardKey} // Prevents flash on reset
        position={position}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        boardOrientation={orientation}
        boardWidth={boardWidth}
        customSquareStyles={customSquareStyles}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
        }}
        arePiecesDraggable={true}
        areSquaresClickable={true}
      />
    </div>
  );
};

export default PuzzleBoard;