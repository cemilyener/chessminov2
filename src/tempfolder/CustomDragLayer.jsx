import React, { useCallback } from "react";
import { useDragLayer } from "react-dnd";

export const CustomDragLayer = ({ boardContainer, boardWidth, id, snapToCursor, allowDragOutsideBoard }) => {
  const { item, clientOffset, sourceClientOffset, isDragging } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    clientOffset: monitor.getClientOffset(),
    sourceClientOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  const getItemStyle = useCallback((clientOffset, sourceClientOffset) => {
    if (!clientOffset || !sourceClientOffset) return { display: "none" };

    let { x, y } = snapToCursor ? clientOffset : sourceClientOffset;
    const halfSquareWidth = boardWidth / 8 / 2;

    if (snapToCursor) {
      x -= halfSquareWidth;
      y -= halfSquareWidth;
    }

    if (!allowDragOutsideBoard) {
      const { left, top } = boardContainer;
      const maxLeft = left - halfSquareWidth;
      const maxTop = top - halfSquareWidth;
      const maxRight = left + boardWidth - halfSquareWidth;
      const maxBottom = top + boardWidth - halfSquareWidth;
      x = Math.max(maxLeft, Math.min(x, maxRight));
      y = Math.max(maxTop, Math.min(y, maxBottom));
    }

    return { transform: `translate(${x}px, ${y}px)`, WebkitTransform: `translate(${x}px, ${y}px)` };
  }, [snapToCursor, boardWidth, allowDragOutsideBoard, boardContainer]);

  return isDragging && item?.id === id ? (
    <div style={{ position: "fixed", pointerEvents: "none", zIndex: 10, left: 0, top: 0 }}>
      <div style={getItemStyle(clientOffset, sourceClientOffset)}>
        <img
          src={`/pieces/${item.piece}.png`}
          alt={item.piece}
          style={{ width: boardWidth / 8, height: boardWidth / 8 }}
        />
      </div>
    </div>
  ) : null;
};