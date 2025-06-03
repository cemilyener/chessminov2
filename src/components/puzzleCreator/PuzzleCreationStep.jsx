import React, { useState, useEffect, useId } from 'react';
import { Chessboard, ChessboardDnDProvider, SparePiece } from "react-chessboard";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ExtendedChess } from '../../utils/chess/ExtendedChess.js';

const PuzzleCreationStep = ({ puzzleSet, setPuzzleSet, onNext, onPrevious }) => {
  const [game] = useState(() => new ExtendedChess('8/8/8/8/8/8/8/8 w - - 0 1', { bypass: [10] }));
  
  const [position, setPosition] = useState('8/8/8/8/8/8/8/8 w - - 0 1');
  const [isRecording, setIsRecording] = useState(false);
  const [moves, setMoves] = useState([]);
  const [startPosition, setStartPosition] = useState('');
  const [variants, setVariants] = useState([]);
  
  const [isRecordingVariant, setIsRecordingVariant] = useState(false);
  const [variantMoves, setVariantMoves] = useState([]);
  const [variantStartIndex, setVariantStartIndex] = useState(-1);
  
  const uniqueId = useId();
  const [boardWidth, setBoardWidth] = useState(400);

  useEffect(() => {
    const updateBoardSize = () => {
      setBoardWidth(Math.min(window.innerWidth - 200, 400));
    };
    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, []);

  const handleSparePieceDrop = (piece, targetSquare) => {
    if (isRecording || isRecordingVariant) {
      alert('Kayıt sırasında taş yerleştirilemez!');
      return false;
    }

    const color = piece[0];
    const type = piece[1].toLowerCase();
    
    game.remove(targetSquare);
    game.put({ type, color }, targetSquare);
    
    const newFen = game.fen();
    setPosition(newFen);
    return true;
  };

  const handlePieceDrop = (sourceSquare, targetSquare) => {
    if (!isRecording && !isRecordingVariant) {
      const piece = game.get(sourceSquare);
      if (piece) {
        game.remove(sourceSquare);
        game.remove(targetSquare);
        game.put(piece, targetSquare);
        setPosition(game.fen());
      }
      return true;
    }
    
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });
      
      // handlePieceDrop'ta move kaydetme kısmını kontrol et:
      if (move) {
        if (isRecordingVariant) {
          console.log('📝 Varyanta eklenen hamle:', move.san, typeof move.san);
          setVariantMoves(prev => [...prev, move.san]); // ⭐ move.san kullan
        } else {
          console.log('📝 Ana hatta eklenen hamle:', move.san, typeof move.san);
          setMoves(prev => [...prev, move.san]); // ⭐ move.san kullan
        }
        setPosition(game.fen());
        return true;
      }
    } catch (e) {
      console.log('Invalid move');
    }
    
    return false;
  };

  const handlePieceDropOffBoard = (sourceSquare) => {
    if (isRecording || isRecordingVariant) {
      alert('Kayıt sırasında taş silinemez!');
      return false;
    }
    
    game.remove(sourceSquare);
    setPosition(game.fen());
    return true;
  };

  const toggleTurn = () => {
    if (isRecording || isRecordingVariant) return;
    
    const fen = game.fen();
    const parts = fen.split(' ');
    parts[1] = parts[1] === 'w' ? 'b' : 'w';
    const newFen = parts.join(' ');
    
    game.load(newFen, { bypass: [10] });
    setPosition(newFen);
  };

  const startRecording = () => {
    setStartPosition(game.fen());
    setIsRecording(true);
    setMoves([]);
    game.load(game.fen());
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  // ⭐ VARYANT KAYDI - DÜZELTİLMİŞ
  const startVariantRecording = (afterMoveIndex) => {
    console.log('🎯 Varyant başlatılıyor:', {
      afterMoveIndex,
      totalMoves: moves.length,
      movesToPlay: moves.slice(0, afterMoveIndex),
      targetMove: moves[afterMoveIndex]
    });
    
    setIsRecording(false);
    
    // Belirtilen hamleden ÖNCEKİ pozisyonu oluştur
    const tempGame = new ExtendedChess(startPosition, { bypass: [10] });
    
    // afterMoveIndex'e KADAR hamle oyna (afterMoveIndex dahil değil)
    for (let i = 0; i < afterMoveIndex; i++) {
      tempGame.move(moves[i]);
    }
    
    // Mevcut oyunu bu pozisyona getir
    game.load(tempGame.fen());
    setPosition(tempGame.fen());
    
    // Varyant kaydını başlat
    setIsRecordingVariant(true);
    setVariantMoves([]);
    setVariantStartIndex(afterMoveIndex); // afterMoveIndex'teki hamle yerine varyant
  };

  // ⭐ VARYANT KAYDET - DÜZELTİLMİŞ
  const saveVariant = () => {
    console.log('💾 Varyant kaydediliyor:', {
      parentMoveIndex: variantStartIndex,
      variantMoves,
      parentMove: moves[variantStartIndex]
    });
    
    if (variantMoves.length > 0) {
      const newVariant = {
        parentMoveIndex: variantStartIndex, // Hangi hamle yerine varyant
        moves: variantMoves
      };
      setVariants(prev => [...prev, newVariant]);
    }
    
    setIsRecordingVariant(false);
    setVariantMoves([]);
    setVariantStartIndex(-1);
    
    // Ana pozisyona geri dön
    const tempGame = new ExtendedChess(startPosition, { bypass: [10] });
    moves.forEach(move => tempGame.move(move));
    game.load(tempGame.fen());
    setPosition(tempGame.fen());
  };

  const clearBoard = () => {
    game.clear();
    setPosition(game.fen());
    setIsRecording(false);
    setIsRecordingVariant(false);
    setMoves([]);
    setVariantMoves([]);
  };

  const loadStartPosition = () => {
    game.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    setPosition(game.fen());
    setIsRecording(false);
    setIsRecordingVariant(false);
    setMoves([]);
    setVariantMoves([]);
  };

  // ⭐ FEN'Lİ FORMATA DÖNÜŞTÜRME - CLEAN VERSION
  const calculateMovesWithFen = (startFen, moveList) => {
    console.log('🔍 calculateMovesWithFen - Input:', { startFen, moveList });
    
    const tempGame = new ExtendedChess(startFen, { bypass: [10] });
    
    const result = moveList.map((move, index) => {
      const currentFen = tempGame.fen();
      const moveResult = tempGame.move(move);
      
      if (!moveResult) {
        throw new Error(`Invalid move: ${move}`);
      }
      
      // ⭐ Sadece string move return et
      const moveData = {
        move: move,  // ⭐ Sadece string
        fen: currentFen,
        isLast: index === moveList.length - 1
      };
      
      console.log(`🎯 Move ${index}: ${move} -> Generated:`, moveData);
      return moveData;
    });
    
    console.log('✅ calculateMovesWithFen - Final result:', result);
    return result;
  };

  // ⭐ PUZZLE KAYDET - DÜZELTİLMİŞ
  const savePuzzle = () => {
    const mainLineWithFen = calculateMovesWithFen(startPosition, moves);
    const alternativesWithFen = variants.map((v, i) => {
      console.log(`🎯 Varyant ${i} işleniyor:`, {
        parentMoveIndex: v.parentMoveIndex,
        parentMove: moves[v.parentMoveIndex],
        variantMoves: v.moves
      });
      
      // Varyantın başlangıç pozisyonunu hesapla
      const tempGame = new ExtendedChess(startPosition, { bypass: [10] });
      
      // ⭐ parentMoveIndex'e kadar hamle oyna (dahil değil)
      for (let j = 0; j < v.parentMoveIndex; j++) {
        console.log(`🎯 Ana hat hamle ${j}: ${moves[j]}`);
        const result = tempGame.move(moves[j]);
        if (!result) {
          console.error(`❌ Ana hat hamle ${j} başarısız: ${moves[j]}`);
        }
      }
      
      const variantStartFen = tempGame.fen();
      console.log(`🎯 Varyant başlangıç FEN: ${variantStartFen}`);
      console.log(`🎯 Varyant legal moves:`, tempGame.moves());
      
      return {
        name: `variant_${String.fromCharCode(97 + i)}`,
        parentVariant: "main",
        parentMoveIndex: v.parentMoveIndex,
        moves: calculateMovesWithFen(variantStartFen, v.moves)
      };
    });
    
    // ⭐ CLEAN FORMAT GUARANTEE
    const cleanMainLine = mainLineWithFen.map(item => ({
      move: typeof item.move === 'object' ? item.move.move : item.move,
      fen: typeof item.fen === 'object' ? item.fen.fen : item.fen,
      isLast: item.isLast
    }));
    
    const cleanAlternatives = alternativesWithFen.map(alt => ({
      ...alt,
      moves: alt.moves.map(item => ({
        move: typeof item.move === 'object' ? item.move.move : item.move,
        fen: typeof item.fen === 'object' ? item.fen.fen : item.fen,
        isLast: item.isLast
      }))
    }));
    
    const newPuzzle = {
      id: `${puzzleSet.id}_${String(puzzleSet.puzzles.length + 1).padStart(2, '0')}`,
      index: puzzleSet.puzzles.length + 1,
      fen: startPosition,
      mainLine: cleanMainLine,  // ⭐ Clean version
      alternatives: cleanAlternatives  // ⭐ Clean version
    };
    
    console.log('🔍 CLEAN JSON TEST:', JSON.stringify(newPuzzle.mainLine[0], null, 2));
    
    setPuzzleSet(prev => ({
      ...prev,
      puzzles: [...prev.puzzles, newPuzzle]
    }));
    
    clearBoard();
    setVariants([]);
  };

  // Export step'te JSON temizleme fonksiyonu
  const cleanJsonFormat = (puzzleSet) => {
    return {
      ...puzzleSet,
      puzzles: puzzleSet.puzzles.map(puzzle => ({
        ...puzzle,
        mainLine: puzzle.mainLine.map(item => ({
          move: typeof item.move === 'string' ? item.move : item.move.move,
          fen: item.fen,
          isLast: item.isLast
        })),
        alternatives: puzzle.alternatives.map(alt => ({
          ...alt,
          moves: alt.moves.map(item => ({
            move: typeof item.move === 'string' ? item.move : item.move.move,
            fen: item.fen,
            isLast: item.isLast
          }))
        }))
      }))
    };
  };

  const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];
  const currentTurn = position.split(' ')[1];

  return (
    <ChessboardDnDProvider backend={HTML5Backend}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* SOL - TAHTA */}
          <div>
            <div className="flex justify-center mb-2">
              {pieces.slice(6, 12).map(piece => (
                <SparePiece key={piece} piece={piece} width={boardWidth/8} dndId={uniqueId} />
              ))}
            </div>
            
            <Chessboard
              id={uniqueId}
              position={position}
              onPieceDrop={handlePieceDrop}
              onSparePieceDrop={handleSparePieceDrop}
              onPieceDropOffBoard={handlePieceDropOffBoard}
              boardWidth={boardWidth}
            />
            
            <div className="flex justify-center mt-2">
              {pieces.slice(0, 6).map(piece => (
                <SparePiece key={piece} piece={piece} width={boardWidth/8} dndId={uniqueId} />
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button onClick={clearBoard} className="p-2 bg-red-500 text-white rounded">
                Temizle
              </button>
              <button onClick={loadStartPosition} className="p-2 bg-blue-500 text-white rounded">
                Başlangıç
              </button>
              <button onClick={toggleTurn} className="p-2 bg-purple-500 text-white rounded">
                Sıra: {currentTurn === 'w' ? 'Beyaz' : 'Siyah'}
              </button>
            </div>
          </div>
          
          {/* SAĞ - BİLGİ */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded">
              <h3 className="font-bold mb-2">FEN</h3>
              <div className="text-sm font-mono break-all">{position}</div>
            </div>
            
            <div className="p-4 bg-gray-100 rounded">
              <h3 className="font-bold mb-2">Hamle Kaydı</h3>
              {!isRecording && !isRecordingVariant ? (
                <button onClick={startRecording} className="w-full p-2 bg-green-500 text-white rounded">
                  ▶️ Kayda Başla
                </button>
              ) : isRecordingVariant ? (
                <button onClick={saveVariant} className="w-full p-2 bg-purple-500 text-white rounded">
                  💾 Varyantı Kaydet
                </button>
              ) : (
                <button onClick={stopRecording} className="w-full p-2 bg-red-500 text-white rounded">
                  ⏹️ Kaydı Durdur
                </button>
              )}
              
              {isRecording && (
                <div className="mt-2 text-green-600">🔴 Ana hat kaydediliyor...</div>
              )}
              
              {isRecordingVariant && (
                <div className="mt-2 text-purple-600">
                  🔴 Varyant (Hamle {variantStartIndex + 1} yerine)
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-100 rounded">
              <h3 className="font-bold mb-2">Ana Hat ({moves.length} hamle)</h3>
              <div className="max-h-40 overflow-y-auto">
                {moves.map((move, i) => (
                  <div key={i} className="text-sm flex items-center gap-2">
                    <span>{Math.floor(i/2) + 1}{i%2 === 0 ? '.' : '...'} {move}</span>
                    {!isRecording && !isRecordingVariant && (
                      <button 
                        onClick={() => startVariantRecording(i)}
                        className="text-xs bg-purple-500 text-white px-2 py-1 rounded"
                      >
                        + Alt
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {isRecordingVariant && variantMoves.length > 0 && (
                <div className="mt-2 p-2 bg-purple-100 rounded">
                  <div className="text-sm font-bold">Aktif Varyant:</div>
                  <div className="text-sm">{variantMoves.join(' ')}</div>
                </div>
              )}
              
              {variants.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-bold">Varyantlar:</div>
                  {variants.map((v, i) => (
                    <div key={i} className="text-xs bg-blue-100 p-1 rounded mt-1">
                      Hamle {v.parentMoveIndex + 1} yerine: {v.moves.join(' ')}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={savePuzzle} 
              disabled={moves.length === 0}
              className="w-full p-3 bg-teal-600 text-white rounded disabled:opacity-50"
            >
              Puzzle'ı Kaydet ({puzzleSet.puzzles.length + 1})
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onPrevious} className="p-2 bg-gray-500 text-white rounded">
                ← Geri
              </button>
              <button onClick={onNext} className="p-2 bg-blue-600 text-white rounded">
                Export →
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </ChessboardDnDProvider>
  );
};

export default PuzzleCreationStep;