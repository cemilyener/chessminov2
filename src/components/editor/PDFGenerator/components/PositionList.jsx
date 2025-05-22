import React, { memo } from 'react';
import { usePDFStore } from '../store/usePDFStore';

/**
 * PositionList - Shows list of positions and allows reordering
 */
const PositionList = () => {
  const positions = usePDFStore((state) => state.positions);
  const currentPositionId = usePDFStore((state) => state.currentPositionId);
  const setCurrentPositionId = usePDFStore((state) => state.setCurrentPositionId);
  const removePosition = usePDFStore((state) => state.removePosition);
  const movePosition = usePDFStore((state) => state.movePosition);

  if (!positions.length) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
        Henüz pozisyon eklenmedi. Yeni bir pozisyon oluşturun.
      </div>
    );
  }

  return (
    <div className="position-list">
      <h3 className="text-lg font-bold mb-3">Pozisyonlar</h3>
      <div className="space-y-2">
        {positions.map((position, index) => (
          <div 
            key={position.id} 
            className={`
              position-item p-3 border rounded-lg flex items-center justify-between
              ${currentPositionId === position.id ? 'bg-blue-50 border-blue-300' : 'bg-white'}
            `}
            onClick={() => setCurrentPositionId(position.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{position.title || `Pozisyon ${index + 1}`}</h4>
                {position.description && (
                  <p className="text-sm text-gray-500 truncate max-w-xs">{position.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {index > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); movePosition(position.id, 'up'); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ↑
                </button>
              )}
              
              {index < positions.length - 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); movePosition(position.id, 'down'); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ↓
                </button>
              )}
              
              <button 
                onClick={(e) => { e.stopPropagation(); removePosition(position.id); }}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(PositionList);
