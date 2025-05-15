import React from 'react';
import useAnalysisStore from '@/store/useAnalysisStore';

/**
 * Kare renklendirme bileşeni
 * Satranç tahtasındaki kareleri renklendirmek için fonksiyonlar sağlar
 */
const SquareHighlighter = () => {
  const {
    highlightedSquares,
    clearHighlights,
    currentHighlightColor
  } = useAnalysisStore();
  
  // Bu bileşen doğrudan render edilmiyor, sadece fonksiyonel mantık sağlıyor
  // Kontrol butonları oluşturur
  return (
    <div className="square-highlighter">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Seçili renk:</span>
          <div 
            className={`w-5 h-5 rounded-full bg-${currentHighlightColor}-500`} 
            style={{ backgroundColor: currentHighlightColor }}
          />
        </div>
        
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded-md text-sm"
          onClick={clearHighlights}
          disabled={Object.keys(highlightedSquares).length === 0}
        >
          Renkleri Temizle
          <span className="ml-1 text-xs">
            ({Object.keys(highlightedSquares).length})
          </span>
        </button>
      </div>
    </div>
  );
};

// Kare renklendirilmesi için stil oluşturma yardımcı fonksiyonu
export const getSquareStyles = (highlightedSquares) => {
  const styles = {};
  
  Object.entries(highlightedSquares).forEach(([square, color]) => {
    styles[square] = {
      backgroundColor: getColorWithOpacity(color, 0.5)
    };
  });
  
  return styles;
};

// Renkleri opacity ile düzenleme yardımcı fonksiyonu
const getColorWithOpacity = (color, opacity = 0.5) => {
  switch (color) {
    case 'blue': return `rgba(59, 130, 246, ${opacity})`;
    case 'red': return `rgba(239, 68, 68, ${opacity})`;
    case 'green': return `rgba(34, 197, 94, ${opacity})`;
    case 'yellow': return `rgba(234, 179, 8, ${opacity})`;
    default: return `rgba(59, 130, 246, ${opacity})`;
  }
};

export default SquareHighlighter;