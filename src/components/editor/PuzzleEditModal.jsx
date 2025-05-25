import React, { useState, useMemo, useEffect, useRef } from "react";
import { Chessboard, ChessboardDnDProvider, SparePiece } from "react-chessboard";
import { ExtendedChess } from "../../utils/chess/ExtendedChess.js";
import { Chess } from "chess.js";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useId } from "react";

const PuzzleEditModal = ({ puzzle, isOpen, onSave, onCancel }) => {
  const uniqueId = useId();
  
  // Puzzle metadata state
  const [title, setTitle] = useState(puzzle?.title || "");
  const [difficulty, setDifficulty] = useState(puzzle?.difficulty || 1);
  const [currentFen, setCurrentFen] = useState(puzzle?.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [mainLine, setMainLine] = useState(puzzle?.mainLine || []);
  const [variations, setVariations] = useState(puzzle?.variations || []);
  
  // Board state
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [boardWidth, setBoardWidth] = useState(400);
  const [editMode, setEditMode] = useState("position"); // "position" veya "moves"
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1); // -1 = starting position
  const [positionHistory, setPositionHistory] = useState([puzzle?.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"]); // FEN history
  
  // Chess game instance
  const game = useMemo(() => new ExtendedChess(currentFen, { bypass: [10] }), []);
  
  const boardRef = useRef(null);

  // FEN değişikliğinde game'i güncelle - Error handling ile
  useEffect(() => {
    try {
      game.load(currentFen, { bypass: [10] });
    } catch (error) {
      // FEN hatalarını sessizce handle et - özellikle şahsız pozisyonlar için
      console.warn("ExtendedChess FEN uyarısı:", error.message);
    }
  }, [currentFen, game]);

  // MainLine değişikliğinde position history'yi güncelle
  useEffect(() => {
    if (mainLine.length === 0) {
      setPositionHistory([currentFen]);
      setCurrentMoveIndex(-1);
    }
  }, [mainLine, currentFen]);

  // Board resize observer
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (boardRef.current) {
        setBoardWidth(boardRef.current.offsetWidth);
      }
    });
    if (boardRef.current) observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, []);

  // Move Navigation Functions
  const goToStartPosition = () => {
    setCurrentMoveIndex(-1);
    setCurrentFen(positionHistory[0] || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  };

  const goToPreviousMove = () => {
    if (currentMoveIndex > -1) {
      const newIndex = currentMoveIndex - 1;
      setCurrentMoveIndex(newIndex);
      const targetIndex = newIndex === -1 ? 0 : newIndex + 1;
      if (positionHistory[targetIndex]) {
        setCurrentFen(positionHistory[targetIndex]);
      }
    }
  };

  const goToNextMove = () => {
    if (currentMoveIndex < mainLine.length - 1) {
      const newIndex = currentMoveIndex + 1;
      setCurrentMoveIndex(newIndex);
      if (positionHistory[newIndex + 1]) {
        setCurrentFen(positionHistory[newIndex + 1]);
      }
    }
  };

  const goToEndPosition = () => {
    setCurrentMoveIndex(mainLine.length - 1);
    const lastPosition = positionHistory[positionHistory.length - 1];
    if (lastPosition) {
      setCurrentFen(lastPosition);
    }
  };

  const goToMove = (moveIndex) => {
    setCurrentMoveIndex(moveIndex);
    if (positionHistory[moveIndex + 1]) {
      setCurrentFen(positionHistory[moveIndex + 1]);
    }
  };

  // Hamle işleme fonksiyonları
  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    try {
      // Chess.js ile legal move validation
      const tempChess = new Chess(currentFen);
      const moveResult = tempChess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });
      
      if (!moveResult) {
        console.log("Geçersiz hamle!");
        return false;
      }
      
      // Legal hamle ise:
      const newFen = tempChess.fen();
      
      // 1. Board pozisyonunu güncelle
      setCurrentFen(newFen);
      
      // 2. Hamleyi mainLine'a otomatik ekle
      const newMove = moveResult.san;
      setMainLine(prevMainLine => [...prevMainLine, newMove]);
      
      // 3. Position history'yi güncelle
      setPositionHistory(prevHistory => [...prevHistory, newFen]);
      setCurrentMoveIndex(prev => prev + 1);
      
      // 4. ExtendedChess game'i de güncelle
      try {
        game.load(newFen, { bypass: [10] });
      } catch (extendedError) {
        console.warn("ExtendedChess yükleme uyarısı:", extendedError.message);
      }
      
      console.log(`✅ Hamle eklendi: ${newMove}`);
      return true;
      
    } catch (error) {
      console.error("Hamle işleme hatası:", error.message);
      return false;
    }
  };

  // Position editing (taş yerleştirme)
  const handlePositionEdit = (sourceSquare, targetSquare, piece) => {
    try {
      game.remove(sourceSquare);
      game.remove(targetSquare);
      
      const color = piece[0];
      const type = piece[1].toLowerCase();
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        const newFen = game.fen();
        setCurrentFen(newFen);
        
        // Position değiştiğinde mainLine'ı sıfırla
        if (editMode === "position") {
          setMainLine([]);
          setPositionHistory([newFen]);
          setCurrentMoveIndex(-1);
        }
      }
      return success;
    } catch (error) {
      console.error("Taş yerleştirme hatası:", error.message);
      return false;
    }
  };

  // Smart piece drop handler - mode'a göre farklı davranış
  const handleSmartPieceDrop = (sourceSquare, targetSquare, piece) => {
    if (editMode === "position") {
      return handlePositionEdit(sourceSquare, targetSquare, piece);
    } else if (editMode === "moves") {
      return handlePieceDrop(sourceSquare, targetSquare, piece);
    }
    return false;
  };

  // Taş yerleştirme (spare piece'den)
  const handleSparePieceDrop = (piece, targetSquare) => {
    const color = piece[0];
    const type = piece[1].toLowerCase();
    
    try {
      game.remove(targetSquare);
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        setCurrentFen(game.fen());
        return true;
      }
      return false;
    } catch (error) {
      console.error("Taş yerleştirme hatası:", error.message);
      return false;
    }
  };

  // Taşı tahtadan kaldırma
  const handlePieceDropOffBoard = (sourceSquare) => {
    game.remove(sourceSquare);
    setCurrentFen(game.fen());
    return true;
  };

  // FEN giriş değişikliği
  const handleFenInputChange = (e) => {
    const fen = e.target.value;
    setCurrentFen(fen);
    
    try {
      game.load(fen, { bypass: [10] });
      setCurrentFen(game.fen());
      
      // Manual FEN değişikliğinde mainLine'ı sıfırla
      setMainLine([]);
      setPositionHistory([game.fen()]);
      setCurrentMoveIndex(-1);
    } catch (error) {
      console.error("Geçersiz FEN:", error.message);
    }
  };

  // Quick position buttons
  const handleClearBoard = () => {
    game.clear();
    const newFen = game.fen();
    setCurrentFen(newFen);
    setMainLine([]);
    setPositionHistory([newFen]);
    setCurrentMoveIndex(-1);
  };

  const handleStartPosition = () => {
    const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    game.load(startFen, { bypass: [10] });
    setCurrentFen(startFen);
    setMainLine([]);
    setPositionHistory([startFen]);
    setCurrentMoveIndex(-1);
  };

  const handlePlaceKings = () => {
    game.clear();
    game.put({ type: 'k', color: 'w' }, 'e1');
    game.put({ type: 'k', color: 'b' }, 'e8');
    const newFen = game.fen();
    setCurrentFen(newFen);
    setMainLine([]);
    setPositionHistory([newFen]);
    setCurrentMoveIndex(-1);
  };

  // Ana hat hamle silme
  const removeMoveFromMainLine = (index) => {
    const newMainLine = mainLine.filter((_, i) => i !== index);
    setMainLine(newMainLine);
  };

  // Kaydet
  const handleSave = () => {
    const updatedPuzzle = {
      ...puzzle,
      title,
      difficulty,
      fen: currentFen,
      mainLine,
      variations
    };
    onSave(updatedPuzzle);
  };

  const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {puzzle ? 'Puzzle Düzenle' : 'Yeni Puzzle Oluştur'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="flex flex-col lg:flex-row">
            {/* Sol Panel - Chess Board */}
            <div className="lg:w-2/3 p-6">
              <ChessboardDnDProvider backend={HTML5Backend}>
                <div ref={boardRef}>
                  {/* Mode Toggle */}
                  <div className="flex justify-center gap-2 mb-4">
                    <button
                      onClick={() => setEditMode("position")}
                      className={`px-3 py-1 rounded text-sm ${
                        editMode === "position"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                    >
                      📝 Pozisyon Düzenle
                    </button>
                    <button
                      onClick={() => setEditMode("moves")}
                      className={`px-3 py-1 rounded text-sm ${
                        editMode === "moves"
                          ? "bg-green-600 text-white"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      ♟️ Hamle Gir
                    </button>
                  </div>

                  {/* Siyah Taş Paleti */}
                  <div className="flex justify-center mb-4">
                    {pieces.slice(6, 12).map(piece => (
                      <SparePiece
                        key={piece}
                        piece={piece}
                        width={boardWidth / 10}
                        dndId={uniqueId}
                      >
                        <img 
                          src={`/pieces/${piece}.png`}
                          alt={piece}
                          className="w-full h-full"
                        />
                      </SparePiece>
                    ))}
                  </div>
                  
                  {/* Chess Board */}
                  <Chessboard
                    id={uniqueId}
                    position={currentFen}
                    boardOrientation={boardOrientation}
                    onPieceDrop={handleSmartPieceDrop}
                    onPieceDropOffBoard={handlePieceDropOffBoard}
                    onSparePieceDrop={handleSparePieceDrop}
                    boardWidth={Math.min(boardWidth, 400)}
                    customBoardStyle={{ 
                      borderRadius: "8px", 
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" 
                    }}
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
                  
                  {/* Beyaz Taş Paleti */}
                  <div className="flex justify-center mt-4">
                    {pieces.slice(0, 6).map(piece => (
                      <SparePiece
                        key={piece}
                        piece={piece}
                        width={boardWidth / 10}
                        dndId={uniqueId}
                      >
                        <img 
                          src={`/pieces/${piece}.png`}
                          alt={piece}
                          className="w-full h-full"
                        />
                      </SparePiece>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <button 
                      onClick={handleStartPosition}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                    >
                      Başlangıç
                    </button>
                    <button 
                      onClick={handleClearBoard}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                    >
                      Temizle
                    </button>
                    <button 
                      onClick={() => setBoardOrientation(boardOrientation === "white" ? "black" : "white")}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                    >
                      Çevir
                    </button>
                    <button 
                      onClick={handlePlaceKings}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200"
                    >
                      Şahlar
                    </button>
                  </div>

                  {/* Mode Status */}
                  <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-center">
                    {editMode === "position" ? (
                      <span className="text-blue-600">
                        📝 Pozisyon Modu: Taşları sürükleyerek yerleştirin
                      </span>
                    ) : (
                      <span className="text-green-600">
                        ♟️ Hamle Modu: Legal hamle yaparak ana hattı oluşturun
                      </span>
                    )}
                  </div>

                  {/* FEN Input */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">FEN Pozisyonu:</label>
                    <input
                      value={currentFen}
                      onChange={handleFenInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="FEN pozisyonu..."
                    />
                  </div>
                </div>
              </ChessboardDnDProvider>
            </div>

            {/* Sağ Panel - Puzzle Settings */}
            <div className="lg:w-1/3 border-l bg-gray-50 p-6">
              {/* Puzzle Metadata */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Puzzle Bilgileri</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Başlık:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Puzzle başlığı..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Zorluk (1-5):</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value={1}>1 - Çok Kolay</option>
                    <option value={2}>2 - Kolay</option>
                    <option value={3}>3 - Orta</option>
                    <option value={4}>4 - Zor</option>
                    <option value={5}>5 - Çok Zor</option>
                  </select>
                </div>
              </div>

              {/* Ana Hat */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Ana Hat</h3>
                  <div className="text-xs text-gray-500">
                    {editMode === "moves" ? "🟢 Tahtadan hamle yapın" : "📝 Pozisyon modu"}
                  </div>
                </div>
                
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {mainLine.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      {editMode === "moves" 
                        ? "Tahtada hamle yaparak ana hattı oluşturun" 
                        : "Önce pozisyonu ayarlayın, sonra hamle moduna geçin"
                      }
                    </p>
                  ) : (
                    mainLine.map((move, index) => (
                      <div 
                        key={index} 
                        className={`flex justify-between items-center px-2 py-1 rounded cursor-pointer ${
                          index === currentMoveIndex 
                            ? 'bg-blue-200 border-blue-400' 
                            : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => goToMove(index)}
                      >
                        <span className="text-sm">{index + 1}. {move}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMoveFromMainLine(index);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Move Navigation Controls */}
                {mainLine.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={goToStartPosition}
                        disabled={currentMoveIndex === -1}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 disabled:opacity-50"
                      >
                        ⏮️
                      </button>
                      <button
                        onClick={goToPreviousMove}
                        disabled={currentMoveIndex === -1}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 disabled:opacity-50"
                      >
                        ◀️
                      </button>
                      <span className="text-xs text-gray-600 px-2">
                        {currentMoveIndex + 1} / {mainLine.length}
                      </span>
                      <button
                        onClick={goToNextMove}
                        disabled={currentMoveIndex >= mainLine.length - 1}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 disabled:opacity-50"
                      >
                        ▶️
                      </button>
                      <button
                        onClick={goToEndPosition}
                        disabled={currentMoveIndex >= mainLine.length - 1}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 disabled:opacity-50"
                      >
                        ⏭️
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-xs text-gray-500">
                        {currentMoveIndex === -1 ? "Başlangıç pozisyonu" : `${currentMoveIndex + 1}. hamle sonrası`}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Reset MainLine Button */}
                {mainLine.length > 0 && (
                  <button
                    onClick={() => {
                      setMainLine([]);
                      setPositionHistory([currentFen]);
                      setCurrentMoveIndex(-1);
                    }}
                    className="mt-2 w-full px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  >
                    Ana Hattı Sıfırla
                  </button>
                )}
              </div>

              {/* Varyantlar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Varyantlar</h3>
                  <div className="text-xs text-gray-500">
                    Beta özellik
                  </div>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {variations.length === 0 ? (
                    <div className="bg-gray-50 p-3 rounded border-2 border-dashed border-gray-200">
                      <p className="text-gray-500 text-sm text-center">
                        🚧 Varyant sistemi yakında
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        Ana hatta alternatif çözümler ekleyebileceksiniz
                      </p>
                    </div>
                  ) : (
                    variations.map((variation, index) => (
                      <div key={index} className="bg-white p-2 rounded">
                        <div className="text-xs text-gray-500 mb-1">
                          {variation.startMoveIndex}. hamleden sonra:
                        </div>
                        <div className="text-sm">
                          {variation.moves.join(', ')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default PuzzleEditModal;