import React, { useState, useEffect, useId, useRef } from 'react';
import { Chessboard, ChessboardDnDProvider, SparePiece } from "react-chessboard";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Chess } from 'chess.js';
import { ExtendedChess } from '../../utils/chess/ExtendedChess.js';

// Error boundary wrapper fonksiyonu
const withErrorBoundary = (fn, fallbackMessage = "İşlem başarısız") => {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      console.error(`Error in ${fn.name || 'function'}:`, error);
      console.warn(`⚠️ ${fallbackMessage}: ${error.message}`);
      return null;
    }
  };
};

const PuzzleCreationStep = ({ puzzleSet, setPuzzleSet, onNext, onPrevious }) => {
  const [boardState, setBoardState] = useState({
    fen: '8/8/8/8/8/8/8/8 w - - 0 1',
    moveList: [],
    isRecording: false,
    turn: 'w'
  });

  const [chess, setChess] = useState(null);
  
  // useRef ile recording start FEN'i sakla
  const recordingStartFenRef = useRef('');
  
  // Variant states
  const [isRecordingVariant, setIsRecordingVariant] = useState(false);
  const [variantStartIndex, setVariantStartIndex] = useState(-1);
  const [currentVariantMoves, setCurrentVariantMoves] = useState([]);
  
  // Move Navigation State
  const [currentPositionIndex, setCurrentPositionIndex] = useState(-1);

  // Multiple Variants State
  const [tempVariants, setTempVariants] = useState([]);

  const [boardWidth, setBoardWidth] = useState(400);
  const uniqueId = useId();

  // Error/Success messages state
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });

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

  // Debug effect for moveList changes
  useEffect(() => {
    console.log('📊 Board state changed:', {
      moveList: boardState.moveList,
      isRecording: boardState.isRecording,
      fen: boardState.fen,
      moveCount: boardState.moveList.length
    });
  }, [boardState.moveList, boardState.isRecording]);

  // Debug effect for chess instance
  useEffect(() => {
    console.log('♟️ Chess instance changed:', {
      exists: !!chess,
      type: chess ? chess.constructor.name : 'null',
      fen: chess ? chess.fen() : 'N/A',
      turn: chess ? chess.turn() : 'N/A',
      moves: chess ? chess.moves().slice(0, 5) : []
    });
  }, [chess]);

  // Show status message helper
  const showStatus = (type, message, duration = 3000) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage({ type: '', message: '' }), duration);
  };

  // Board editing functions with error handling
  const handleSparePieceDrop = withErrorBoundary((piece, targetSquare) => {
    if (boardState.isRecording) {
      showStatus('warning', 'Hamle kaydı sırasında taş yerleştirilemez');
      return false;
    }
    
    console.log('🎨 Placing piece:', { piece, targetSquare });
    console.log('🎨 Current FEN before placement:', boardState.fen);
    
    // FEN manipulation for piece placement
    const fenParts = boardState.fen.split(' ');
    const position = fenParts[0];
    
    // Convert square to indices
    const file = targetSquare.charCodeAt(0) - 97; // a=0, b=1, etc
    const rank = 8 - parseInt(targetSquare[1]); // 8=0, 7=1, etc
    
    console.log('🎨 Target position:', { file, rank, square: targetSquare });
    
    // Convert FEN position to 2D array
    const rows = position.split('/');
    const board = rows.map(row => {
      const expandedRow = [];
      for (const char of row) {
        if (isNaN(char)) {
          expandedRow.push(char);
        } else {
          for (let i = 0; i < parseInt(char); i++) {
            expandedRow.push('1');
          }
        }
      }
      // Her satırın 8 kare olduğundan emin ol
      while (expandedRow.length < 8) {
        expandedRow.push('1');
      }
      return expandedRow;
    });
    
    console.log('🎨 Board before placement:', board);
    console.log('🎨 Board dimensions:', board.map(row => row.length));
    console.log('🎨 Target square before placement:', board[rank] ? board[rank][file] : 'undefined');
    
    // Place the piece - piece format: "wR", "bQ" etc.
    const pieceChar = piece[1]; // R, Q, N, B, K, P
    const isWhite = piece[0] === 'w';
    const coloredPiece = isWhite ? pieceChar.toUpperCase() : pieceChar.toLowerCase();
    
    console.log('🎨 Placing piece:', { 
      piece, 
      pieceChar, 
      isWhite, 
      coloredPiece, 
      targetFile: file, 
      targetRank: rank,
      boardExists: !!board[rank],
      squareExists: board[rank] ? !!board[rank][file] !== undefined : false
    });
    
    // Bounds check
    if (rank < 0 || rank >= 8 || file < 0 || file >= 8) {
      console.error('❌ Invalid square indices:', { rank, file, targetSquare });
      showStatus('error', 'Geçersiz kare!');
      return false;
    }
    
    // Board array check
    if (!board[rank] || board[rank].length < 8) {
      console.error('❌ Board array malformed:', { 
        rankExists: !!board[rank], 
        rankLength: board[rank] ? board[rank].length : 0 
      });
      showStatus('error', 'Board formatı hatalı!');
      return false;
    }
    
    board[rank][file] = coloredPiece;
    
    console.log('🎨 Board after placement:', board);
    console.log('🎨 Target square after placement:', board[rank][file]);
    
    // Convert back to FEN - Enhanced debugging
    const newPosition = board.map((row, rowIndex) => {
      let fenRow = '';
      let emptyCount = 0;
      console.log(`🎨 Processing row ${rowIndex}:`, row);
      
      for (const square of row) {
        if (square === '1') {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fenRow += emptyCount;
            emptyCount = 0;
          }
          fenRow += square;
        }
      }
      if (emptyCount > 0) fenRow += emptyCount;
      
      console.log(`🎨 Row ${rowIndex} FEN: "${fenRow}"`);
      return fenRow;
    }).join('/');
    
    fenParts[0] = newPosition;
    const newFen = fenParts.join(' ');
    
    console.log('🎨 New FEN after placement:', newFen);
    console.log('🎨 FEN comparison:');
    console.log('🎨   Old:', boardState.fen);
    console.log('🎨   New:', newFen);
    
    // State güncellemesini verify et
    setBoardState(prev => {
      console.log('🎨 setState called, old FEN:', prev.fen);
      const newState = {
        ...prev,
        fen: newFen
      };
      console.log('🎨 setState called, new FEN:', newState.fen);
      return newState;
    });
    
    showStatus('success', `${piece} taşı ${targetSquare} karesine yerleştirildi`);
    return true;
  }, "Taş yerleştirilemedi");

  const handlePieceDrop = withErrorBoundary((sourceSquare, targetSquare, piece) => {
    console.log('🚨 handlePieceDrop ÇAĞRILDI!', { sourceSquare, targetSquare, piece });
    console.log('🚨 Chess instance exists:', !!chess);
    console.log('🚨 IsRecording:', boardState.isRecording);
    
    // *** BU ÇOK ÖNEMLİ: Spare piece detection ***
    if (!sourceSquare && piece) {
      console.log('🎨 ✅ SPARE PIECE DROP DETECTED!', { piece, targetSquare });
      const result = handleSparePieceDrop(piece, targetSquare);
      console.log('🎨 ✅ SPARE PIECE DROP RESULT:', result);
      return result;
    }
    
    // Eğer sourceSquare varsa ama piece undefined ise
    if (sourceSquare && !piece) {
      console.log('🎨 ⚠️ Source square provided but no piece info');
      console.log('🎨 ⚠️ This might be a board-to-board move');
    }
    
    // Eğer her ikisi de varsa
    if (sourceSquare && piece) {
      console.log('🎨 ⚠️ Both source and piece provided - board to board move');
    }
    
    if (boardState.isRecording && chess) {
      // Recording mode - only allow legal moves
      try {
        console.log('🎯 Attempting chess move...');
        console.log('🎯 Current chess FEN:', chess.fen());
        console.log('🎯 Board state FEN:', boardState.fen);
        
        // FEN senkronizasyonu kontrol et
        if (chess.fen() !== boardState.fen) {
          console.warn('🔄 FEN sync issue detected, reloading chess instance');
          try {
            chess.load(boardState.fen);
            console.log('✅ Chess instance resynced with board FEN');
          } catch (syncError) {
            console.error('❌ FEN sync failed:', syncError);
          }
        }
        
        // Kaynak karede ne var kontrol et
        const sourceSquareInfo = chess.get(sourceSquare);
        console.log('🎯 Source square content:', { square: sourceSquare, piece: sourceSquareInfo });
        
        if (!sourceSquareInfo) {
          console.error('❌ No piece on source square:', sourceSquare);
          console.log('🔍 Checking all pieces on board:');
          
          // Tüm board'u scan et
          for (let rank = 8; rank >= 1; rank--) {
            for (let file = 'a'; file <= 'h'; file = String.fromCharCode(file.charCodeAt(0) + 1)) {
              const square = file + rank;
              const piece = chess.get(square);
              if (piece) {
                console.log(`  ${square}: ${piece.color}${piece.type.toUpperCase()}`);
              }
            }
          }
          
          showStatus('error', `${sourceSquare} karesinde taş yok! Chess engine ile board senkronize değil.`);
          return false;
        }
        
        // Available moves for this piece
        const availableMoves = chess.moves({ square: sourceSquare, verbose: true });
        console.log('🎯 Available moves from', sourceSquare, ':', availableMoves.map(m => m.san));
        
        const move = chess.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q'
        });
        
        if (move) {
          console.log('✅ Legal move made:', move.san);
          
          if (isRecordingVariant) {
            setCurrentVariantMoves(prev => {
              const newMoves = [...prev, move.san];
              console.log('🎮 Variant moves updated:', newMoves);
              return newMoves;
            });
            // Variant için sadece FEN güncelle
            setBoardState(prev => ({ 
              ...prev, 
              fen: chess.fen() 
            }));
          } else {
            // Ana hat için hem moveList hem FEN güncelle - TEK setState
            setBoardState(prev => {
              const newMoveList = [...prev.moveList, move.san];
              console.log('📝 Main line updated:', newMoveList);
              return {
                ...prev,
                moveList: newMoveList,
                fen: chess.fen()
              };
            });
          }
          
          return true;
        } else {
          console.error('❌ Chess.move returned null');
          showStatus('error', 'Geçersiz hamle!');
          return false;
        }
      } catch (error) {
        console.error('❌ Chess.move threw error:', error);
        showStatus('error', `Hamle hatası: ${error.message}`);
        return false;
      }
    } else {
      console.log('🚨 Not in recording mode or no chess instance');
      // Edit mode - allow any piece movement using FEN manipulation
      console.log('🎨 Edit mode piece drop:', { sourceSquare, targetSquare });
      
      // FEN manipulation for piece placement in edit mode
      const fenParts = boardState.fen.split(' ');
      const position = fenParts[0];
      
      // Get piece from source square
      const sourceFile = sourceSquare.charCodeAt(0) - 97;
      const sourceRank = 8 - parseInt(sourceSquare[1]);
      const targetFile = targetSquare.charCodeAt(0) - 97;
      const targetRank = 8 - parseInt(targetSquare[1]);
      
      // Convert FEN to board array
      const rows = position.split('/');
      const board = rows.map(row => {
        const expandedRow = [];
        for (const char of row) {
          if (isNaN(char)) {
            expandedRow.push(char);
          } else {
            for (let i = 0; i < parseInt(char); i++) {
              expandedRow.push('1');
            }
          }
        }
        return expandedRow;
      });
      
      // Move piece
      const pieceToMove = board[sourceRank][sourceFile];
      if (pieceToMove !== '1') {
        board[sourceRank][sourceFile] = '1'; // Clear source
        board[targetRank][targetFile] = pieceToMove; // Place at target
        
        // Convert back to FEN
        const newPosition = board.map(row => {
          let fenRow = '';
          let emptyCount = 0;
          for (const square of row) {
            if (square === '1') {
              emptyCount++;
            } else {
              if (emptyCount > 0) {
                fenRow += emptyCount;
                emptyCount = 0;
              }
              fenRow += square;
            }
          }
          if (emptyCount > 0) fenRow += emptyCount;
          return fenRow;
        }).join('/');
        
        fenParts[0] = newPosition;
        const newFen = fenParts.join(' ');
        
        setBoardState(prev => ({
          ...prev,
          fen: newFen
        }));
        
        return true;
      }
      return false;
    }
  }, "Hamle yapılamadı");

  const handlePieceDropOffBoard = withErrorBoundary((sourceSquare) => {
    if (boardState.isRecording) {
      showStatus('warning', 'Hamle kaydı sırasında taş silinemez');
      return false;
    }
    
    console.log('🗑️ Removing piece from:', sourceSquare);
    // In edit mode, allow piece removal
    return true;
  }, "Taş silinemedi");

  // Board control functions
  const handleClearBoard = () => {
    setBoardState(prev => ({
      ...prev,
      fen: '8/8/8/8/8/8/8/8 w - - 0 1',
      moveList: [],
      isRecording: false
    }));
    setChess(null);
    showStatus('success', 'Tahta temizlendi');
  };

  const handleStartPosition = () => {
    const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    setBoardState(prev => ({
      ...prev,
      fen: startFen,
      moveList: [],
      isRecording: false
    }));
    setChess(null);
    showStatus('success', 'Başlangıç pozisyonu yüklendi');
  };

  const handleToggleTurn = () => {
    const fenParts = boardState.fen.split(' ');
    fenParts[1] = fenParts[1] === 'w' ? 'b' : 'w';
    const newFen = fenParts.join(' ');
    
    setBoardState(prev => ({
      ...prev,
      fen: newFen,
      turn: fenParts[1]
    }));
  };

  const handlePlaceKings = () => {
    // Simple FEN manipulation to place kings
    const fenParts = boardState.fen.split(' ');
    // This is a simplified version - in a real app you'd parse and modify the FEN properly
    fenParts[0] = '4k3/8/8/8/8/8/8/4K3';
    
    setBoardState(prev => ({
      ...prev,
      fen: fenParts.join(' ')
    }));
    showStatus('success', 'Şahlar yerleştirildi');
  };
  // Move recording functions
  const handleStartRecording = withErrorBoundary(() => {
    const currentFen = boardState.fen;
    
    console.log('🎬 Recording Started with FEN:', currentFen);
    console.log('🎬 Board state at recording start:', boardState);
    
    recordingStartFenRef.current = currentFen;
    
    try {
      // Önce normal Chess ile dene
      let chessInstance;
      
      try {
        chessInstance = new Chess(currentFen);
        console.log('✅ Normal Chess instance created');
      } catch (normalError) {
        console.log('⚠️ Normal Chess failed, trying ExtendedChess:', normalError.message);
        
        // Normal Chess başarısız olursa ExtendedChess kullan
        chessInstance = new ExtendedChess(currentFen, { 
          bypass: [10] 
        });
        console.log('✅ ExtendedChess instance created as fallback');
      }
      
      console.log('🎯 Chess FEN after creation:', chessInstance.fen());
      console.log('🎯 Current board FEN:', currentFen);
      console.log('🎯 Turn:', chessInstance.turn());
      
      // Tüm taşları konsola yazdır
      console.log('🎯 All pieces on chess instance:');
      for (let rank = 8; rank >= 1; rank--) {
        for (let file = 'a'; file <= 'h'; file = String.fromCharCode(file.charCodeAt(0) + 1)) {
          const square = file + rank;
          const piece = chessInstance.get(square);
          if (piece) {
            console.log(`  ${square}: ${piece.color}${piece.type.toUpperCase()}`);
          }
        }
      }
      
      // Legal moves 
      try {
        const moves = chessInstance.moves();
        console.log('🎯 Legal moves:', moves);
      } catch (moveError) {
        console.log('⚠️ No legal moves calculated:', moveError);
      }
      
      setChess(chessInstance);
      
      setBoardState(prev => ({
        ...prev,
        isRecording: true,
        moveList: []
      }));
      
      setCurrentPositionIndex(-1);
      showStatus('success', 'Hamle kaydı başladı');
    } catch (error) {
      console.error('❌ Chess instance creation failed:', error);
      showStatus('error', 'Hamle kaydı başlatılamadı: ' + error.message);
    }
  }, "Hamle kaydı başlatılamadı");

  const handleStopRecording = () => {
    setBoardState(prev => ({
      ...prev,
      isRecording: false
    }));
    setChess(null);
    showStatus('info', 'Hamle kaydı durduruldu');
  };
  const rewindToPosition = withErrorBoundary((toMoveIndex) => {
    const startFen = recordingStartFenRef.current || boardState.fen;
    
    console.log('🔄 Rewind to position:', {
      toMoveIndex,
      startFen,
      moveList: boardState.moveList
    });
    
    if (toMoveIndex <= 0) return startFen;
    
    try {
      // ExtendedChess kullan
      const tempChess = new ExtendedChess(startFen, { 
        bypass: [10] 
      });
      
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
      console.error('❌ Rewind error:', error);
      return startFen;
    }
  }, "Pozisyon geri alınamadı");
  const startVariantRecording = withErrorBoundary((fromMoveIndex) => {
    const wasRecording = boardState.isRecording;
    const actualStartFen = recordingStartFenRef.current;
    
    if (!actualStartFen) {
      showStatus('error', 'Önce hamle kaydı başlatın!');
      return;
    }
    
    console.log('🎯 Variant recording with start FEN:', actualStartFen);
    
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
    
    try {
      // ExtendedChess kullan
      const newChess = new ExtendedChess(fenToRewindTo, { 
        bypass: [10] 
      });
      
      setChess(newChess);
      setBoardState(prev => ({
        ...prev,
        fen: fenToRewindTo,
        isRecording: true
      }));
      
      setCurrentPositionIndex(fromMoveIndex - 1);
      showStatus('info', `Hamle ${fromMoveIndex + 1} için varyant kaydı başladı`);
    } catch (error) {
      console.error('❌ Variant chess instance error:', error);
      showStatus('error', 'Varyant kaydı başlatılamadı');
    }
  }, "Varyant kaydı başlatılamadı");
  // Move navigation function
  const navigateToMove = withErrorBoundary((moveIndex) => {
    console.log(`🎯 Navigating to move ${moveIndex}`);
    
    // Başlangıç pozisyonuna git
    if (moveIndex === -1) {
      const startFen = recordingStartFenRef.current || boardState.fen;
      setBoardState(prev => ({
        ...prev,
        fen: startFen
      }));
      setCurrentPositionIndex(-1);
      return;
    }
    
    if (!boardState.moveList || moveIndex < 0 || moveIndex >= boardState.moveList.length) {
      console.warn('❌ Invalid move index:', moveIndex);
      return;
    }

    const startFen = recordingStartFenRef.current || boardState.fen;
    
    try {
      // ExtendedChess kullan
      const tempChess = new ExtendedChess(startFen, { 
        bypass: [10] 
      });
      
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
      console.error('❌ Navigate error:', error);
    }
  }, "Hamleye gidilemedi");

  const stopVariantRecording = () => {
    if (currentVariantMoves.length > 0 && variantStartIndex >= 0) {
      console.log('🎯 Saving variant moves:', currentVariantMoves);
      
      const newVariant = {
        name: `variant_${String.fromCharCode(97 + tempVariants.length)}`,
        parentVariant: "main",
        parentMoveIndex: variantStartIndex,
        moves: currentVariantMoves.map(m => 
          typeof m === 'string' ? m : m.move
        )
      };
      
      console.log('🎯 New variant object:', newVariant);
      setTempVariants(prev => [...prev, newVariant]);
      showStatus('success', `Varyant ${newVariant.name} kaydedildi`);
    }
    
    setIsRecordingVariant(false);
    setVariantStartIndex(-1);
    setCurrentVariantMoves([]);
    setBoardState(prev => ({
      ...prev,
      isRecording: false
    }));
    setChess(null);
  };

  const handleSavePuzzle = withErrorBoundary(() => {
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

    // Board'ı temizle
    handleClearBoard();
    
    // Tüm state'leri resetle
    recordingStartFenRef.current = '';
    setIsRecordingVariant(false);
    setVariantStartIndex(-1);
    setCurrentVariantMoves([]);
    setCurrentPositionIndex(-1);
    setTempVariants([]);
    
    console.log('✅ New puzzle ready - Board cleared for next puzzle');
    showStatus('success', 'Puzzle kaydedildi! Yeni puzzle için board temizlendi.');
  }, "Puzzle kaydedilemedi");

  const currentPuzzleNumber = puzzleSet.puzzles.length + 1;
  
  return (
    <ChessboardDnDProvider backend={HTML5Backend}>
      <div className="max-w-6xl mx-auto">
        {/* Status Message - Fixed position to avoid layout shifts */}
        {statusMessage.message && (
          <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            statusMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            statusMessage.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            statusMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            <div className="flex items-center gap-2">
              <span>
                {statusMessage.type === 'success' ? '✅' :
                 statusMessage.type === 'error' ? '❌' :
                 statusMessage.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              {statusMessage.message}
            </div>
          </div>
        )}
        
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
                  onPieceDrop={(sourceSquare, targetSquare, piece) => {
                    console.log('🔍 Chessboard onPieceDrop called:', { sourceSquare, targetSquare, piece });
                    const result = handlePieceDrop(sourceSquare, targetSquare, piece);
                    console.log('🔍 onPieceDrop result:', result);
                    return result;
                  }}
                  onPieceDropOffBoard={handlePieceDropOffBoard}
                  boardWidth={boardWidth}
                  arePiecesDraggable={true}
                  customDropSquareStyle={{
                    backgroundColor: 'rgba(0, 255, 0, 0.4)'
                  }}
                  customSquareStyles={{}}
                  customBoardStyle={{
                    borderRadius: '4px'
                  }}
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

              {/* Test button - temporary */}
              <button
                onClick={() => {
                  console.log('🧪 TEST: Detailed board analysis');
                  console.log('🧪 Current board FEN:', boardState.fen);
                  console.log('🧪 Is recording:', boardState.isRecording);
                  console.log('🧪 Chess instance exists:', !!chess);
                  
                  // FEN'i parse et ve göster
                  const fenParts = boardState.fen.split(' ');
                  const position = fenParts[0];
                  const rows = position.split('/');
                  
                  console.log('🧪 Board breakdown:');
                  rows.forEach((row, index) => {
                    console.log(`🧪   Rank ${8-index}: "${row}"`);
                  });
                  
                  // f2 karesini özellikle kontrol et
                  console.log('🧪 Manual f2 check:');
                  const f2File = 5; // f = 5 (0-indexed)
                  const f2Rank = 6; // 2nd rank = index 6 (0-indexed from top)
                  
                  const expandedRows = rows.map(row => {
                    const expandedRow = [];
                    for (const char of row) {
                      if (isNaN(char)) {
                        expandedRow.push(char);
                      } else {
                        for (let i = 0; i < parseInt(char); i++) {
                          expandedRow.push('1');
                        }
                      }
                    }
                    return expandedRow;
                  });
                  
                  console.log('🧪 Expanded board:', expandedRows);
                  console.log('🧪 f2 content:', expandedRows[f2Rank] ? expandedRows[f2Rank][f2File] : 'undefined');
                  
                  if (chess) {
                    console.log('🧪 Chess instance FEN:', chess.fen());
                    console.log('🧪 Chess instance f2:', chess.get('f2'));
                    
                    console.log('🧪 All pieces in chess instance:');
                    for (let rank = 8; rank >= 1; rank--) {
                      for (let file = 'a'; file <= 'h'; file = String.fromCharCode(file.charCodeAt(0) + 1)) {
                        const square = file + rank;
                        const piece = chess.get(square);
                        if (piece) {
                          console.log(`🧪   ${square}: ${piece.color}${piece.type.toUpperCase()}`);
                        }
                      }
                    }
                  }
                }}
                className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded text-sm"
              >
                🧪 Debug Board State
              </button>

              {/* Manual Spare Piece Test - temporary */}
              <button
                onClick={() => {
                  console.log('🧪 MANUAL SPARE PIECE TEST');
                  const testResult = handleSparePieceDrop('wR', 'f2');
                  console.log('🧪 Manual test result:', testResult);
                  
                  // Sonra FEN'i kontrol et
                  setTimeout(() => {
                    console.log('🧪 FEN after manual test:', boardState.fen);
                  }, 100);
                }}
                className="px-3 py-2 bg-orange-100 text-orange-700 rounded text-sm"
              >
                🧪 Manual Spare Piece Test
              </button>
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

              {/* Move Navigation */}
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
                        {isRecordingVariant && (
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

                {isRecordingVariant && (
                  <div className="text-sm text-purple-600 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    Varyant kaydı - Hamle {variantStartIndex + 1} yerine alternatif girin
                  </div>
                )}

                {/* Move List */}
                <div className="min-h-[120px] max-h-[200px] overflow-y-auto border border-gray-200 rounded p-3 bg-white">
                  {boardState.moveList.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">Henüz hamle kaydedilmedi</p>
                      {puzzleSet.puzzles.length > 0 && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                          <span className="text-green-700">✅ Son puzzle kaydedildi!</span>
                          <div className="text-xs text-green-600 mt-1">
                            Puzzle #{puzzleSet.puzzles.length} - {puzzleSet.puzzles[puzzleSet.puzzles.length - 1].mainLine.length} hamle
                          </div>
                        </div>
                      )}
                    </div>
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
                            onClick={() => navigateToMove(index)}
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
                  
                  {/* Current Variant */}
                  {currentVariantMoves.length > 0 && (
                    <div className="mt-3 p-2 bg-purple-50 rounded border border-purple-200">
                      <div className="text-xs font-medium text-purple-700 mb-1">
                        Varyant (Hamle {variantStartIndex + 1}'den):
                      </div>
                      <div className="text-sm text-purple-600">
                        {currentVariantMoves.join(' ')}
                      </div>
                    </div>
                  )}

                  {/* Saved Variants List */}
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
                                showStatus('info', 'Varyant silindi');
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
                  <h4 className="font-medium mb-2">Kaydedilen Puzzlelar</h4>
                  <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
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