import React from "react";

// Stil tanımı
const buttonStyle = {
  cursor: "pointer",
  padding: "10px 20px",
  margin: "10px 10px 0px 0px",
  borderRadius: "6px",
  backgroundColor: "#f0d9b5",
  border: "1px solid #d3d3d3",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
};

/**
 * Satranç tahtası için kontrol butonları bileşeni
 * @param {Object} props
 * @param {Function} props.onStartPosition - Başlangıç konumuna getirme işlevi
 * @param {Function} props.onClearBoard - Tahtayı temizleme işlevi
 * @param {Function} props.onFlipBoard - Tahtayı çevirme işlevi
 * @param {Function} props.onPlaceKings - Şahları yerleştirme işlevi
 * @returns {JSX.Element}
 */
const BoardControls = ({ onStartPosition, onClearBoard, onFlipBoard, onPlaceKings }) => {
  return (
    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
      <button 
        style={buttonStyle} 
        onClick={onStartPosition}
      >
        Başlangıç konumu ♟️
      </button>
      <button 
        style={buttonStyle} 
        onClick={onClearBoard}
      >
        Tahtayı temizle 🗑️
      </button>
      <button 
        style={buttonStyle} 
        onClick={onFlipBoard}
      >
        Tahtayı çevir 🔁
      </button>
      <button 
        style={buttonStyle} 
        onClick={onPlaceKings}
      >
        Şahları Yerleştir 👑
      </button>
    </div>
  );
};

export default BoardControls;