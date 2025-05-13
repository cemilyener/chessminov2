import React from "react";
import { SparePiece } from "react-chessboard";

/**
 * Satranç tahtası editörleri için taş paleti bileşeni
 * @param {Object} props
 * @param {string[]} props.pieces - Gösterilecek taşların kodları (örn: ["wP", "wN", ...])
 * @param {number} props.pieceWidth - Taş genişliği
 * @param {string} props.dndId - Sürükle-bırak operasyonları için benzersiz ID
 * @returns {JSX.Element}
 */
const PiecesPalette = ({ pieces, pieceWidth, dndId }) => {
  return (
    <div
      style={{
        display: "flex",
        margin: `${pieceWidth / 4}px ${pieceWidth / 1}px`,
        justifyContent: "center",
        flexWrap: "wrap"
      }}
    >
      {pieces.map(piece => (
        <SparePiece key={piece} piece={piece} width={pieceWidth} dndId={dndId}>
          <img
            src={`/pieces/${piece}.png`}
            alt={piece}
            style={{ width: "100%", height: "100%" }}
          />
        </SparePiece>
      ))}
    </div>
  );
};

export default PiecesPalette;