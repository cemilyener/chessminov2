// src/components/puzzle/PuzzleBoard.jsx
import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';

const PuzzleBoard = ({ 
  position, 
  onMove, 
  onRightClick, // YENİ PROP
  boardWidth = 500, 
  orientation = "white",
  customSquareStyles = {},
  disabled = false,
  ...props 
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
    const result = onMove(moveData); // onMove should return a boolean for react-chessboard
    return result !== null && typeof result !== 'undefined' ? result : false; // Ensure a boolean is returned
  };

  // Custom square styles
  // The `highlightedSquares` prop from PuzzlePage is now directly passed as `customSquareStyles`
  // So, we just need to combine it with the moveFrom and optionSquares logic.
  const combinedSquareStyles = {
    ...customSquareStyles, // Styles from PuzzlePage (hints)
    ...(moveFrom && { // Style for the selected 'from' square
      [moveFrom]: { backgroundColor: 'rgba(255, 255, 0, 0.6)' } 
    }),
    ...optionSquares, // Styles for legal move options (if you implement this)
  };

  // YENİ: Right-click event handler
  const handleRightClick = (square) => {
    if (disabled || !onRightClick) return;
    
    // Prevent default context menu
    event.preventDefault();
    
    onRightClick(square);
  };

  return (
    <div 
      className="puzzle-board-container"
      onContextMenu={(e) => e.preventDefault()} // Prevent default right-click menu
    >
      <Chessboard
        position={position}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        onSquareRightClick={handleRightClick} // YENİ: Right-click handler
        boardOrientation={orientation}
        boardWidth={boardWidth}
        customSquareStyles={combinedSquareStyles} // Use combined styles
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
        }}
        arePiecesDraggable={true}
        areSquaresClickable={true}
        isDraggablePiece={({ piece, sourceSquare }) => !disabled}
        {...props}
      />
    </div>
  );
};

export default PuzzleBoard;