import React from 'react';

const ChessBoard = ({ position, onPieceDrop }) => {
  // ... Satranç tahtası görseli ve taşlar burada olacak ...
  return (
    <div className="chess-board-placeholder">
      <p>Satranç Tahtası (Pozisyon: {position})</p>
      {/* Gerçek uygulamada burada tahta ve taşlar olacak */}
    </div>
  );
};

export default ChessBoard;
