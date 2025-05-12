import React, { useState, useCallback, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { ExtendedChess } from '../../utils/chess/ExtendedChess.js';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrop } from 'react-dnd';
import useChessStore from '../../store/useChessStore';
import DraggablePiece from './DraggablePiece';
import ManualBoardEditor from './ManualBoardEditor';

// Tahta üst/alt kenarları için satranç taşı sembolleri
const PieceSymbols = () => (
  <div className="flex justify-center mb-2">
    <div className="flex space-x-2">
      {['wP', 'wN', 'wB', 'wR', 'wQ', 'wK'].map(piece => (
        <img key={piece} src={`/pieces/${piece}.png`} alt={piece} className="w-9 h-9" />
      ))}
    </div>
  </div>
);

// Taş paleti için ayrı bir bileşen (useDrop burada kullanılacak)
const DropArea = ({ children, placePiece, removePiece }) => {
  const boardRef = useRef(null);
  
  const [, drop] = useDrop(() => ({
    accept: 'chess-piece',
    drop: (item, monitor) => {
      const boardRect = document.getElementById('basicBoard')?.getBoundingClientRect();
      if (!boardRect) return;

      const { x, y } = monitor.getClientOffset() || { x: 0, y: 0 };
      
      // Tahtanın dışına mı bırakıldı kontrol et
      if (x < boardRect.left || x > boardRect.right || 
          y < boardRect.top || y > boardRect.bottom) {
        if (item.sourceSquare) {
          // Eğer kaynağı bir kare ise, o kareyi temizle
          removePiece(item.sourceSquare);
        }
        return;
      }
      
      // Bu kısım önemli - kaldırılmış olabilir
      const boardWidth = boardRect.width;
      const squareSize = boardWidth / 8;

      const file = Math.floor((x - boardRect.left) / squareSize);
      const rank = 7 - Math.floor((y - boardRect.top) / squareSize);

      if (file < 0 || file > 7 || rank < 0 || rank > 7) return;

      const square = String.fromCharCode(97 + file) + (rank + 1);
      placePiece(square, item.piece);
    },
  }), [placePiece, removePiece]);

  // Not: ref'i doğru nesneye bağladığınızdan emin olun
  return <div ref={drop} className="relative" style={{minHeight: "400px"}}>{children}</div>;
};

