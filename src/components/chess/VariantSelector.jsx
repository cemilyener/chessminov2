// components/chess/VariantSelector.jsx
import { useState } from 'react';

function VariantSelector({ variants, onVariantSelect }) {
  const [selectedVariant, setSelectedVariant] = useState('main');
  const [moveIndex, setMoveIndex] = useState(0);
  
  const handleVariantChange = (e) => {
    const variantId = e.target.value;
    setSelectedVariant(variantId);
    setMoveIndex(0); // Varyant değiştiğinde hamle indeksini sıfırla
    onVariantSelect(variantId, 0);
  };
  
  const handleMoveIndexChange = (e) => {
    const index = Number(e.target.value);
    setMoveIndex(index);
    onVariantSelect(selectedVariant, index);
  };
  
  // Seçili varyantın toplam hamle sayısı
  const selectedVariantMoves = variants.find(v => v.id === selectedVariant)?.nodes.length || 0;
  
  return (
    <div className="variant-selector">
      <label>
        Varyant: 
        <select value={selectedVariant} onChange={handleVariantChange}>
          {variants.map(variant => (
            <option key={variant.id} value={variant.id}>
              {variant.name} ({variant.nodes.length - 1} hamle)
            </option>
          ))}
        </select>
      </label>
      
      {selectedVariantMoves > 1 && (
        <div className="move-index-selector">
          <label>
            Hamle: 
            <input 
              type="range" 
              min="0" 
              max={selectedVariantMoves - 1} 
              value={moveIndex}
              onChange={handleMoveIndexChange}
            />
            <span>{moveIndex} / {selectedVariantMoves - 1}</span>
          </label>
        </div>
      )}
    </div>
  );
}

export default VariantSelector;