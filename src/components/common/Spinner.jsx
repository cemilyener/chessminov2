import React from 'react';

/**
 * Yükleme animasyonu gösteren spinner bileşeni
 * @param {Object} props - Bileşen özellikleri
 * @param {string} [props.size="md"] - Spinner boyutu: "sm", "md" veya "lg" 
 * @returns {JSX.Element} Spinner bileşeni
 */
export const Spinner = ({ size = "md" }) => {
  // Boyut sınıflarını belirle
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };
  
  // Spinner için CSS sınıfları
  const classes = `${sizeClasses[size] || sizeClasses.md} rounded-full border-t-blue-500 border-blue-200 animate-spin`;
  
  return (
    <div className="inline-block">
      <div className={classes}></div>
    </div>
  );
};

export default Spinner;