const BasicBoard = () => {
  const { 
    currentFen, 
    setPosition,
    arrows, 
    addArrow, 
    clearArrows,
    highlightedSquares, 
    highlightSquare, 
    clearHighlightedSquare, 
    clearAllHighlights 
  } = useChessStore();

  const [selectedSquare, setSelectedSquare] = useState(null);
  const [currentArrowColor, setCurrentArrowColor] = useState("blue"); 
  const [currentHighlightColor, setCurrentHighlightColor] = useState("blue");
  const [editMode, setEditMode] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [customFen, setCustomFen] = useState('');
  const [useManualEditor, setUseManualEditor] = useState(false);

  const placePiece = useCallback((square, piece) => {
    try {
      // Chess yerine ExtendedChess kullanın ve şahsız konumları bypass edin
      const chess = new ExtendedChess(currentFen, { bypass: [10] });
      if (piece === '') {
        chess.remove(square);
      } else {
        const pieceType = piece.charAt(1).toLowerCase();
        const pieceColor = piece.charAt(0) === 'w' ? 'w' : 'b';
        chess.remove(square);
        chess.put({ type: pieceType, color: pieceColor }, square);
      }
      // Şahsız konumlar için setPosition'a ikinci parametre olarak true ekleyin
      setPosition(chess.fen(), true);
    } catch (error) {
      console.error("Taş yerleştirme hatası:", error);
    }
  }, [currentFen, setPosition]);

  const removePiece = useCallback((square) => {
    try {
      const chess = new ExtendedChess(currentFen, { bypass: [10] });
      chess.remove(square);
      setPosition(chess.fen(), true);
    } catch (error) {
      console.error("Taş kaldırma hatası:", error);
    }
  }, [currentFen, setPosition]);

  const handleSquareClick = useCallback((square) => {
    if (editMode) {
      if (selectedPiece !== null) {
        placePiece(square, selectedPiece);
        return;
      }
    }
    if (selectedSquare) {
      if (selectedSquare !== square) {
        addArrow(selectedSquare, square, currentArrowColor);
      }
      setSelectedSquare(null);
    } else {
      setSelectedSquare(square);
    }
  }, [selectedSquare, addArrow, currentArrowColor, editMode, selectedPiece, placePiece]);

  const handleSquareRightClick = useCallback((square) => {
    if (highlightedSquares[square]) {
      clearHighlightedSquare(square);
    } else {
      highlightSquare(square, currentHighlightColor);
    }
    return false;
  }, [highlightedSquares, highlightSquare, clearHighlightedSquare, currentHighlightColor]);

  const handleFenChange = (e) => {
    setCustomFen(e.target.value);
    // Enter tuşu veya paste işlemi için değil, her değişiklikte yükleme yap
    if (e.target.value) {
      loadFen(e.target.value);
    }
  };

  const loadFen = useCallback((fen = customFen) => {
    if (!fen) return;
    
    try {
      const chess = new ExtendedChess(fen, { bypass: [10] });
      setPosition(chess.fen(), true);
      setCustomFen('');
    } catch (error) {
      console.error('Geçersiz FEN:', error);
      alert('Geçersiz FEN formatı!');
    }
  }, [customFen, setPosition]);

  const customSquareStyles = {};
  Object.entries(highlightedSquares).forEach(([square, color]) => {
    customSquareStyles[square] = { 
      backgroundColor: typeof color === 'string' ? 
        `rgba(${color === 'blue' ? '0, 0, 255' : 
              color === 'red' ? '255, 0, 0' : 
              color === 'green' ? '0, 128, 0' : 
              color === 'yellow' ? '255, 255, 0' : '0, 0, 255'}, 0.4)` : undefined
    };
  });
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = { 
      ...customSquareStyles[selectedSquare],
      border: '2px solid rgba(255, 165, 0, 0.8)',
      boxSizing: 'border-box'
    };
  }

  // Eğer manuel editör modunu kullanıyorsa, ManualBoardEditor'ı göster
  if (useManualEditor) {
    return (
      <div className="chess-editor-container">
        <div className="mb-4 flex items-center">
          <button
            onClick={() => setUseManualEditor(false)}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Temel Editöre Dön
          </button>
        </div>
        
        <ManualBoardEditor />
      </div>
    );
  }

  return (
    <div className="chess-editor-container">
      <PieceSymbols />
      
      <div className="relative">
        {/* Butonlar ve modlar */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button 
            onClick={() => setEditMode(!editMode)}
            className={`px-3 py-1 rounded text-sm ${editMode ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {editMode ? 'Düzenleme Modu Açık' : 'Düzenleme Modu'}
          </button>
          <button 
            onClick={() => setUseManualEditor(true)}
            className="px-3 py-1 bg-green-100 hover:bg-green-200 rounded text-sm"
          >
            Gelişmiş Editör
          </button>
          {!editMode && (
            <>
              <button onClick={clearArrows} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">
                Okları Temizle
              </button>
              <button onClick={clearAllHighlights} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">
                Renkleri Temizle
              </button>
            </>
          )}
          {editMode && (
            <>
              <button 
                onClick={() => setPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')}
                className="px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded text-sm"
              >
                Başlangıç Konumu
              </button>
              <button 
                onClick={() => setPosition('8/8/8/8/8/8/8/8 w - - 0 1', true)}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
              >
                Tahtayı Temizle
              </button>
            </>
          )}
        </div>
        
        {/* FEN Giriş Alanı */}
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="text"
              className="flex-grow p-2 border rounded text-sm"
              placeholder="FEN pozisyonu girin..."
              value={customFen}
              onChange={handleFenChange}
              onPaste={(e) => {
                // Yapıştırılan metni hemen yükleme
                const pastedText = e.clipboardData.getData('text');
                if (pastedText) {
                  e.preventDefault();
                  loadFen(pastedText);
                }
              }}
            />
            <button 
              className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
              onClick={() => {
                navigator.clipboard.writeText(currentFen);
              }}
            >
              Kopyala
            </button>
          </div>
        </div>
        
        {/* Taş Paleti - DndProvider yalnızca taş paletini ve DropArea'yı sarmalı */}
        {editMode && (
          <DndProvider backend={HTML5Backend}>
            <div className="mb-4">
              <div className="p-2 border rounded bg-gray-50">
                <h3 className="text-sm font-medium mb-2">Taş Paleti (Sürükleyip Bırakın)</h3>
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {['wP', 'wN', 'wB', 'wR', 'wQ', 'wK'].map(piece => (
                    <DraggablePiece key={piece} piece={piece} />
                  ))}
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {['bP', 'bN', 'bB', 'bR', 'bQ', 'bK'].map(piece => (
                    <DraggablePiece key={piece} piece={piece} />
                  ))}
                </div>
              </div>
            </div>

            <DropArea placePiece={placePiece} removePiece={removePiece}>
              <Chessboard
                position={currentFen}
                onSquareClick={handleSquareClick}
                onSquareRightClick={handleSquareRightClick}
                customSquareStyles={customSquareStyles}
                customArrows={arrows}
                id="basicBoard"
                boardWidth={400}
                isDraggablePiece={(piece) => true} // Tüm taşları sürüklenebilir yap
                onPieceDragBegin={(piece, sourceSquare) => {
                  // Taşların tahta üzerindeki sürükleme işlemi için bilgi saklama
                  return { piece, sourceSquare };
                }}
                onPieceDrop={(sourceSquare, targetSquare) => {
                  if (targetSquare === 'offboard') {
                    removePiece(sourceSquare);
                    return true;
                  }
                  
                  try {
                    const chess = new ExtendedChess(currentFen, { bypass: [10] });
                    const piece = chess.get(sourceSquare);
                    chess.remove(sourceSquare);
                    chess.put(piece, targetSquare);
                    setPosition(chess.fen(), true);
                    return true;
                  } catch (error) {
                    return false;
                  }
                }}
              />
            </DropArea>
          </DndProvider>
        )}

        {/* Edit mod kapalıyken Chessboard'u DndProvider dışında tut */}
        {!editMode && (
          <>
            <div className="mb-4 flex space-x-2 items-center">
              <span className="text-sm">Ok Rengi:</span>
              <div className="flex space-x-1">
                {['blue', 'red', 'green', 'yellow'].map(color => (
                  <button
                    key={color}
                    onClick={() => setCurrentArrowColor(color)}
                    className={`w-6 h-6 rounded-full ${
                      color === 'blue' ? 'bg-blue-500' :
                      color === 'red' ? 'bg-red-500' :
                      color === 'green' ? 'bg-green-500' :
                      'bg-yellow-500'
                    } ${currentArrowColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  />
                ))}
              </div>
              <span className="ml-4 text-sm">Kare Rengi:</span>
              <div className="flex space-x-1">
                {['blue', 'red', 'green', 'yellow'].map(color => (
                  <button
                    key={color}
                    onClick={() => setCurrentHighlightColor(color)}
                    className={`w-6 h-6 rounded-full ${
                      color === 'blue' ? 'bg-blue-500' :
                      color === 'red' ? 'bg-red-500' :
                      color === 'green' ? 'bg-green-500' :
                      'bg-yellow-500'
                    } ${currentHighlightColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  />
                ))}
              </div>
            </div>
            <Chessboard
              position={currentFen}
              onSquareClick={handleSquareClick}
              onSquareRightClick={handleSquareRightClick}
              customSquareStyles={customSquareStyles}
              customArrows={arrows}
              id="basicBoard"
            />
          </>
        )}
        
        <div className="mt-2 text-sm text-gray-600">
          {editMode ? (
            <>
              <p>• Taş paletinden bir taş seçip kareye tıklayabilir ya da sürükleyip bırakabilirsiniz</p>
              <p>• "Taş Kaldır" butonunu seçip bir kareye tıklayarak taşları kaldırabilirsiniz</p>
            </>
          ) : (
            <>
              <p>• Sol tıklama ile ok çizin (iki kareye sırayla tıklayın)</p>
              <p>• Sağ tıklama ile kare rengini değiştirin</p>
            </>
          )}
        </div>
      </div>
      
      <div className="flex justify-center mt-2">
        <div className="flex space-x-2">
          {['bP', 'bN', 'bB', 'bR', 'bQ', 'bK'].map(piece => (
            <img key={piece} src={`/pieces/${piece}.png`} alt={piece} className="w-9 h-9" />
          ))}
        </div>
      </div>
      
      {/* Butonlar için yeni tasarım */}
      <div className="flex justify-center mt-4 space-x-2">
        <button 
          onClick={() => setPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')}
          className="px-4 py-2 bg-amber-100 hover:bg-amber-200 rounded text-sm border"
        >
          Başlangıç konumu
        </button>
        <button 
          onClick={() => setPosition('8/8/8/8/8/8/8/8 w - - 0 1', true)}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-sm border"
        >
          Tahtayı temizle
        </button>
        <button
          onClick={() => {
            const el = document.createElement('canvas');
            el.width = 400;
            el.height = 400;
            const ctx = el.getContext('2d');
            const boardImg = document.querySelector('#basicBoard');
            if (boardImg) {
              ctx.drawImage(boardImg, 0, 0, 400, 400);
              el.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'satranc_tahta.png';
                a.click();
                URL.revokeObjectURL(url);
              });
            }
          }}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded text-sm border flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          Tahta görüntüsü
        </button>
      </div>
    </div>
  );
};

export default BasicBoard;