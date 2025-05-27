import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chessboard, ChessboardDnDProvider, SparePiece } from "react-chessboard";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useId } from "react";
import { Chess } from 'chess.js';
import { ExtendedChess } from '@/utils/chess/ExtendedChess.js';
import useBoardEditorStore from '../store/boardEditorStore';

const PuzzleEditorPage = () => {
  // Current step
  const [currentStep, setCurrentStep] = useState(1);
  
  // Component'in başına, import'ların altına ekle:
  const boardStore = useBoardEditorStore();
  
  // Test console log ekle:
  console.log("🔗 BoardStore aktif varyant:", boardStore.activeVariant);
  console.log("🔗 BoardStore varyantlar:", Object.keys(boardStore.variants));

  // EKSIK REF TANIMINI EKLE:
  const isProcessingMoveRef = useRef(false);
  
  // Metadata state
  const [metadata, setMetadata] = useState({
    setTitle: '',
    description: '',
    totalQuestions: 18,
    difficulty: 1,
    topic: 'kale',
    pieceSet: 'merida',
    nextSetId: '',
    nextLessonUrl: ''
  });

  // Smart naming state  
  const [smartCode, setSmartCode] = useState('001ka1');
  const [decodedInfo, setDecodedInfo] = useState(null);

  // Questions state
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [questions, setQuestions] = useState([]);

  // Current puzzle state
  const [currentPuzzle, setCurrentPuzzle] = useState({
    fen: '8/8/8/8/8/8/8/8 w - - 0 1', // Boş tahta
    title: '',
    mainLine: [],
    variations: []
  });

  // Board state
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [boardWidth, setBoardWidth] = useState(360);
  const [isRecordingMoves, setIsRecordingMoves] = useState(false);
  const [isRecordingVariation, setIsRecordingVariation] = useState(false);
  const [currentVariationStartIndex, setCurrentVariationStartIndex] = useState(-1);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0); // Navigation için
  const [displayFen, setDisplayFen] = useState('8/8/8/8/8/8/8/8 w - - 0 1'); // Görüntülenen pozisyon
  const boardRef = useRef(null);
  const uniqueId = useId();

  // Chess game instance for board editing
  const game = useMemo(() => new ExtendedChess(currentPuzzle.fen, { bypass: [10] }), [currentPuzzle.fen]);
  
  // Separate chess instance for move recording
  const [moveRecordingGame, setMoveRecordingGame] = useState(null);

  // Board responsive sizing
  useEffect(() => {
    const updateBoardSize = () => {
      if (boardRef.current) {
        const containerWidth = boardRef.current.offsetWidth;
        setBoardWidth(Math.min(containerWidth - 40, 400));
      }
    };

    const observer = new ResizeObserver(updateBoardSize);
    if (boardRef.current) observer.observe(boardRef.current);
    updateBoardSize();

    return () => observer.disconnect();
  }, []);

  // Topic options
  const topics = {
    'k': 'Kale',
    'f': 'Fil', 
    'v': 'Vezir',
    's': 'Şah',
    'p': 'Piyon',
    'a': 'At'
  };

  // Exercise types
  const exerciseTypes = {
    'a': 'Alma',
    'i': 'İsteme', 
    'b': 'Bedava',
    'c': 'Canavar',
    's': 'Serbest'
  };

  // Piece sets
  const pieceSets = {
    'merida': 'Merida (Varsayılan)',
    'lucide': 'Lucide',
    'berlin': 'Berlin', 
    'sahgizli': 'Şahgizli',
    'piyondag': 'Piyondağ',
    'atkupa': 'Atkupa'
  };

  // Simple smart code decoder
  const decodeSmartCode = (code) => {
    if (code.length !== 6) return null;
    
    const setNumber = code.substring(0, 3);
    const topic = code.charAt(3);
    const exerciseType = code.charAt(4);
    const difficulty = code.charAt(5);
    
    return {
      setNumber: parseInt(setNumber),
      topic: topics[topic] || 'Bilinmiyor',
      exerciseType: exerciseTypes[exerciseType] || 'Bilinmiyor', 
      difficulty: parseInt(difficulty)
    };
  };

  // Handle smart code change
  const handleSmartCodeChange = (code) => {
    setSmartCode(code);
    const decoded = decodeSmartCode(code);
    setDecodedInfo(decoded);
    
    if (decoded) {
      setMetadata(prev => ({
        ...prev,
        setTitle: `${decoded.topic} ${decoded.exerciseType} Puzzleları - Set ${decoded.setNumber}`,
        difficulty: decoded.difficulty
      }));
    }
  };

  // Handle form inputs
  const handleMetadataChange = (field, value) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  // Continue to next step
  const continueToStep2 = () => {
    if (smartCode.length === 6 && metadata.setTitle.trim()) {
      setCurrentStep(2);
    }
  };

  // Board Editor Functions
  const handleSparePieceDrop = (piece, targetSquare) => {
    const color = piece[0];
    const type = piece[1].toLowerCase();
    
    try {
      game.remove(targetSquare);
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        const newFen = game.fen();
        setCurrentPuzzle(prev => ({ ...prev, fen: newFen }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Taş yerleştirme hatası:", error.message);
      return false;
    }
  };

  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    if (isRecordingMoves) {
      const moveRecorded = handleMoveForRecording(sourceSquare, targetSquare);
      if (moveRecorded) {
        return true;
      }
    }

    // Position editing mode
    try {
      game.remove(sourceSquare);
      game.remove(targetSquare);
      
      const color = piece[0];
      const type = piece[1].toLowerCase();
      const success = game.put({ type, color }, targetSquare);
      
      if (success) {
        const newFen = game.fen();
        setCurrentPuzzle(prev => ({ ...prev, fen: newFen }));
        
        if (!isRecordingMoves) {
          setDisplayFen(newFen);
        }
      }
      
      return success;
    } catch (error) {
      console.error("Taş taşıma hatası:", error.message);
      return false;
    }
  };

  const handlePieceDropOffBoard = (sourceSquare) => {
    game.remove(sourceSquare);
    const newFen = game.fen();
    setCurrentPuzzle(prev => ({ ...prev, fen: newFen }));
    return true;
  };

  // Board control functions
  const handleClearBoard = () => {
    game.clear();
    const newFen = game.fen();
    setCurrentPuzzle(prev => ({ ...prev, fen: newFen }));
    setDisplayFen(newFen);
  };

  const handleStartPosition = () => {
    const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    game.load(startFen, { bypass: [10] });
    setCurrentPuzzle(prev => ({ ...prev, fen: startFen }));
    setDisplayFen(startFen);
  };

  const handlePlaceKings = () => {
    game.clear();
    game.put({ type: 'k', color: 'w' }, 'e1');
    game.put({ type: 'k', color: 'b' }, 'e8');
    const newFen = game.fen();
    setCurrentPuzzle(prev => ({ ...prev, fen: newFen }));
    setDisplayFen(newFen);
  };

  // Move recording functions
  const startMoveRecording = () => {
    try {
      const startingPosition = currentPuzzle.fen;
      const hasKings = startingPosition.includes('K') && startingPosition.includes('k');
      let newGame;
      
      if (hasKings) {
        newGame = new Chess(startingPosition);
      } else {
        console.warn("⚠️ Recording moves from position without both kings");
        newGame = new ExtendedChess(startingPosition, { bypass: [10] });
      }
      
      for (const move of currentPuzzle.mainLine) {
        try {
          const result = newGame.move(move);
          if (!result) {
            console.error(`❌ Could not apply existing move: ${move}`);
            break;
          }
        } catch (error) {
          console.error(`❌ Error applying move ${move}:`, error);
          break;
        }
      }
      
      setCurrentPuzzle(prev => ({
        ...prev,
        startingFen: startingPosition
      }));
      
      const currentFen = newGame.fen();
      setDisplayFen(currentFen);
      setMoveRecordingGame(newGame);
      setIsRecordingMoves(true);
      setCurrentMoveIndex(currentPuzzle.mainLine.length);
      
      console.log("🚀 Hamle kaydı başlatıldı");
      
    } catch (error) {
      console.error("💥 Hamle kaydı başlatılamadı:", error);
      alert("Bu pozisyondan hamle kaydı başlatılamıyor. Lütfen geçerli bir pozisyon oluşturun.");
    }
  };

  const stopMoveRecording = () => {
    setIsRecordingMoves(false);
    setIsRecordingVariation(false);
    setMoveRecordingGame(null);
    setCurrentVariationStartIndex(-1);
  };

  // Variation recording functions
  const startVariationFromMove = (moveIndex) => {
    // moveIndex = hangi hamle yerine varyant yapacağımız (1-based)
    if (moveIndex < 1 || moveIndex > currentPuzzle.mainLine.length) {
      console.warn("Geçersiz varyant başlangıç indeksi:", moveIndex);
      return;
    }
    
    try {
      console.log(`🎯 Varyant başlatılıyor - ${moveIndex}. hamle yerine alternatif`);
      
      // Get the original starting position
      const originalFen = getOriginalStartingPosition();
      const hasKings = originalFen.includes('K') && originalFen.includes('k');
      
      let newGame;
      if (hasKings) {
        newGame = new Chess(originalFen);
      } else {
        newGame = new ExtendedChess(originalFen, { bypass: [10] });
      }
      
      // Apply moves up to (but not including) the target move
      for (let i = 0; i < moveIndex - 1; i++) {
        try {
          const move = newGame.move(currentPuzzle.mainLine[i]);
          if (!move) {
            console.error(`Could not apply move ${currentPuzzle.mainLine[i]} at index ${i}`);
            return;
          }
        } catch (error) {
          console.error(`Could not apply move ${currentPuzzle.mainLine[i]}:`, error);
          return;
        }
      }
      
      console.log(`✅ Pozisyon ${moveIndex}. hamleden ÖNCE hazır: ${newGame.fen().substring(0, 20)}...`);
      console.log(`🔄 Şimdi ${currentPuzzle.mainLine[moveIndex - 1]} yerine alternatif hamle girebilirsiniz`);
      console.log(`🎮 Oyun sırası: ${newGame.turn() === 'w' ? 'Beyaz' : 'Siyah'}`);
      
      // Create new variation
      const newVariation = {
        id: `variation_${Date.now()}`,
        startMoveIndex: moveIndex - 1, // 0-based index
        title: `Varyant ${currentPuzzle.variations.length + 1}`,
        moves: []
      };
      
      setCurrentPuzzle(prev => ({
        ...prev,
        variations: [...prev.variations, newVariation]
      }));
      
      // CRITICAL: Set up for variation recording BEFORE updating display
      setMoveRecordingGame(newGame);
      setIsRecordingMoves(true);
      setIsRecordingVariation(true);
      setCurrentVariationStartIndex(moveIndex - 1);
      
      // Update display to show position BEFORE the target move
      setDisplayFen(newGame.fen());
      setCurrentMoveIndex(moveIndex - 1);
      
      console.log(`✅ Varyant kaydı başlatıldı - ${moveIndex}. hamle yerine alternatif`);
      
    } catch (error) {
      console.error("❌ Varyant kaydı başlatılamadı:", error);
      alert("Varyant kaydı başlatılamıyor. Lütfen tekrar deneyin.");
    }
  };

  const stopVariationRecording = () => {
    if (isRecordingVariation) {
      console.log("✅ Varyant kaydı tamamlandı");
      // Navigation hatası önlemek için daha güvenli approach:
      setCurrentMoveIndex(currentPuzzle.mainLine.length);
      setDisplayFen(currentPuzzle.fen);
    }
    
    setIsRecordingVariation(false);
    setCurrentVariationStartIndex(-1);
    setIsRecordingMoves(false);
    setMoveRecordingGame(null);
  };

  const deleteVariation = (variationIndex) => {
    if (confirm('Bu varyantı silmek istediğinizden emin misiniz?')) {
      const newVariations = currentPuzzle.variations.filter((_, index) => index !== variationIndex);
      setCurrentPuzzle(prev => ({
        ...prev,
        variations: newVariations
      }));
    }
  };
  // Helper function to get original starting position
  const getOriginalStartingPosition = () => {
    // First check current puzzle's starting position
    if (currentPuzzle.startingFen) {
      return currentPuzzle.startingFen;
    }
    
    // Check if we have a stored starting position for this puzzle
    const existingPuzzle = questions.find(q => q.questionNumber === currentQuestion);
    if (existingPuzzle && existingPuzzle.startingFen) {
      return existingPuzzle.startingFen;
    }
    
    // Otherwise, try current FEN if no moves
    if (currentPuzzle.mainLine.length === 0) {
      return currentPuzzle.fen; // No moves yet, current FEN is the starting position
    }
    
    // If we have moves but no starting position, we have a problem
    // Return the current puzzle FEN as fallback
    console.warn('No starting position found, using current FEN as fallback');
    return currentPuzzle.fen;
  };
  // Move navigation functions
  const navigateToMove = (moveIndex) => {
    const maxMoves = currentPuzzle.mainLine.length;
    const targetIndex = Math.max(0, Math.min(moveIndex, maxMoves));
    
    try {
      // Get the original starting position (without moves)
      const originalFen = getOriginalStartingPosition();
      
      // Create chess game from original position
      const hasKings = originalFen.includes('K') && originalFen.includes('k');
      let navGame;
      
      if (hasKings) {
        navGame = new Chess(originalFen);
      } else {
        navGame = new ExtendedChess(originalFen, { bypass: [10] });
      }
      
      // Apply moves up to target index
      for (let i = 0; i < targetIndex; i++) {
        try {
          const move = navGame.move(currentPuzzle.mainLine[i]);
          if (!move) {
            console.error(`Cannot apply move ${i}: ${currentPuzzle.mainLine[i]}`);
            break;
          }
        } catch (error) {
          console.error(`Navigation error at move ${i}:`, error);
          break;
        }
      }
      
      setCurrentMoveIndex(targetIndex);
      setDisplayFen(navGame.fen());
      
      if (!isRecordingMoves) {
        setCurrentPuzzle(prev => ({ ...prev, fen: navGame.fen() }));
      }
      
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const goToNextMove = React.useCallback(() => {
    navigateToMove(currentMoveIndex + 1);
  }, [currentMoveIndex, navigateToMove]);

  const goToPreviousMove = React.useCallback(() => {
    navigateToMove(currentMoveIndex - 1);
  }, [currentMoveIndex, navigateToMove]);

  const goToStart = React.useCallback(() => {
    navigateToMove(0);
  }, [navigateToMove]);

  const goToEnd = React.useCallback(() => {
    navigateToMove(currentPuzzle.mainLine.length);
  }, [currentPuzzle.mainLine.length, navigateToMove]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (currentStep !== 2) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPreviousMove();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextMove();
          break;
        case 'Home':
          e.preventDefault();
          goToStart();
          break;
        case 'End':
          e.preventDefault();
          goToEnd();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, goToPreviousMove, goToNextMove, goToStart, goToEnd]);
  // Update display when puzzle changes
  useEffect(() => {
    if (currentStep === 2 && !isRecordingMoves) {
      setDisplayFen(currentPuzzle.fen);
      setCurrentMoveIndex(currentPuzzle.mainLine.length);
    }
  }, [currentPuzzle.fen, currentPuzzle.mainLine.length, currentStep, isRecordingMoves]);

  // EKSIK FONKSIYONU TAMAMLA:
  const handleMoveForRecording = (sourceSquare, targetSquare) => {
    if (!isRecordingMoves) {
      console.warn("❌ Hamle kaydı aktif değil");
      return false;
    }

    // BoardStore'u mevcut FEN ile başlat
    boardStore.initializeChess(displayFen);
    
    console.log("🎯 BoardStore ile hamle kaydediliyor:", sourceSquare, "->", targetSquare);
    
    const result = boardStore.recordMove(sourceSquare, targetSquare);
    
    if (result.success) {
      console.log("✅ BoardStore hamle başarılı:", result.move.san);
      setDisplayFen(result.fen);
      
      // DÜZELTME: Varyant modu kontrol et
      if (isRecordingVariation) {
        // Varyant hamlesi - son varyanta ekle
        setCurrentPuzzle(prev => {
          const newVariations = [...prev.variations];
          const lastVariation = newVariations[newVariations.length - 1];
          if (lastVariation) {
            lastVariation.moves = [...lastVariation.moves, result.move.san];
          }
          console.log("🔀 Varyant hamle eklendi:", result.move.san);
          return {
            ...prev,
            variations: newVariations
          };
        });
      } else {
        // Ana hat hamlesi
        setCurrentPuzzle(prev => ({
          ...prev,
          mainLine: [...prev.mainLine, result.move.san],
          fen: result.fen
        }));
        console.log("📝 Ana hat hamle eklendi:", result.move.san);
      }
      
      setCurrentMoveIndex(prev => prev + 1);
      return true;
    } else {
      console.error("❌ BoardStore hamle hatası:", result.error);
      return false;
    }
  };

  const undoLastMove = () => {
    if (!moveRecordingGame) return;
    
    try {
      moveRecordingGame.undo();
      
      if (isRecordingVariation) {
        const newVariations = [...currentPuzzle.variations];
        const currentVariation = newVariations[newVariations.length - 1];
        if (currentVariation && currentVariation.moves.length > 0) {
          currentVariation.moves.pop();
          setCurrentPuzzle(prev => ({
            ...prev,
            variations: newVariations,
            fen: moveRecordingGame.fen()
          }));
        }
      } else {
        if (currentPuzzle.mainLine.length > 0) {
          const newMainLine = currentPuzzle.mainLine.slice(0, -1);
          setCurrentPuzzle(prev => ({ 
            ...prev, 
            mainLine: newMainLine,
            fen: moveRecordingGame.fen()
          }));
        }
      }
    } catch (error) {
      console.error('Hamle geri alma hatası:', error);
    }
  };

  const clearMainLine = () => {
    const originalFen = currentPuzzle.fen.split(' ');
    originalFen[4] = '0';
    originalFen[5] = '1';
    const resetFen = originalFen.join(' ');
    
    setCurrentPuzzle(prev => ({ 
      ...prev, 
      mainLine: [],
      variations: [],
      fen: resetFen
    }));
    
    if (isRecordingMoves) {
      stopMoveRecording();
      setTimeout(() => {
        try {
          const hasKings = resetFen.includes('K') && resetFen.includes('k');
          let newGame;
          
          if (hasKings) {
            newGame = new Chess(resetFen);
          } else {
            newGame = new ExtendedChess(resetFen, { bypass: [10] });
          }
          
          setMoveRecordingGame(newGame);
          setIsRecordingMoves(true);
        } catch (error) {
          console.error("Hamle kaydı yeniden başlatılamadı:", error);
        }
      }, 100);
    }
  };

  const saveCurrentPuzzle = () => {
    const startingFen = currentPuzzle.mainLine.length === 0 
      ? currentPuzzle.fen 
      : getOriginalStartingPosition();
    
    const puzzleToSave = {
      id: `${smartCode}_${currentQuestion}`,
      questionNumber: currentQuestion,
      title: currentPuzzle.title || `Soru ${currentQuestion}`,
      fen: currentPuzzle.fen,
      startingFen: startingFen,
      mainLine: [...currentPuzzle.mainLine],
      variations: [...currentPuzzle.variations],
      savedAt: new Date().toISOString()
    };

    setQuestions(prev => {
      const newQuestions = [...prev];
      const existingIndex = newQuestions.findIndex(q => q.questionNumber === currentQuestion);
      
      if (existingIndex >= 0) {
        newQuestions[existingIndex] = puzzleToSave;
      } else {
        newQuestions.push(puzzleToSave);
      }
      
      return newQuestions.sort((a, b) => a.questionNumber - b.questionNumber);
    });

    if (isRecordingMoves) {
      stopMoveRecording();
    }

    if (currentQuestion < metadata.totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
      
      setCurrentPuzzle({
        fen: '8/8/8/8/8/8/8/8 w - - 0 1',
        title: '',
        mainLine: [],
        variations: []
      });
    }

    console.log('Puzzle saved with variations:', puzzleToSave);
  };

  const loadPuzzleForQuestion = React.useCallback((questionNum) => {
    console.log("🔄 loadPuzzleForQuestion çağrıldı:", questionNum);
    
    const existingPuzzle = questions.find(q => q.questionNumber === questionNum);
    
    if (existingPuzzle) {
      console.log("📁 Mevcut puzzle bulundu:", existingPuzzle.fen.substring(0, 30) + "...");
      setCurrentPuzzle({
        fen: existingPuzzle.fen,
        title: existingPuzzle.title,
        mainLine: existingPuzzle.mainLine || [],
        variations: existingPuzzle.variations || [],
        startingFen: existingPuzzle.startingFen
      });
      setDisplayFen(existingPuzzle.fen);
      setCurrentMoveIndex(0);
    } else {
      console.log("🆕 Yeni soru - boş tahta oluşturuluyor");
      const emptyFen = '8/8/8/8/8/8/8/8 w - - 0 1';
      setCurrentPuzzle({
        fen: emptyFen,
        title: '',
        mainLine: [],
        variations: [],
        startingFen: emptyFen
      });
      setDisplayFen(emptyFen);
      setCurrentMoveIndex(0);
    }
    
    setIsRecordingMoves(prevRecording => {
      if (prevRecording) {
        console.log("⏹️ Hamle kaydı durduruluyor (soru değişikliği)");
        setIsRecordingVariation(false);
        setMoveRecordingGame(null);
        setCurrentVariationStartIndex(-1);
      }
      return false;
    });
  }, [questions]);

  const exportToJson = () => {
    const exportData = {
      metadata: {
        smartCode: smartCode,
        title: metadata.setTitle,
        description: metadata.description,
        totalQuestions: metadata.totalQuestions,
        completedQuestions: questions.length,
        pieceSet: metadata.pieceSet,
        nextSetId: metadata.nextSetId || null,
        nextLessonUrl: metadata.nextLessonUrl || null,
        difficulty: decodedInfo?.difficulty || 1,
        topic: decodedInfo?.topic || 'Bilinmiyor',
        exerciseType: decodedInfo?.exerciseType || 'Bilinmiyor',
        createdDate: new Date().toISOString(),
        version: "1.0",
        author: "ChessMino Puzzle Creator"
      },
      puzzles: questions.map(question => ({
        id: question.id,
        questionNumber: question.questionNumber,
        title: question.title,
        fen: question.fen,
        mainLine: question.mainLine,
        variations: question.variations,
        difficulty: decodedInfo?.difficulty || 1,
        smartCode: smartCode,
        pieceSet: metadata.pieceSet,
        createdAt: question.savedAt
      })).sort((a, b) => a.questionNumber - b.questionNumber)
    };

    return exportData;
  };

  const downloadJsonFile = () => {
    const exportData = exportToJson();
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `chessmino-${smartCode}-${date}.json`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyJsonToClipboard = async () => {
    const exportData = exportToJson();
    const jsonString = JSON.stringify(exportData, null, 2);
    
    try {
      await navigator.clipboard.writeText(jsonString);
      alert('JSON panoya kopyalandı!');
    } catch (error) {
      console.error('Panoya kopyalama hatası:', error);
      alert('Panoya kopyalama başarısız!');
    }
  };

  useEffect(() => {
    if (currentStep === 2) {
      loadPuzzleForQuestion(currentQuestion);
    }
  }, [currentQuestion, currentStep, loadPuzzleForQuestion]);

  const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-blue-600 hover:text-blue-800">
                ← Ana Sayfa
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Puzzle Set Oluşturucu
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Aşama {currentStep} / 3
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Metadata</span>
            </div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Sorular</span>
            </div>
            <div className={`flex items-center ${currentStep >= 3 || questions.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : questions.length > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Export</span>
            </div>
          </div>
        </div>

        {/* Step 1: Metadata */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Puzzle Set Bilgileri</h2>
              
              <div className="space-y-6">
                {/* Smart Code Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Akıllı Kod
                  </label>
                  <input
                    type="text"
                    value={smartCode}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase();
                      if (value.length <= 6) {
                        handleSmartCodeChange(value);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-xl text-center tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="001ka1"
                    maxLength="6"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Format: AAA + Taş + Tip + Seviye (örn: 001ka1)
                  </p>
                </div>

                {/* Smart Code Info Panel */}
                {decodedInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Kod Bilgileri</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Set Numarası:</span>
                        <span className="ml-2">{decodedInfo.setNumber}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Konu:</span>
                        <span className="ml-2">{decodedInfo.topic}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Egzersiz Tipi:</span>
                        <span className="ml-2">{decodedInfo.exerciseType}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Zorluk:</span>
                        <span className="ml-2">Seviye {decodedInfo.difficulty}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Set Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Set Başlığı
                  </label>
                  <input
                    type="text"
                    value={metadata.setTitle}
                    onChange={(e) => handleMetadataChange('setTitle', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Puzzle set başlığı"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => handleMetadataChange('description', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Set hakkında kısa açıklama..."
                  />
                </div>

                {/* Total Questions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Toplam Soru Sayısı
                  </label>
                  <select
                    value={metadata.totalQuestions}
                    onChange={(e) => handleMetadataChange('totalQuestions', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value={6}>6 Soru</option>
                    <option value={12}>12 Soru</option>
                    <option value={18}>18 Soru</option>
                    <option value={24}>24 Soru</option>
                  </select>
                </div>

                {/* Piece Set Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taş Seti
                  </label>
                  <select
                    value={metadata.pieceSet}
                    onChange={(e) => handleMetadataChange('pieceSet', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    {Object.entries(pieceSets).map(([key, name]) => (
                      <option key={key} value={key}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Satranç taşlarının görünüm stili
                  </p>
                </div>

                {/* Next Set Configuration */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Set Tamamlandıktan Sonra</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sonraki Set ID
                      </label>
                      <input
                        type="text"
                        value={metadata.nextSetId}
                        onChange={(e) => handleMetadataChange('nextSetId', e.target.value.toLowerCase())}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono"
                        placeholder="002ka1"
                        maxLength="6"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Öğrenci bu seti bitirince hangi set açılsın?
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sonraki Ders/Sayfa
                      </label>
                      <input
                        type="text"
                        value={metadata.nextLessonUrl}
                        onChange={(e) => handleMetadataChange('nextLessonUrl', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        placeholder="/lessons/kale-egzersizleri"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Veya hangi derse yönlendirilsin?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="pt-6">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">Özet:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Kod:</strong> {smartCode || 'Girilmedi'}</div>
                      <div><strong>Başlık:</strong> {metadata.setTitle || 'Otomatik oluşturulacak'}</div>
                      <div><strong>Soru Sayısı:</strong> {metadata.totalQuestions}</div>
                      <div><strong>Taş Seti:</strong> {pieceSets[metadata.pieceSet]}</div>
                      {metadata.nextSetId && (
                        <div><strong>Sonraki Set:</strong> {metadata.nextSetId}</div>
                      )}
                      {metadata.nextLessonUrl && (
                        <div><strong>Sonraki Ders:</strong> {metadata.nextLessonUrl}</div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={continueToStep2}
                    disabled={smartCode.length !== 6 || !metadata.setTitle.trim()}
                    className={`w-full py-3 px-6 rounded-lg font-medium ${
                      smartCode.length === 6 && metadata.setTitle.trim()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Sorulara Geç →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Questions with Real Board */}
        {currentStep === 2 && (
          <ChessboardDnDProvider backend={HTML5Backend}>
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-lg shadow p-6">
                {/* Question Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      ← Metadata'ya Dön
                    </button>
                    <h2 className="text-xl font-semibold">
                      Soru {currentQuestion} / {metadata.totalQuestions}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newQuestion = Math.max(1, currentQuestion - 1);
                        setCurrentQuestion(newQuestion);
                      }}
                      disabled={currentQuestion === 1}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      ← Önceki
                    </button>
                    <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded font-medium">
                      {currentQuestion}
                      {questions.find(q => q.questionNumber === currentQuestion) && (
                        <span className="ml-1 text-green-600">✓</span>
                      )}
                    </span>
                    <button
                      onClick={() => {
                        const newQuestion = Math.min(metadata.totalQuestions, currentQuestion + 1);
                        setCurrentQuestion(newQuestion);
                      }}
                      disabled={currentQuestion === metadata.totalQuestions}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Sonraki →
                    </button>
                  </div>
                </div>

                {/* Current Puzzle Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Board Area */}
                  <div className="lg:col-span-2">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Satranç Tahtası</h3>
                        {isRecordingMoves && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-700 font-medium">Kayıt Aktif</span>
                          </div>
                        )}
                      </div>
                      
                      <div ref={boardRef}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {!isRecordingMoves ? (
                            <button
                              onClick={startMoveRecording}
                              className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                            >
                              ▶️ Hamle Kaydını Başlat
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={stopMoveRecording}
                                className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                              >
                                ⏹️ Kaydı Durdur
                              </button>
                              <button
                                onClick={undoLastMove}
                                disabled={currentPuzzle.mainLine.length === 0}
                                className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 disabled:opacity-50"
                              >
                                ↶ Son Hamleyi Geri Al
                              </button>
                              <button
                                onClick={clearMainLine}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                              >
                                🗑️ Hamleleri Temizle
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div ref={boardRef}>
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
                        <Chessboard
                          id={uniqueId}
                          position={displayFen}
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
                          // DÜZELTME: Varyant modunda da taşlar sürüklenebilir olmalı
                          arePiecesDraggable={
                            !isRecordingMoves || 
                            currentMoveIndex === currentPuzzle.mainLine.length ||
                            isRecordingVariation // Varyant modunda da sürüklenebilir
                          }
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

                      <div className="mt-4 space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Pozisyon Düzenleme</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <button
                              onClick={handleStartPosition}
                              className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                            >
                              🏁 Başlangıç
                            </button>
                            <button
                              onClick={handleClearBoard}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                            >
                              🗑️ Temizle
                            </button>
                            <button
                              onClick={() => setBoardOrientation(boardOrientation === "white" ? "black" : "white")}
                              className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                            >
                              🔄 Çevir
                            </button>
                            <button
                              onClick={handlePlaceKings}
                              className="px-3 py-2 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                            >
                              👑 Şahlar
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Hamle Navigasyonu</h4>
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <button
                              onClick={goToStart}
                              disabled={currentMoveIndex === 0}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
                              title="Başa git (Home)"
                            >
                              ⏪
                            </button>
                            <button
                              onClick={goToPreviousMove}
                              disabled={currentMoveIndex === 0}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
                              title="Önceki hamle (←)"
                            >
                              ◀
                            </button>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-mono">
                              {currentMoveIndex} / {currentPuzzle.mainLine.length}
                            </span>
                            <button
                              onClick={goToNextMove}
                              disabled={currentMoveIndex >= currentPuzzle.mainLine.length}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
                              title="Sonraki hamle (→)"
                            >
                              ▶
                            </button>
                            <button
                              onClick={goToEnd}
                              disabled={currentMoveIndex >= currentPuzzle.mainLine.length}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
                              title="Sona git (End)"
                            >
                              ⏩
                            </button>
                          </div>
                          <div className="text-xs text-center text-gray-500">
                            Klavye: ← → ok tuşları, Home/End
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Hamle Kaydı</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {!isRecordingMoves ? (
                              <button
                                onClick={startMoveRecording}
                                className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                              >
                                ▶️ Hamle Kaydını Başlat
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={stopMoveRecording}
                                  className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                                >
                                  ⏹️ Kaydı Durdur
                                </button>
                                <button
                                  onClick={undoLastMove}
                                  disabled={currentPuzzle.mainLine.length === 0}
                                  className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 disabled:opacity-50"
                                >
                                  ↶ Son Hamleyi Geri Al
                                </button>
                                <button
                                  onClick={clearMainLine}
                                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                                >
                                  🗑️ Hamleleri Temizle
                                </button>
                              </>
                            )}
                          </div>
                          
                          {isRecordingMoves && (
                            <div className={`mt-2 p-2 border rounded text-sm ${
                              isRecordingVariation 
                                ? 'bg-purple-50 border-purple-200' 
                                : 'bg-green-50 border-green-200'
                            }`}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${
                                  isRecordingVariation ? 'bg-purple-500' : 'bg-green-500'
                                }`}></div>
                                <span className={isRecordingVariation ? 'text-purple-700' : 'text-green-700'}>
                                  {isRecordingVariation 
                                    ? `Varyant kaydı aktif (Hamle ${currentVariationStartIndex + 1}'den itibaren)`
                                    : 'Ana hat kaydı aktif - Tahtada hamle yapın'
                                  }
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Puzzle Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Soru Başlığı
                      </label>
                      <input
                        type="text"
                        value={currentPuzzle.title || `Soru ${currentQuestion}`}
                        onChange={(e) => setCurrentPuzzle(prev => ({ 
                          ...prev, 
                          title: e.target.value 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder={`Soru ${currentQuestion}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hamle Sırası
                      </label>
                      <select
                        value={currentPuzzle.fen.includes(' w ') ? 'white' : 'black'}
                        onChange={(e) => {
                          const fenParts = currentPuzzle.fen.split(' ');
                          fenParts[1] = e.target.value === 'white' ? 'w' : 'b';
                          setCurrentPuzzle(prev => ({ 
                            ...prev, 
                            fen: fenParts.join(' ') 
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="white">Beyaz Oynar</option>
                        <option value="black">Siyah Oynar</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Ana Hat ({currentPuzzle.mainLine.length} hamle)
                        </label>
                        {currentPuzzle.mainLine.length > 0 && (
                          <button
                            onClick={clearMainLine}
                            className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            Temizle
                          </button>
                        )}
                      </div>
                      <div className="bg-gray-50 p-3 rounded border min-h-[100px] max-h-40 overflow-y-auto">
                        {currentPuzzle.mainLine.length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {currentPuzzle.mainLine.map((move, index) => (
                                <div key={index} className="relative group">
                                  <button
                                    onClick={() => navigateToMove(index + 1)}
                                    className={`px-2 py-1 rounded text-sm font-mono transition-colors ${
                                      currentMoveIndex > index 
                                        ? 'bg-blue-200 text-blue-900' 
                                        : 'bg-blue-100 text-blue-800 hover:bg-blue-150'
                                    }`}
                                    title={`${index + 1}. hamleye git`}
                                  >
                                    {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'} {move}
                                  </button>
                                  {!isRecordingVariation && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startVariationFromMove(index + 1);
                                      }}
                                      className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-green-600 transition-colors shadow-sm"
                                      title={`${move} yerine alternatif hamle gire`}
                                    >
                                      +
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            {isRecordingVariation && (
                              <div className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-green-700">
                                    🔀 Varyant kaydediliyor (Hamle {currentVariationStartIndex + 1}'den itibaren)
                                  </span>
                                  <button
                                    onClick={stopVariationRecording}
                                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                  >
                                    Bitir
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-600 bg-white p-2 rounded border font-mono">
                              <strong>PGN:</strong> {currentPuzzle.mainLine.join(' ')}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm text-center py-6">
                            {isRecordingMoves 
                              ? "Tahtada hamle yaparak ana hattı kaydedin" 
                              : "Henüz hamle eklenmedi"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Varyantlar ({currentPuzzle.variations.length})
                        </label>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border min-h-[80px] max-h-32 overflow-y-auto">
                        {currentPuzzle.variations.length > 0 ? (
                          <div className="space-y-2">
                            {currentPuzzle.variations.map((variation, index) => (
                              <div key={variation.id} className="bg-white p-2 rounded border">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-purple-700">
                                    {variation.title} (Hamle {variation.startMoveIndex + 1}'den)
                                  </span>
                                  <button
                                    onClick={() => deleteVariation(index)}
                                    className="text-xs px-1 py-0.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                  >
                                    ×
                                  </button>
                                </div>
                                <div className="text-xs font-mono text-gray-600">
                                  {variation.moves.length > 0 ? variation.moves.join(' ') : 'Boş varyant'}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm text-center py-4">
                            <div className="mb-1">Henüz varyant yok</div>
                            <div className="text-xs">Ana hattaki hamlelerin üzerine gelip "+" butonuna basın</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        FEN Pozisyonu
                        {currentMoveIndex < currentPuzzle.mainLine.length && (
                          <span className="text-xs text-gray-500 ml-2">
                            (Hamle {currentMoveIndex} pozisyonu)
                          </span>
                        )}
                      </label>
                      <textarea
                        value={displayFen}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs bg-gray-50"
                        rows={3}
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={saveCurrentPuzzle}
                        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                      >
                        ✓ Soruyu Kaydet
                      </button>
                      {questions.find(q => q.questionNumber === currentQuestion) && (
                        <div className="mt-2 text-center text-sm text-green-600">
                          ✓ Bu soru kaydedildi
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="text-sm text-gray-600 mb-2">
                        İlerleme: {questions.length} / {metadata.totalQuestions}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(questions.length / metadata.totalQuestions) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {questions.length >= metadata.totalQuestions ? (
                      <div className="pt-4">
                        <button
                          onClick={() => setCurrentStep(3)}
                          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          🎯 JSON Export
                        </button>
                      </div>
                    ) : (
                      <div className="pt-4">
                        <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-blue-800 text-sm">
                            <strong>{metadata.totalQuestions - questions.length}</strong> soru daha ekleyerek seti tamamlayın
                          </div>
                          <button
                            onClick={() => setCurrentStep(3)}
                            className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                          >
                            Kısmi Export
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ChessboardDnDProvider>
        )}

        {/* Step 3: Export */}
        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">JSON Export</h2>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  ← Sorulara Dön
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Puzzle Set Özeti</h3>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Smart Code:</span>
                        <span className="font-mono font-medium">{smartCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Başlık:</span>
                        <span className="font-medium">{metadata.setTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Toplam Soru:</span>
                        <span>{metadata.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tamamlanan:</span>
                        <span className={questions.length === metadata.totalQuestions ? 'text-green-600 font-medium' : 'text-orange-600'}>
                          {questions.length} / {metadata.totalQuestions}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taş Seti:</span>
                        <span>{pieceSets[metadata.pieceSet]}</span>
                      </div>
                      {metadata.nextSetId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sonraki Set:</span>
                          <span className="font-mono">{metadata.nextSetId}</span>
                        </div>
                      )}
                      {decodedInfo && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Konu:</span>
                            <span>{decodedInfo.topic}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Egzersiz Tipi:</span>
                            <span>{decodedInfo.exerciseType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Zorluk:</span>
                            <span>Seviye {decodedInfo.difficulty}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">Export İşlemleri</h3>
                    <button
                      onClick={downloadJsonFile}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      JSON Dosyası İndir
                    </button>
                    <button
                      onClick={copyJsonToClipboard}
                      className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Panoya Kopyala
                    </button>
                    {questions.length < metadata.totalQuestions && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.734 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-yellow-800 text-sm">
                            <strong>Uyarı:</strong> Henüz tüm sorular tamamlanmamış. 
                            {metadata.totalQuestions - questions.length} soru eksik.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Kaydedilen Sorular</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {questions.length > 0 ? (
                      <div className="space-y-3">
                        {questions
                          .sort((a, b) => a.questionNumber - b.questionNumber)
                          .map((question) => (
                          <div key={question.id} className="bg-white p-3 rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">
                                Soru {question.questionNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                {question.mainLine.length} hamle
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              {question.title}
                            </div>
                            {question.mainLine.length > 0 && (
                              <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                                {question.mainLine.join(' ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <div className="text-4xl mb-2">📝</div>
                        <div>Henüz soru kaydedilmemiş</div>
                        <div className="text-sm mt-1">
                          Önce sorular bölümünden puzzle'ları oluşturun
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 JSON Format Bilgisi</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>• <strong>Dosya adı:</strong> chessmino-{smartCode}-YYYY-MM-DD.json</div>
                  <div>• <strong>Format:</strong> ChessMino Puzzle Set v1.0</div>
                  <div>• <strong>İçerik:</strong> Metadata + Puzzle array + Smart naming data</div>
                  <div>• <strong>Kullanım:</strong> ChessMino uygulamasında içe aktarılabilir</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleEditorPage;