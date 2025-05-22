import React from 'react';
import ChessboardCapture from './ChessboardCapture';
import './ChessboardStyle.css';

const ChessboardDisplay = () => {
  return (
    <div className="chess-display">
      {/* Özel görselleri kullanmak için */}
      <ChessboardCapture 
        boardId="unique-id"
        fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        orientation="white"
        useCustomImages={true} // Özel görselleri etkinleştir
      />
    </div>
  );
};

export default ChessboardDisplay;