import React from "react";
import { Chessboard } from "react-chessboard";

/**
 * Sadece FEN alıp react-chessboard kullanarak satranç tahtasını ve taşları çizen bileşen.
 * @param {Object} props
 * @param {string} props.fen - FEN pozisyonu
 * @param {number} props.boardWidth - Tahta genişliği
 * @param {string} props.boardOrientation - Tahta yönü ("white" veya "black")
 * @param {Function} props.onPieceDrop - Taş bırakıldığında çağrılan fonksiyon
 * @param {boolean} props.allowDragOutsideBoard - Taşın tahta dışına sürüklenebilmesine izin verir
 * @param {string} props.dropOffBoardAction - Taş tahta dışına bırakıldığında yapılacak eylem
 * @param {Object} props.customBoardStyle - Özel tahta stili
 * @param {Object} props.customDarkSquareStyle - Özel koyu kare stili
 * @param {Object} props.customLightSquareStyle - Özel açık kare stili
 * @param {Object} props.customPieces - Özel taşlar
 * @param {Function} props.onPieceDropOffBoard - Taş tahta dışına bırakıldığında çağrılan fonksiyon
 * @param {Function} props.onSparePieceDrop - Yedek taş tahta üzerine bırakıldığında çağrılan fonksiyon
 * @returns {JSX.Element}
 */
const BasicBoard = ({
  fen,
  boardWidth,
  boardOrientation = "white",
  onPieceDrop,
  allowDragOutsideBoard = true,
  dropOffBoardAction = "trash",
  customBoardStyle = { borderRadius: "4px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)" },
  customDarkSquareStyle = { backgroundColor: '#b58863' },
  customLightSquareStyle = { backgroundColor: '#f0d9b5' },
  customPieces,
  onPieceDropOffBoard,
  onSparePieceDrop,
  dndId
}) => {
  // Taş resimlerini public/pieces/ klasöründen yükleme
  const defaultCustomPieces = !customPieces ? 
    ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"].reduce(
      (acc, piece) => ({
        ...acc,
        [piece]: ({ squareWidth }) => (
          <img
            src={`/pieces/${piece}.png`}
            alt={piece}
            style={{ width: squareWidth, height: squareWidth }}
          />
        ),
      }), 
      {}
    ) : customPieces;

  return (
    <Chessboard
      id={dndId}
      position={fen}
      boardOrientation={boardOrientation}
      onPieceDrop={onPieceDrop}
      onPieceDropOffBoard={onPieceDropOffBoard}
      onSparePieceDrop={onSparePieceDrop}
      boardWidth={boardWidth}
      customBoardStyle={customBoardStyle}
      customDarkSquareStyle={customDarkSquareStyle}
      customLightSquareStyle={customLightSquareStyle}
      allowDragOutsideBoard={allowDragOutsideBoard}
      dropOffBoardAction={dropOffBoardAction}
      customPieces={defaultCustomPieces}
    />
  );
};

export default BasicBoard;