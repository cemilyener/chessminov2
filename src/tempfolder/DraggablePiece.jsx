import React from 'react';
import { useDrag } from 'react-dnd';

const DraggablePiece = ({ piece, sourceSquare = null }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'chess-piece',
    item: { piece, sourceSquare },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }), [piece, sourceSquare]);  // dependency array ekleyin

  return (
    <div
      ref={drag}
      className={`w-10 h-10 flex items-center justify-center border cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <img 
        src={`/pieces/${piece}.png`} 
        alt={piece} 
        className="w-8 h-8"
        onError={(e) => {
          // Resim yüklenemezse hata yakalamak için
          e.target.src = '/pieces/fallback.png'; // Yedek resim
          console.warn(`Taş resmi yüklenemedi: ${piece}`);
        }}
      />
    </div>
  );
};

export default DraggablePiece;