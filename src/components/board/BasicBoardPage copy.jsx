import React, { useState, useMemo, useEffect, useRef } from "react";
import { Chessboard, ChessboardDnDProvider, SparePiece } from "react-chessboard";
import { ExtendedChess } from "../../utils/chess/ExtendedChess.js";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useId } from "react";
import useChessStore from '../../store/useChessStore';
import { Link } from "react-router-dom";

// Styles
const buttonStyle = {
  cursor: "pointer",
  padding: "10px 20px",
  margin: "10px 10px 0px 0px",
  borderRadius: "6px",
  backgroundColor: "#f0d9b5",
  border: "1px solid #d3d3d3",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
};
const inputStyle = {
  padding: "10px 20px",
  margin: "10px 0",
  borderRadius: "6px",
  border: "1px solid #d3d3d3",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
  width: "100%",
};

/**
 * Temel satranç tahtası bileşeni
 * @param {Object} props
 * @param {function} props.onFenChange - FEN değiştiğinde çağrılan fonksiyon
 * @param {string} props.initialFen - Başlangıç FEN pozisyonu
 * @param {boolean} props.hideHeader - Header'ı gizle (PDF için)
 * @param {boolean} props.hideFooter - Footer'ı gizle (PDF için)
 * @param {boolean} props.hideControls - Kontrol butonlarını gizle (PDF için)
 * @param {boolean} props.compact - Kompakt mod (daha küçük)
 * @param {number} props.customWidth - Özel genişlik (px)
 */
