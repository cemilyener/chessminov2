import { Chessboard } from "react-chessboard";
import { useEffect } from "react";

function ChessboardComponent({ onChange, orientation, onReset }) {
  const handlePositionChange = (fen) => {
    onChange(fen);
  };

  useEffect(() => {
    if (onReset) {
      onReset(handlePositionChange);
    }
  }, [onReset]);

  return (
    <Chessboard
      position={orientation === "white" ? "start" : "start"}
      onDrop={(sourceSquare, targetSquare) => {
        const newPosition = handlePositionChange(sourceSquare + targetSquare);
        return newPosition;
      }}
      boardWidth={400}
      customDarkSquareStyle={{ backgroundColor: "#b58863" }}
      customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
      orientation={orientation}
    />
  );
}

export default ChessboardComponent;