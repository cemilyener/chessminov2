import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Chessboard, ChessboardDnDProvider, SparePiece } from "react-chessboard";
import { ExtendedChess } from "../../../utils/chess/ExtendedChess.js";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useId } from "react";
import usePdfStore from './usePdfStore';

// Styles
const buttonStyle = {
  cursor: "pointer",
  padding: "8px 16px",
  margin: "6px 6px 0px 0px",
  borderRadius: "6px",
  backgroundColor: "#f0d9b5",
  border: "1px solid #d3d3d3",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
  fontSize: "12px"
};

const PDFBoardEditor = ({ 
  initialPosition = "8/8/8/8/8/8/8/8 w - - 0 1",
  onPositionChange,
  onCapturePosition,
  moveOrder = "white",
  isCapturing
}) => {
  const { setPosition } = usePdfStore();
  const uniqueId = useId();
  const boardRef = useRef(null);
  const prevFenRef = useRef(null); // Bu ref'i buraya taşıdık
  
  // FEN dizesinde hamle sırasını günceller, ancak durum değişikliği yapmaz
  const updateFenMoveOrder = useCallback((fen, moveOrderValue) => {
    const parts = fen.split(' ');
    if (parts.length > 1) {
      parts[1] = moveOrderValue === 'white' ? 'w' : 'b';
      return parts.join(' ');
    }
    return fen;
  }, []);
  
  // İlk değerleri oluştur
  const initialFen = useMemo(() => 
    updateFenMoveOrder(initialPosition, moveOrder),
    [initialPosition, moveOrder, updateFenMoveOrder]
  );
  
  // State'leri tanımla
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [boardWidth, setBoardWidth] = useState(320);
  const [fenPosition, setFenPosition] = useState(initialFen);
  const [currentMoveOrder, setCurrentMoveOrder] = useState(moveOrder);
  
  // ExtendedChess ile şahsız konumları destekleme
  const game = useMemo(() => 
    new ExtendedChess(initialFen, { bypass: [10] }),
    [initialFen]
  );
  
  // PDF için optimize edilmiş boyut hesaplama
  useEffect(() => {
    const handleResize = () => {
      const containerWidth = document.querySelector('.pdf-board-container')?.offsetWidth || 320;
      setBoardWidth(Math.min(containerWidth * 0.9, 320));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // FEN pozisyonu değiştiğinde parent'a bildir
  useEffect(() => {
    // İlk render için prev değeri ayarla
    if (prevFenRef.current === null) {
      prevFenRef.current = fenPosition;
      return;
    }
    
    // Eğer değişiklik yoksa çalıştırma
    if (prevFenRef.current === fenPosition) {
      return;
    }
    
    // Mevcut değeri güncelle
    prevFenRef.current = fenPosition;
    
    // PDF Store'u güncelle
    try {
      setPosition(fenPosition, true);
    } catch (error) {
      console.error("PDF Store güncelleme hatası:", error);
    }
    
    // Parent bileşene pozisyon değişikliğini bildir
    if (onPositionChange) {
      onPositionChange(fenPosition, currentMoveOrder);
    }
  }, [fenPosition, currentMoveOrder, onPositionChange, setPosition]);

  // Taş yerleştirme işlevi (yedek taş paletinden)
  const handleSparePieceDrop = useCallback((piece, targetSquare) => {
    const color = piece[0];
    const type = piece[1].toLowerCase();
    
    try {
      // Karedeki mevcut taşı kaldır
      game.remove(targetSquare);
      
      // Yeni taşı yerleştir
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        // FEN'i güncelle ve hamle sırasını koru
        const newFen = game.fen();
        const updatedFen = updateFenMoveOrder(newFen, currentMoveOrder);
        setFenPosition(updatedFen);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Taş yerleştirme hatası:", error.message);
      return false;
    }
  }, [game, currentMoveOrder, updateFenMoveOrder]);

  // Taş taşıma işlevi
  const handlePieceDrop = useCallback((sourceSquare, targetSquare, piece) => {
    try {
      // Kaynak ve hedef karelerdeki taşları kaldır
      game.remove(sourceSquare);
      game.remove(targetSquare);
      
      const color = piece[0];
      const type = piece[1].toLowerCase();
      
      // Taşı hedef kareye yerleştir
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        // FEN'i güncelle ve hamle sırasını koru
        const newFen = game.fen();
        const updatedFen = updateFenMoveOrder(newFen, currentMoveOrder);
        setFenPosition(updatedFen);
      }
      
      return success;
    } catch (error) {
      console.error("Taş taşıma hatası:", error.message);
      return false;
    }
  }, [game, currentMoveOrder, updateFenMoveOrder]);

  // Taşı tahtadan kaldırma
  const handlePieceDropOffBoard = useCallback((sourceSquare) => {
    game.remove(sourceSquare);
    
    // FEN'i güncelle ve hamle sırasını koru
    const newFen = game.fen();
    const updatedFen = updateFenMoveOrder(newFen, currentMoveOrder);
    setFenPosition(updatedFen);
    
    return true;
  }, [game, currentMoveOrder, updateFenMoveOrder]);

  // Tahtayı temizle
  const handleClearBoard = useCallback(() => {
    game.clear();
    
    // FEN'i güncelle ve hamle sırasını koru
    const newFen = game.fen();
    const updatedFen = updateFenMoveOrder(newFen, currentMoveOrder);
    setFenPosition(updatedFen);
  }, [game, currentMoveOrder, updateFenMoveOrder]);

  // Başlangıç konumu
  const handleStartPosition = useCallback(() => {
    game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", { bypass: [10] });
    
    // FEN'i güncelle ve hamle sırasını koru
    const newFen = game.fen();
    const updatedFen = updateFenMoveOrder(newFen, currentMoveOrder);
    setFenPosition(updatedFen);
  }, [game, currentMoveOrder, updateFenMoveOrder]);
  
  // Hamle sırası değiştirme
  const toggleMoveOrder = useCallback(() => {
    const newMoveOrder = currentMoveOrder === 'white' ? 'black' : 'white';
    setCurrentMoveOrder(newMoveOrder);
    
    // FEN'deki hamle sırasını da güncelle
    const updatedFen = updateFenMoveOrder(fenPosition, newMoveOrder);
    setFenPosition(updatedFen);
  }, [fenPosition, currentMoveOrder, updateFenMoveOrder]);
  
  // Ekran görüntüsü alma
  const captureScreenshot = useCallback(() => {
    try {
      if (!boardRef.current) {
        console.warn('Board referansı bulunamadı');
        return;
      }
      
      if (typeof onCapturePosition === 'function') {
        onCapturePosition({
          fen: fenPosition,
          moveOrder: currentMoveOrder
        });
      } else {
        console.warn('onCapturePosition prop is not a function or not provided');
      }
    } catch (error) {
      console.error("Ekran görüntüsü alma hatası:", error);
    }
  }, [fenPosition, currentMoveOrder, onCapturePosition]);

  const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];

  // Tahta boyutu ayarları
  const boardWidthFixed = 400; // Sabit genişlik
  const boardHeightFixed = 400; // Sabit yükseklik

  return (
    <div className="pdf-chess-editor">
      <div ref={boardRef} className="pdf-board-container" id="capture-this-board" data-capture-element="true" style={{ width: `${boardWidthFixed}px`, height: `${boardHeightFixed}px`, position: 'relative', backgroundColor: '#fff', border: '1px solid #ddd', padding: '10px', margin: '0 auto', boxSizing: 'content-box' }}>
        <ChessboardDnDProvider backend={HTML5Backend}>
          {/* Siyah taşların paleti */}
          <div className="flex justify-center gap-1 mb-2">
            {pieces.slice(6, 12).map(piece => (
              <div key={piece} className="piece-container p-1 rounded hover:bg-gray-100">
                <SparePiece
                  key={piece}
                  piece={piece}
                  width={boardWidth / 9}
                  dndId={uniqueId}
                >
                  <img 
                    src={`/pieces/${piece}.png`}
                    alt={piece}
                    style={{ width: "100%", height: "100%" }}
                  />
                </SparePiece>
              </div>
            ))}
          </div>
          
          {/* Satranç tahtası */}
          <Chessboard
            id={uniqueId}
            position={fenPosition}
            boardOrientation={boardOrientation}
            onPieceDrop={handlePieceDrop}
            onPieceDropOffBoard={handlePieceDropOffBoard}
            onSparePieceDrop={handleSparePieceDrop}
            boardWidth={boardWidthFixed}
            customBoardStyle={{ borderRadius: "4px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)" }}
            customDarkSquareStyle={{ backgroundColor: '#b58863' }}
            customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
            allowDragOutsideBoard={true}
            dropOffBoardAction="trash"
          />
          
          {/* Beyaz taşların paleti */}
          <div className="flex justify-center gap-1 mt-2">
            {pieces.slice(0, 6).map(piece => (
              <div key={piece} className="piece-container p-1 rounded hover:bg-gray-100">
                <SparePiece
                  key={piece}
                  piece={piece}
                  width={boardWidth / 9}
                  dndId={uniqueId}
                >
                  <img 
                    src={`/pieces/${piece}.png`}
                    alt={piece}
                    style={{ width: "100%", height: "100%" }}
                  />
                </SparePiece>
              </div>
            ))}
          </div>
          
          {/* Kontrol butonları */}
          <div className="mt-3 flex flex-wrap justify-center">
            <button style={buttonStyle} onClick={handleStartPosition} className="hover:bg-amber-100">
              Başlangıç ♟️
            </button>
            <button style={buttonStyle} onClick={handleClearBoard} className="hover:bg-amber-100">
              Temizle 🗑️
            </button>
            <button style={buttonStyle} onClick={() => setBoardOrientation(boardOrientation === "white" ? "black" : "white")} className="hover:bg-amber-100">
              Çevir 🔁
            </button>
            <button 
              style={{...buttonStyle, backgroundColor: currentMoveOrder === 'white' ? '#f0f0f0' : '#555555', color: currentMoveOrder === 'white' ? '#000' : '#fff'}} 
              onClick={toggleMoveOrder} 
              className="hover:opacity-80"
            >
              {currentMoveOrder === 'white' ? 'Beyaz' : 'Siyah'}
            </button>
            <button style={{...buttonStyle, backgroundColor: '#e6f2e6'}} onClick={captureScreenshot} className="hover:bg-green-100">
              Ekle ✓
            </button>
          </div>
        </ChessboardDnDProvider>
      </div>
      <div className="flex justify-between mt-3">
        <button 
          onClick={() => onCapturePosition({ fen: initialPosition, moveOrder })} 
          disabled={isCapturing}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
        >
          {isCapturing ? "Kaydediliyor..." : "Pozisyonu Kaydet"}
        </button>
        {/* Diğer butonlar */}
      </div>
    </div>
  );
};

// React.memo kullanarak gereksiz yeniden render'ları engelle
export default React.memo(PDFBoardEditor);