const BasicBoardPage = ({
  onFenChange,
  initialFen,
  hideHeader = false,
  hideFooter = false,
  hideControls = false,
  compact = false,
  customWidth = null
}) => {
  const { setPosition } = useChessStore();
  
  // Başlangıç FEN'i veya boş tahta
  const emptyFen = "8/8/8/8/8/8/8/8 w - - 0 1";
  const startFen = initialFen || emptyFen;
  const game = useMemo(() => new ExtendedChess(startFen, { bypass: [10] }), [startFen]);
  
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [boardWidth, setBoardWidth] = useState(customWidth || 360);
  const [fenPosition, setFenPosition] = useState(startFen);
  const boardRef = useRef(null);
  const uniqueId = useId();
  const [boardContainer, setBoardContainer] = useState({ left: 0, top: 0 });
  
  // Sayfadaki maksimum genişliğin %90'ı veya 480px (hangisi küçükse)
  // Kompakt modda daha küçük
  const calculateBoardWidth = () => {
    const baseWidth = compact ? 320 : 480;
    const maxWidth = Math.min(window.innerWidth * (compact ? 0.8 : 0.9), baseWidth);
    return customWidth || maxWidth;
  };

  useEffect(() => {
    const handleResize = () => {
      setBoardWidth(calculateBoardWidth());
    };

    // İlk yükleme ve pencere boyutu değişikliği için event listener
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [compact, customWidth]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        setBoardContainer({ left: rect.left, top: rect.top });
      }
    });
    if (boardRef.current) observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, []);

  // FEN pozisyonu değiştiğinde store'a kaydet ve callback'i çağır
  useEffect(() => {
    setPosition(fenPosition, true);
    
    // Eğer onFenChange özelliği tanımlıysa çağır
    if (onFenChange && typeof onFenChange === 'function') {
      onFenChange(fenPosition);
    }
  }, [fenPosition, setPosition, onFenChange]);

  // Props değiştiğinde FEN'i güncelle
  useEffect(() => {
    if (initialFen && initialFen !== fenPosition) {
      try {
        game.load(initialFen, { bypass: [10] });
        setFenPosition(game.fen());
      } catch (error) {
        console.error("Geçersiz başlangıç FEN'i:", error.message);
      }
    }
  }, [initialFen, game]);

  // Taş yerleştirme işlevi (yedek taş paletinden)
  const handleSparePieceDrop = (piece, targetSquare) => {
    const color = piece[0];
    const type = piece[1].toLowerCase();
    
    try {
      // Karedeki mevcut taşı kaldır
      game.remove(targetSquare);
      
      // Yeni taşı yerleştir
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        setFenPosition(game.fen());
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Taş yerleştirme hatası:", error.message);
      return false;
    }
  };

  // Taş taşıma işlevi
  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    try {
      // Kaynak ve hedef karelerdeki taşları kaldır
      game.remove(sourceSquare);
      game.remove(targetSquare);
      
      const color = piece[0];
      const type = piece[1].toLowerCase();
      
      // Taşı hedef kareye yerleştir
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        setFenPosition(game.fen());
      }
      
      return success;
    } catch (error) {
      console.error("Taş taşıma hatası:", error.message);
      return false;
    }
  };

  // Taşı tahtadan kaldırma
  const handlePieceDropOffBoard = (sourceSquare) => {
    game.remove(sourceSquare);
    setFenPosition(game.fen());
    return true;
  };

  // FEN giriş değişikliğini işle
  const handleFenInputChange = (e) => {
    const fen = e.target.value;
    setFenPosition(fen);
    
    try {
      // Şah kontrolünü bypass et
      game.load(fen, { bypass: [10] });
      setFenPosition(game.fen());
    } catch (error) {
      console.error("Geçersiz FEN:", error.message);
    }
  };

  // Tahtayı temizle
  const handleClearBoard = () => {
    game.clear();
    setFenPosition(game.fen());
  };

  // Başlangıç konumu
  const handleStartPosition = () => {
    game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", { bypass: [10] });
    setFenPosition(game.fen());
  };

  // Şahları yerleştir
  const handlePlaceKings = () => {
    game.clear();
    game.put({ type: 'k', color: 'w' }, 'h1');
    game.put({ type: 'k', color: 'b' }, 'h8');
    setFenPosition(game.fen());
  };

  const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];

  // İçerik bileşeni
  const BoardContent = () => (
    <div className="flex flex-col items-center">
      <div className={`bg-white p-${compact ? '3' : '6'} rounded-lg shadow-md w-full max-w-xl`}>
        {!hideControls && (
          <p className="text-gray-600 mb-4 text-center">
            Taşları sürükleyip bırakarak pozisyon oluşturun. Kenarlardaki taş paletinden yeni taşlar ekleyebilirsiniz.
          </p>
        )}
        
        <div ref={boardRef} className="mx-auto" style={{ maxWidth: `${boardWidth}px` }}>
          <ChessboardDnDProvider backend={HTML5Backend}>
            {!hideControls && (
              <div className="flex justify-center mb-2">
                {pieces.slice(6, 12).map(piece => (
                  <SparePiece
                    key={piece}
                    piece={piece}
                    width={boardWidth / 8}
                    dndId={uniqueId}
                  >
                    <img 
                      src={`/pieces/${piece}.png`}
                      alt={piece}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </SparePiece>
                ))}
              </div>
            )}
            
            <Chessboard
              id={uniqueId}
              position={fenPosition}
              boardOrientation={boardOrientation}
              onPieceDrop={handlePieceDrop}
              onPieceDropOffBoard={handlePieceDropOffBoard}
              onSparePieceDrop={handleSparePieceDrop}
              boardWidth={boardWidth}
              customBoardStyle={{ borderRadius: "4px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)" }}
              customDarkSquareStyle={{ backgroundColor: '#b58863' }}
              customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
              allowDragOutsideBoard={true}
              dropOffBoardAction="trash"
              customPieces={pieces.reduce((acc, piece) => ({
                ...acc,
                [piece]: ({ squareWidth }) => (
                  <img
                    src={`/pieces/${piece}.png`}
                    alt={piece}
                    style={{ width: squareWidth, height: squareWidth }}
                  />
                ),
              }), {})}
            />
            
            {!hideControls && (
              <div className="flex justify-center mt-2">
                {pieces.slice(0, 6).map(piece => (
                  <SparePiece
                    key={piece}
                    piece={piece}
                    width={boardWidth / 8}
                    dndId={uniqueId}
                  >
                    <img 
                      src={`/pieces/${piece}.png`}
                      alt={piece}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </SparePiece>
                ))}
              </div>
            )}
            
            {!hideControls && (
              <div className="mt-4">
                <div className="flex justify-center flex-wrap">
                  <button 
                    style={buttonStyle} 
                    onClick={handleStartPosition}
                    className="hover:bg-amber-100"
                  >
                    Başlangıç konumu ♟️
                  </button>
                  <button 
                    style={buttonStyle} 
                    onClick={handleClearBoard}
                    className="hover:bg-amber-100"
                  >
                    Tahtayı temizle 🗑️
                  </button>
                  <button 
                    style={buttonStyle} 
                    onClick={() => setBoardOrientation(boardOrientation === "white" ? "black" : "white")}
                    className="hover:bg-amber-100"
                  >
                    Tahtayı çevir 🔁
                  </button>
                  <button 
                    style={buttonStyle} 
                    onClick={handlePlaceKings}
                    className="hover:bg-amber-100"
                  >
                    Şahları Yerleştir 👑
                  </button>
                </div>
                
                <div className="mt-4">
                  <label htmlFor="fen-input" className="block text-sm font-medium text-gray-700 mb-1">FEN Pozisyonu:</label>
                  <input
                    id="fen-input"
                    value={fenPosition}
                    style={inputStyle}
                    onChange={handleFenInputChange}
                    placeholder="FEN pozisyonu yapıştırın"
                    className="hover:border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
            )}
            
            {!hideControls && !hideFooter && (
              <div className="mt-6 text-center">
                <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Ana Sayfaya Dön
                </Link>
              </div>
            )}
          </ChessboardDnDProvider>
        </div>
      </div>
    </div>
  );

  // Compact modda veya başlık/alt bilgi gizliyse sadece içerik göster
  if (compact || (hideHeader && hideFooter)) {
    return <BoardContent />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Basit Header */}
      {!hideHeader && (
        <header className="bg-white shadow-sm mb-6">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-700">ChessMino</Link>
            </div>
          </div>
        </header>
      )}

      <div className="container mx-auto px-4 py-6">
        {!hideHeader && (
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Temel Satranç Tahtası Editörü</h2>
        )}
        
        <BoardContent />
      </div>
      
      {/* Basit Footer */}
      {!hideFooter && (
        <footer className="bg-gray-800 text-gray-300 py-6 px-4 mt-12">
          <div className="container mx-auto max-w-5xl text-center">
            <p className="text-gray-500">&copy; {new Date().getFullYear()} ChessMino. Tüm hakları saklıdır.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default BasicBoardPage;