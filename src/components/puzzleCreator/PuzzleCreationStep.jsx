import React, { useState, useEffect, useId, useRef } from 'react';
import { Chessboard, ChessboardDnDProvider, SparePiece } from "react-chessboard";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Chess } from 'chess.js';
import { ExtendedChess } from '@/utils/chess/ExtendedChess.js';

const PuzzleCreationStep = ({ puzzleSet, setPuzzleSet, onNext, onPrevious }) => {
  const [boardState, setBoardState] = useState({
    fen: '8/8/8/8/8/8/8/8 w - - 0 1',
    moveList: [],
    isRecording: false,
    turn: 'w'
  });

  const [chessEditor] = useState(() => new ExtendedChess("8/8/8/8/8/8/8/8 w - - 0 1", { bypass: [10] }));  const [chess, setChess] = useState(null);
  
  // YENİ: useRef ile recording start FEN'i sakla - ASENKRON PROBLEM ÇÖZÜLDÜ
  const recordingStartFenRef = useRef('');
  
  // YENİ VARIANT STATES
  const [isRecordingVariant, setIsRecordingVariant] = useState(false);
  const [variantStartIndex, setVariantStartIndex] = useState(-1);
  const [currentVariantMoves, setCurrentVariantMoves] = useState([]);
  
  // YENİ: Move Navigation State
  const [currentPositionIndex, setCurrentPositionIndex] = useState(-1);

  // YENİ: Multiple Variants State
  const [tempVariants, setTempVariants] = useState([]);

  const [boardWidth, setBoardWidth] = useState(400);
  const uniqueId = useId();

  // Piece palette
  const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];

  useEffect(() => {
    // Board responsive sizing
    const updateBoardSize = () => {
      const containerWidth = Math.min(window.innerWidth - 200, 400);
      setBoardWidth(containerWidth);
    };

    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, []);

  // Board editing functions
  const handleSparePieceDrop = (piece, targetSquare) => {
    const color = piece[0];
    const type = piece[1].toLowerCase();
    
    try {
      chessEditor.remove(targetSquare);
      const success = chessEditor.put({ type, color }, targetSquare);
      
      if (success) {
        const newFen = chessEditor.fen();
        setBoardState(prev => ({
          ...prev,
          fen: newFen
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Taş yerleştirme hatası:", error);
      return false;
    }
  };

  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    if (boardState.isRecording && chess) {
      // Recording mode - only allow legal moves
      try {
        const move = chess.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q'
        });
          if (move) {
          // DÜZELTME: Variant recording kontrolü - SADECE STRING KAYDET
          if (isRecordingVariant) {
            // Kesinlikle sadece SAN string'ini kaydet
            setCurrentVariantMoves(prev => [...prev, move.san]);
            console.log('🎮 Variant move added:', move.san);
          } else {
            // DÜZELTME: Normal recording için sadece move string'i kaydet
            setBoardState(prev => ({
              ...prev,
              moveList: [...prev.moveList, move.san] // ✅ Sadece string, object değil!
            }));
          }
          
          // Her iki durumda da board state'i güncelle
          setBoardState(prev => ({ 
            ...prev, 
            fen: chess.fen() 
          }));
          return true;
        }        return false;
      } catch (moveError) {
        console.error("Move error:", moveError);
        return false;
      }
    } else {
      // Edit mode - allow any piece movement
      try {
        const color = piece[0];
        const type = piece[1].toLowerCase();
        
        chessEditor.remove(sourceSquare);
        chessEditor.remove(targetSquare);
        const success = chessEditor.put({ type, color }, targetSquare);
        
        if (success) {
          const newFen = chessEditor.fen();
          setBoardState(prev => ({
            ...prev,
            fen: newFen
          }));
          return true;
        }
        return false;
      } catch (error) {
        console.error("Taş taşıma hatası:", error);
        return false;
      }
    }
  };

  const handlePieceDropOffBoard = (sourceSquare) => {
    try {
      chessEditor.remove(sourceSquare);
      const newFen = chessEditor.fen();
      setBoardState(prev => ({
        ...prev,
        fen: newFen
      }));
      return true;
    } catch (error) {
      console.error("Taş silme hatası:", error);
      return false;
    }
  };

  // Board control functions
  const handleClearBoard = () => {
    chessEditor.clear();
    setBoardState(prev => ({
      ...prev,
      fen: '8/8/8/8/8/8/8/8 w - - 0 1',
      moveList: [],
      isRecording: false
    }));
  };

  const handleStartPosition = () => {
    const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    chessEditor.load(startFen);
    setBoardState(prev => ({
      ...prev,
      fen: startFen,
      moveList: [],
      isRecording: false
    }));
  };

  const handleToggleTurn = () => {
    const fenParts = boardState.fen.split(' ');
    fenParts[1] = fenParts[1] === 'w' ? 'b' : 'w';
    const newFen = fenParts.join(' ');
    
    chessEditor.load(newFen);
    setBoardState(prev => ({
      ...prev,
      fen: newFen,
      turn: fenParts[1]
    }));
  };

  const handlePlaceKings = () => {
    chessEditor.put({ type: 'k', color: 'w' }, 'e1');
    chessEditor.put({ type: 'k', color: 'b' }, 'e8');
    const newFen = chessEditor.fen();
    setBoardState(prev => ({
      ...prev,
      fen: newFen
    }));
  };

  // Move recording functions - DÜZELTME: useRef kullan
  const handleStartRecording = () => {
    const currentFen = boardState.fen;
    
    console.log('🎬 Recording Started with FEN:', currentFen);
    console.log('🎬 Board State:', boardState);
      // CRITICAL: Ref'i hemen güncelle - asenkron problem yok!
    recordingStartFenRef.current = currentFen;
    
    const hasKings = currentFen.includes('K') && currentFen.includes('k');
    
    try {
      const newChess = hasKings ? 
        new ExtendedChess(currentFen) : 
        new ExtendedChess(currentFen, { bypass: [10] });
      
      setChess(newChess);
      
      setBoardState(prev => ({
        ...prev,
        isRecording: true,
        moveList: []
      }));
      
      setCurrentPositionIndex(-1);
    } catch (error) {
      console.error("Hamle kaydı başlatılamadı:", error);
      alert("Bu pozisyondan hamle kaydı başlatılamıyor.");
    }
  };

  // DÜZELTME: handleStopRecording - ref'i TEMİZLEME!
  const handleStopRecording = () => {
    setBoardState(prev => ({
      ...prev,
      isRecording: false
    }));    setChess(null);
    // ❌ KALDIRILDI: recordingStartFenRef.current = '';
    // ❌ KALDIRILDI: setRecordingStartFen('');
  };

  // DÜZELTME: Ref'ten FEN'i al
  const rewindToPosition = (toMoveIndex) => {
    // Ref'ten doğru FEN'i al - asenkron problem yok!
    const startFen = recordingStartFenRef.current || boardState.fen;
    
    console.log('🔄 Rewind to position:', {
      toMoveIndex,
      startFen,
      recordingStartFenRef: recordingStartFenRef.current,
      boardStateFen: boardState.fen,
      moveList: boardState.moveList
    });
    
    if (toMoveIndex <= 0) return startFen;
    
    try {
      const tempChess = new ExtendedChess(startFen, { bypass: [10] });
      
      for (let i = 0; i < toMoveIndex && i < boardState.moveList.length; i++) {
        const move = boardState.moveList[i];
        console.log(`🔄 Playing move ${i}: ${move}`);
        
        const result = tempChess.move(move);
        if (!result) {
          console.error(`🔄 Failed at move ${i}: ${move}`);
          return tempChess.fen();
        }
      }
      
      const finalFen = tempChess.fen();
      console.log('🔄 Rewind complete. Final FEN:', finalFen);
      
      return finalFen;
    } catch (error) {
      console.error('Position rewind error:', error);
      return startFen;
    }
  };
  // DÜZELTME: Ref kullanarak doğru FEN'i al
  const startVariantRecording = (fromMoveIndex) => {
    // Recording state'ini kontrol et ama ref'i koru
    const wasRecording = boardState.isRecording;
    
    // CRITICAL: Ref'ten doğru FEN'i al
    const actualStartFen = recordingStartFenRef.current;
    
    if (!actualStartFen) {
      console.error('❌ No recording start FEN found!');
      alert('Önce hamle kaydı başlatın!');
      return;
    }
    
    console.log('🎯 Variant recording with start FEN:', actualStartFen);
    
    // Recording'i geçici olarak durdur (ref'i koruyarak)
    if (wasRecording) {
      setBoardState(prev => ({
        ...prev,
        isRecording: false
      }));
      setChess(null);
    }
    
    setIsRecordingVariant(true);
    setVariantStartIndex(fromMoveIndex);
    setCurrentVariantMoves([]);
    
    const fenToRewindTo = rewindToPosition(fromMoveIndex);
    
    const newChess = new ExtendedChess(fenToRewindTo, { bypass: [10] });
    
    setChess(newChess);
    setBoardState(prev => ({
      ...prev,
      fen: fenToRewindTo,
      isRecording: true
    }));
    
    setCurrentPositionIndex(fromMoveIndex - 1);
  };

  // Move navigation function
  const navigateToMove = (moveIndex) => {
    console.log(`🎯 Navigating to move ${moveIndex}`);
    
    if (!boardState.moveList || moveIndex < 0 || moveIndex >= boardState.moveList.length) {
      console.warn('❌ Invalid move index:', moveIndex);
      return;
    }

    try {
      const startFen = recordingStartFenRef.current || boardState.fen;
      const tempChess = new ExtendedChess(startFen, { bypass: [10] });
      
      // Replay moves up to the target index
      for (let i = 0; i <= moveIndex; i++) {
        const move = boardState.moveList[i];
        const result = tempChess.move(move);
        if (!result) break;
      }
      
      const newFen = tempChess.fen();
      setBoardState(prev => ({
        ...prev,
        fen: newFen
      }));
      
      setCurrentPositionIndex(moveIndex);
      
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  };
  const stopVariantRecording = () => {
    if (currentVariantMoves.length > 0 && variantStartIndex >= 0) {
      console.log('🎯 Saving variant moves:', currentVariantMoves);
      console.log('🎯 Variant moves types:', currentVariantMoves.map(m => typeof m));
      
      const newVariant = {
        name: `variant_${String.fromCharCode(97 + tempVariants.length)}`,
        parentVariant: "main",
        parentMoveIndex: variantStartIndex,
        moves: currentVariantMoves.map(m => 
          typeof m === 'string' ? m : m.move  // Kesinlikle string olsun
        )
      };
      
      console.log('🎯 New variant object:', newVariant);
      setTempVariants(prev => [...prev, newVariant]);
    }
    
    // State'leri resetle AMA ref'i KORU
    setIsRecordingVariant(false);
    setVariantStartIndex(-1);
    setCurrentVariantMoves([]);
    setBoardState(prev => ({
      ...prev,
      isRecording: false
    }));
    setChess(null);
    // ✅ recordingStartFenRef.current koruyoruz - temizlemiyoruz!
  };

  // DÜZELTME: handleSavePuzzle - BURADA temizle
  const handleSavePuzzle = () => {
    // Ref'ten doğru FEN'i al
    const puzzleStartFen = recordingStartFenRef.current || boardState.fen;
    
    console.log('💾 Saving puzzle with start FEN:', puzzleStartFen);
    
    const newPuzzle = {
      id: puzzleSet.puzzles.length + 1,
      fen: puzzleStartFen,
      startingFen: puzzleStartFen,
      mainLine: [...boardState.moveList],
      alternatives: [...tempVariants],
      createdAt: new Date().toISOString()
    };

    setPuzzleSet(prev => ({
      ...prev,
      puzzles: [...prev.puzzles, newPuzzle]
    }));

    // ✅ YENİ PUZZLE İÇİN HAZIRLIK - BOARD'I TEMİZLE
    handleClearBoard(); // Önce board'ı temizle
    
    // Tüm state'leri resetle
    setBoardState(prev => ({
      ...prev,
      fen: '8/8/8/8/8/8/8/8 w - - 0 1', // ✅ Boş board
      moveList: [],
      isRecording: false,
      turn: 'w' // ✅ Beyaz başlasın
    }));
      setChess(null);
    recordingStartFenRef.current = ''; // ✅ Ref'i temizle
    setIsRecordingVariant(false);
    setVariantStartIndex(-1);
    setCurrentVariantMoves([]);
    setCurrentPositionIndex(-1);
    setTempVariants([]);
    
    console.log('✅ New puzzle ready - Board cleared for next puzzle');
    alert('Puzzle kaydedildi! Yeni puzzle için board temizlendi.');
  };
  const currentPuzzleNumber = puzzleSet.puzzles.length + 1;
  
  return (
    <ChessboardDnDProvider backend={HTML5Backend}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onPrevious}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              ← Metadata'ya Dön
            </button>
            <h2 className="text-xl font-semibold">
              Puzzle Creation: {puzzleSet.title || puzzleSet.id}
            </h2>
            <div className="text-sm text-gray-500">
              {puzzleSet.puzzles.length} puzzle kaydedildi
            </div>
          </div>

          {/* Main Content - Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Board & Controls */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                {/* Top Spare Pieces - Black */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  width: `${boardWidth}px`,
                  margin: "0 auto",
                  marginBottom: `${boardWidth / 32}px`
                }}>
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

                {/* Chessboard */}
                <Chessboard
                  position={boardState.fen}
                  onPieceDrop={handlePieceDrop}
                  onSparePieceDrop={handleSparePieceDrop}
                  onPieceDropOffBoard={handlePieceDropOffBoard}
                  boardWidth={boardWidth}
                  boardOrientation="white"
                  allowDragOutsideBoard={!boardState.isRecording}
                  dropOffBoardAction="trash"
                  customBoardStyle={{ borderRadius: "4px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)" }}
                  customDarkSquareStyle={{ backgroundColor: '#b58863' }}
                  customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                  arePiecesDraggable={true}
                  customPieces={pieces.reduce((acc, piece) => ({
                    ...acc,
                    [piece]: ({ squareWidth }) => (
                      <img
                        src={`/pieces/${piece}.png`}
                        alt={piece}
                        style={{ width: squareWidth, height: squareWidth }}
                      />
                    )
                  }), {})}
                />

                {/* Bottom Spare Pieces - White */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  width: `${boardWidth}px`,
                  margin: "0 auto",
                  marginTop: `${boardWidth / 32}px`
                }}>
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
              </div>
              
              {/* Board Control Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={handleClearBoard}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                >
                  🗑️ Temizle
                </button>
                <button
                  onClick={handleStartPosition}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                >
                  🏁 Başlangıç
                </button>
                <button
                  onClick={handlePlaceKings}
                  className="px-3 py-2 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                >
                  👑 Şahlar
                </button>
                <button
                  onClick={handleToggleTurn}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                >
                  🔄 Sıra: {boardState.turn === 'w' ? 'Beyaz' : 'Siyah'}
                </button>
              </div>
            </div>

            {/* Right Column - Puzzle Info & Controls */}
            <div className="space-y-6">
              {/* Puzzle Number */}
              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-teal-800 mb-2">
                  Puzzle #{currentPuzzleNumber}
                </h3>
                <p className="text-sm text-teal-600">
                  Pozisyonu ayarlayın ve hamleleri kaydedin
                </p>
              </div>

              {/* FEN Display */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">FEN Pozisyonu</h4>
                <div className="text-xs font-mono bg-white p-2 rounded border break-all">
                  {boardState.fen}
                </div>
              </div>

              {/* YENİ: Move Navigation - Recording kontrolü kaldırıldı */}
              {boardState.moveList.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">Hamle Navigasyonu</h4>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => navigateToMove(-1)}
                      disabled={currentPositionIndex === -1}
                      className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200 disabled:opacity-50"
                      title="Başa git"
                    >
                      ⏪ Başa
                    </button>
                    <button
                      onClick={() => navigateToMove(Math.max(-1, currentPositionIndex - 1))}
                      disabled={currentPositionIndex <= -1}
                      className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200 disabled:opacity-50"
                      title="Önceki hamle"
                    >
                      ◀ Geri
                    </button>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-mono">
                      {currentPositionIndex === -1 ? 'Başlangıç' : `${currentPositionIndex + 1}/${boardState.moveList.length}`}
                    </span>
                    <button
                      onClick={() => navigateToMove(Math.min(boardState.moveList.length - 1, currentPositionIndex + 1))}
                      disabled={currentPositionIndex >= boardState.moveList.length - 1}
                      className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200 disabled:opacity-50"
                      title="Sonraki hamle"
                    >
                      İleri ▶
                    </button>
                    <button
                      onClick={() => navigateToMove(boardState.moveList.length - 1)}
                      disabled={currentPositionIndex >= boardState.moveList.length - 1}
                      className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200 disabled:opacity-50"
                      title="Sona git"
                    >
                      Sona ⏩
                    </button>
                  </div>
                  <div className="text-xs text-center text-blue-600 mt-2">
                    Hamlelerde gezinmak için butonları kullanın veya hamle listesinde tıklayın
                  </div>
                  {boardState.isRecording && (
                    <div className="text-xs text-center text-amber-600 mt-1">
                      ⚠️ Recording sırasında navigasyon chess instance'ı bozabilir
                    </div>
                  )}
                </div>
              )}

              {/* Move Recording */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Hamle Kaydı</h4>
                  <div className="flex gap-2">
                    {!boardState.isRecording ? (
                      <button
                        onClick={handleStartRecording}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        ▶️ Kayda Başla
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleStopRecording}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          ⏹️ Kaydı Durdur
                        </button>
                        {/* YENİ: Variant Stop Button */}
                        {isRecordingVariant && (
                          <button
                            onClick={stopVariantRecording}
                            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                          >
                            ⏹️ Varyant Kaydını Durdur
                          </button>
                        )}

                        {/* EKLENMESİ GEREKEN - "✓ Varyantı Tamamla" Button */}
                        {isRecordingVariant && currentVariantMoves.length > 0 && (
                          <button
                            onClick={stopVariantRecording}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                          >
                            ✓ Varyantı Tamamla
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {boardState.isRecording && !isRecordingVariant && (
                  <div className="text-sm text-green-600 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Kayıt devam ediyor - Tahtada hamle yapın
                  </div>
                )}

                {/* YENİ: Variant Recording Indicator */}
                {isRecordingVariant && (
                  <div className="text-sm text-purple-600 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    Varyant kaydı - Hamle {variantStartIndex + 1} yerine alternatif girin
                  </div>
                )}

                {/* Move List - GÜNCELLEME */}
                <div className="min-h-[120px] max-h-[200px] overflow-y-auto border border-gray-200 rounded p-3 bg-white">
                  {boardState.moveList.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Henüz hamle kaydedilmedi</p>
                  ) : (
                    <div className="space-y-1">
                      {boardState.moveList.map((move, index) => (
                        <div key={index} className="text-sm flex items-center gap-2 group">
                          <span className="text-gray-500 w-8">
                            {Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'}
                          </span>
                          <span 
                            className={`font-medium flex-1 px-1 rounded transition-colors cursor-pointer hover:bg-gray-100 ${
                              currentPositionIndex === index ? 'bg-blue-100 text-blue-800' : ''
                            }`}
                            onClick={() => navigateToMove(index)} // ✅ Recording kontrolü yok
                            title="Bu pozisyona git"
                          >
                            {move}
                          </span>
                          {!boardState.isRecording && (
                            <button
                              onClick={() => startVariantRecording(index)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                                         w-5 h-5 bg-purple-500 text-white rounded-full text-xs 
                                         flex items-center justify-center hover:bg-purple-600"
                              title={`"${move}" yerine alternatif hamle ekle`}
                            >
                              +
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* YENİ: Variant Display */}
                  {currentVariantMoves.length > 0 && (
                    <div className="mt-3 p-2 bg-purple-50 rounded border border-purple-200">
                      <div className="text-xs font-medium text-purple-700 mb-1">
                        Varyant (Hamle {variantStartIndex + 1}'den):
                      </div>
                      <div className="text-sm text-purple-600">
                        {currentVariantMoves.map(moveData => moveData.move).join(' ')}
                      </div>
                    </div>
                  )}

                  {/* YENİ: Saved Variants List - EKLE */}
                  {tempVariants.length > 0 && (
                    <div className="mt-3 p-3 bg-indigo-50 rounded border border-indigo-200">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="text-sm font-medium text-indigo-700">
                          Kaydedilen Varyantlar ({tempVariants.length})
                        </h5>
                      </div>
                      <div className="space-y-2">
                        {tempVariants.map((variant, index) => (
                          <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                            <div className="text-sm">
                              <span className="font-medium">{variant.name}</span>
                              <span className="text-gray-500 ml-2">
                                (Hamle {variant.parentMoveIndex + 1}'den)
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setTempVariants(prev => prev.filter((_, i) => i !== index));
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Saved Puzzles List */}
              {puzzleSet.puzzles.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Kaydedilen Puzzlelar</h4>                  <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                    {puzzleSet.puzzles.map((puzzle) => (
                      <div key={puzzle.id} className="bg-white p-2 rounded border">
                        <div className="flex justify-between">
                          <span>Puzzle #{puzzle.id}</span>
                          <span className="text-gray-500 text-xs">
                            {puzzle.mainLine.length} hamle
                            {puzzle.alternatives && puzzle.alternatives.length > 0 && 
                              ` + ${puzzle.alternatives.length} varyant`
                            }
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save & Navigation */}
              <div className="space-y-3">
                <button
                  onClick={handleSavePuzzle}
                  disabled={boardState.moveList.length === 0}
                  className={`w-full py-3 rounded-lg font-medium ${
                    boardState.moveList.length > 0
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🧩 Puzzle'ı Kaydet & Yeni Puzzle
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onPrevious}
                    className="py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                  >
                    ← Geri
                  </button>
                  <button
                    onClick={onNext}
                    className="py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Export'a Geç →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChessboardDnDProvider>
  );
};

export default PuzzleCreationStep;