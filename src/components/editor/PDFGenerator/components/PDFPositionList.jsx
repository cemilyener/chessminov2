import React from 'react';
import { usePDFStore } from '../store/usePDFStore';

/**
 * PDF oluşturucu için pozisyon listesini gösteren ve yöneten bileşen
 */
const PDFPositionList = () => {
  const positions = usePDFStore(state => state.positions);
  const removePosition = usePDFStore(state => state.removePosition);
  const setCurrentPosition = usePDFStore(state => state.setCurrentPosition);
  const currentPositionId = usePDFStore(state => state.currentPositionId);

  if (positions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Pozisyon Listesi</h3>
        <div className="py-8 text-center text-gray-500">
          <p className="mb-2 text-lg">Henüz pozisyon eklenmedi</p>
          <p className="text-sm">Yeni bir pozisyon eklemek için editörü kullanın</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Pozisyon Listesi</h3>
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {positions.length} pozisyon
        </span>
      </div>

      <div className="overflow-y-auto max-h-96">
        <ul className="divide-y divide-gray-200">
          {positions.map((position) => (
            <li key={position.id} className="py-3">
              <div className="flex items-start">
                {/* Thumbnail */}
                <div 
                  className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded overflow-hidden mr-3"
                  style={{ 
                    backgroundImage: position.screenshot ? `url(${position.screenshot})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!position.screenshot && (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {position.title}
                  </h4>
                  {position.description && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {position.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    FEN: {position.fen ? position.fen.substring(0, 20) + '...' : 'Mevcut değil'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex ml-2">
                  <button
                    onClick={() => setCurrentPosition(position.id)}
                    className={`p-1 rounded-md ${currentPositionId === position.id ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-blue-600'}`}
                    title="Düzenle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Bu pozisyonu silmek istediğinizden emin misiniz?')) {
                        removePosition(position.id);
                        if (currentPositionId === position.id) {
                          setCurrentPosition(null);
                        }
                      }
                    }}
                    className="ml-2 p-1 rounded-md text-gray-400 hover:text-red-600"
                    title="Sil"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {positions.length > 0 && currentPositionId && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setCurrentPosition(null)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Yeni pozisyon ekle
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFPositionList;