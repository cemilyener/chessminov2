import React from 'react';
import useAnalysisStore from '@/store/useAnalysisStore';

/**
 * Renk paleti bileşeni
 * Ok ve kare renklendirme için renk seçimi sağlar
 */
const ColorPalette = () => {
  const {
    currentArrowColor,
    currentHighlightColor,
    setCurrentArrowColor,
    setCurrentHighlightColor
  } = useAnalysisStore();
  
  // Kullanılabilecek renkler
  const colors = [
    { name: 'blue', className: 'bg-blue-500' },
    { name: 'red', className: 'bg-red-500' },
    { name: 'green', className: 'bg-green-500' },
    { name: 'yellow', className: 'bg-yellow-500' }
  ];

  return (
    <div className="color-palette bg-white p-4 rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Ok Rengi</h3>
        <div className="flex space-x-2">
          {colors.map((color) => (
            <button
              key={`arrow-${color.name}`}
              className={`
                w-8 h-8 rounded-full ${color.className} 
                transition-all duration-200 transform hover:scale-110
                ${currentArrowColor === color.name ? 'ring-2 ring-offset-2 ring-gray-400' : ''}
              `}
              onClick={() => setCurrentArrowColor(color.name)}
              title={`${color.name} ok`}
              aria-label={`${color.name} oku seç`}
            />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Kare Rengi</h3>
        <div className="flex space-x-2">
          {colors.map((color) => (
            <button
              key={`square-${color.name}`}
              className={`
                w-8 h-8 rounded-full ${color.className}
                transition-all duration-200 transform hover:scale-110
                ${currentHighlightColor === color.name ? 'ring-2 ring-offset-2 ring-gray-400' : ''}
              `}
              onClick={() => setCurrentHighlightColor(color.name)}
              title={`${color.name} kare`}
              aria-label={`${color.name} kare rengini seç`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;