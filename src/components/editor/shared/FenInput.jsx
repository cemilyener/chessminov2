import React from "react";

// Stil tanımı
const inputStyle = {
  padding: "10px 20px",
  margin: "10px 0",
  borderRadius: "6px",
  border: "1px solid #d3d3d3",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
  width: "100%",
};

/**
 * FEN pozisyonu için input bileşeni
 * @param {Object} props
 * @param {string} props.value - FEN değeri
 * @param {Function} props.onChange - Değişiklik olayı işleyicisi
 * @param {string} props.placeholder - Input için placeholder metni
 * @returns {JSX.Element}
 */
const FenInput = ({ value, onChange, placeholder = "FEN pozisyonu yapıştırın" }) => {
  return (
    <input
      value={value}
      style={inputStyle}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

export default FenInput;