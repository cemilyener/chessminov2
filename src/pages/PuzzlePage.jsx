// src/pages/PuzzlePage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react'; // Add useRef
import { useParams, useNavigate } from 'react-router-dom';
import PuzzleLoader from '../utils/puzzle/PuzzleLoader';
import usePuzzleState from '../hooks/usePuzzleState';
import PuzzleBoard from '../components/puzzle/PuzzleBoard';
import PuzzleNavigation from '../components/puzzle/PuzzleNavigation'; // YENİ İMPORT
import { Chess } from 'chess.js';
import { playCorrectSound, playWrongSound, playCompletionSound } from '../utils/audioPlayer';

const PuzzlePage = ({ testMode = false }) => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [puzzleSet, setPuzzleSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const puzzleState = usePuzzleState(puzzleSet);

  const [boardKey, setBoardKey] = useState(0);

  const [hintLevel, setHintLevel] = useState(0);
  const [hintedMoveSan, setHintedMoveSan] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState({});

  // Basit progress tracking için
  const [completedPuzzles, setCompletedPuzzles] = useState([]);

  // Navigation için loading state ekle
  const [isNavigating, setIsNavigating] = useState(false);

  // YENİ: Navigation toggle state
  const [showNavigation, setShowNavigation] = useState(false);

  // YENİ: Navigation toggle handler - EKSIK OLAN FONKSİYON
  const toggleNavigation = () => {
    setShowNavigation(prev => !prev);
  };

  // YENİ: Right-click marking sistemi
  const [markedSquares, setMarkedSquares] = useState({});

  const resetHints = useCallback(() => { // Wrap in useCallback
    setHighlightedSquares({});
    setHintLevel(0);
    setHintedMoveSan(null);
  }, []); // No dependencies, so it's created once

  // YENİ: Right-click handler for marking squares
  const handleRightClick = useCallback((square) => {
    console.log('Right-clicked square:', square);
    
    setMarkedSquares(prev => {
      const newMarked = { ...prev };
      
      if (newMarked[square]) {
        // Remove marking if already marked
        delete newMarked[square];
      } else {
        // Add marking with purple background
        newMarked[square] = { backgroundColor: 'rgba(147, 51, 234, 0.4)' };
      }
      
      return newMarked;
    });
  }, []);

  // YENİ: Combine all square styles (hints + markings)
  const getCombinedSquareStyles = useCallback(() => {
    return {
      ...highlightedSquares, // Hint styles
      ...markedSquares       // Right-click marking styles
    };
  }, [highlightedSquares, markedSquares]);

  // Handle move from board
  const handleBoardMove = (moveData) => {
    console.log('Board move attempt:', moveData);
    resetHints(); // Reset hints on any move attempt
    const result = puzzleState.makeMove(moveData);
    
    // Visual feedback
    if (result) {
      console.log('✅ Move accepted!');
      // Doğru hamle sesini direkt burada çal
      playCorrectSound();
    } else {
      console.log('❌ Move rejected!');
      // Yanlış hamle sesini direkt burada çal
      playWrongSound();
      
      // Error feedback - board shake animation
      const boardElement = document.querySelector('.puzzle-board-container');
      if (boardElement) {
        boardElement.classList.add('shake-animation');
        setTimeout(() => {
          boardElement.classList.remove('shake-animation');
        }, 500);
      }
    }
    
    return result;
  };
  
  // Reset puzzle with board refresh
  const handleReset = () => {
    setBoardKey(prev => prev + 1); // Board'u yenile
    puzzleState.resetPuzzle();
    resetHints(); // Reset hints on puzzle reset
  };

  // Puzzle değiştirme handler'ı - GELİŞTİRİLMİŞ
  const handlePuzzleSelect = async (puzzleIndex) => {
    console.log('Puzzle selected:', puzzleIndex);
    
    // Puzzle status kontrolü
    const status = getPuzzleStatus(puzzleIndex);
    if (status === 'locked') {
      console.log('🔒 Puzzle is locked');
      return;
    }

    const currentIndex = puzzleState.currentPuzzleIndex;
    
    // Eğer zaten aynı puzzle'daysa hiçbir şey yapma
    if (puzzleIndex === currentIndex) {
      console.log('📍 Already on this puzzle');
      return;
    }

    // Navigation başladığında loading state'i aktif et
    setIsNavigating(true);
    
    // Kısa bir delay ekle (smooth transition için)
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      // nextPuzzle ve previousPuzzle fonksiyonlarını kullanarak navigasyon
      if (puzzleIndex > currentIndex) {
        // İleri git
        const steps = puzzleIndex - currentIndex;
        console.log(`➡️ Moving forward ${steps} steps`);
        for (let i = 0; i < steps; i++) {
          if (puzzleState.nextPuzzle) {
            puzzleState.nextPuzzle();
          }
        }
      } else {
        // Geri git
        const steps = currentIndex - puzzleIndex;
        console.log(`⬅️ Moving backward ${steps} steps`);
        for (let i = 0; i < steps; i++) {
          if (puzzleState.previousPuzzle) {
            puzzleState.previousPuzzle();
          }
        }
      }

      setBoardKey(prev => prev + 1); // Board'u yenile
      resetHints(); // Hint'leri sıfırla
      
      // Navigation tamamlandığında kısa bir delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } finally {
      // Loading state'i kapat
      setIsNavigating(false);
    }
  };

  // Puzzle status helper function (PuzzleNavigation'dan kopyalanan mantık)
  const getPuzzleStatus = (index) => {
    if (completedPuzzles.includes(index)) {
      return 'completed';
    }
    if (index === puzzleState.currentPuzzleIndex) {
      return 'current';
    }
    if (index <= puzzleState.currentPuzzleIndex + 1) { // Mevcut ve bir sonraki puzzle açık
      return 'available';
    }
    return 'locked';
  };

  useEffect(() => {
    const loadPuzzle = async () => {
      try {
        setLoading(true);
        setError(null);
        resetHints(); // Reset hints when loading new puzzle/set
        
        // Test mode için mock data
        if (testMode) {
          setPuzzleSet({
            id: 'test',
            title: 'Test Puzzle Set',
            puzzleCount: 1,
            puzzles: [{
              id: 'test_01',
              fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
              mainLine: []
            }]
          });
        } else {
          // Gerçek data yükle
          const data = await PuzzleLoader.loadPuzzleSet(setId);
          setPuzzleSet(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (setId || testMode) {
      loadPuzzle();
    }
  }, [setId, testMode, resetHints]); // Added resetHints to its own dependency array if it uses itself, or ensure it's stable. Given it's useCallback([], it's stable. Let's assume the original dependency for loadPuzzle was [setId, testMode, resetHints])

  // Effect for playing completion sound ONCE when puzzle transitions to complete
  const prevIsCompleteForSoundEffect = useRef(false); // Başlangıçta false olarak ayarla

  useEffect(() => {
    console.log(`[CompletionSoundEffect] Check: isComplete=${puzzleState.isComplete}, prevIsComplete=${prevIsCompleteForSoundEffect.current}, isAutoPlaying=${puzzleState.isAutoPlaying}`);

    // Önce ses kontrolü yap
    if (puzzleState.isComplete && !prevIsCompleteForSoundEffect.current && !puzzleState.isAutoPlaying) {
      console.log('🎯 Puzzle complete, playing completion sound with delay...');
      // Tamamlama sesini 600ms gecikme ile çal (correct sesinden sonra)
      setTimeout(() => {
        playCompletionSound();
      }, 600);
    }
    
    // Sonra ref'i güncelle (bir sonraki render için)
    prevIsCompleteForSoundEffect.current = puzzleState.isComplete;
  }, [puzzleState.isComplete, puzzleState.isAutoPlaying]);

  // Effect for auto-advancing
  useEffect(() => {
    let timerId = null;
    if (puzzleState.isComplete && !puzzleState.isAutoPlaying) {
      console.log('🔄 Preparing auto-advance timer because puzzle is complete.');
      timerId = setTimeout(() => {
        console.log('⏰ Auto-advance timer fired.');
        resetHints();
        if (puzzleState.currentPuzzleIndex < puzzleState.totalPuzzles - 1) {
          console.log('➡️ Auto-advancing to next puzzle');
          puzzleState.nextPuzzle();
        } else {
          console.log('🏁 All puzzles in the set are completed!');
          alert('🏆 Congratulations! All puzzles completed!');
          navigate('/');
        }
      }, 2000); // 2-second delay
    }
    return () => {
      if (timerId) {
        console.log('🧹 Clearing auto-advance timer for puzzlePage.');
        clearTimeout(timerId);
      }
    };
  }, [
    puzzleState.isComplete,
    puzzleState.isAutoPlaying,
    puzzleState.currentPuzzleIndex,
    puzzleState.totalPuzzles,
    puzzleState.nextPuzzle,
    navigate,
    resetHints
  ]);

  const handleHintClick = () => {
    if (!puzzleState.expectedMoves || puzzleState.expectedMoves.length === 0 || puzzleState.isComplete) {
      resetHints();
      return;
    }

    const currentExpectedSan = puzzleState.expectedMoves[0].move;
    // Create a temporary game instance to validate/get move details
    // Ensure puzzleState.boardPosition is the FEN of the current board
    const tempGame = new Chess(puzzleState.boardPosition);
    const possibleMoves = tempGame.moves({ verbose: true });
    const moveDetails = possibleMoves.find(m => m.san === currentExpectedSan);

    if (!moveDetails) {
      console.warn('Could not find details for expected move:', currentExpectedSan);
      resetHints();
      return;
    }

    let newLevel = hintLevel;
    let newSquares = { ...highlightedSquares };

    // If the expected move has changed, or we've already shown full hint, reset to stage 1 for current move
    if (hintedMoveSan !== currentExpectedSan || hintLevel === 2) {
      newSquares = { [moveDetails.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } }; // Hint source (yellowish)
      newLevel = 1;
    } else if (hintLevel === 0) { // First hint for this move
      newSquares = { [moveDetails.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } };
      newLevel = 1;
    } else if (hintLevel === 1) { // Second hint for this move (show target)
      newSquares = {
        ...newSquares, // Keep source highlight
        [moveDetails.to]: { backgroundColor: 'rgba(144, 238, 144, 0.5)' } // Hint target (greenish)
      };
      newLevel = 2;
    }

    setHighlightedSquares(newSquares);
    setHintLevel(newLevel);
    setHintedMoveSan(currentExpectedSan);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">♟️</div>
          <div>Puzzle yükleniyor...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <div className="text-red-600">{error}</div>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }
  // Success state - Main puzzle interface
  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="max-w-4xl mx-auto">
        {/* YENİ: Compact Header - Mobile Optimized */}
        <div className="text-center mb-2 md:mb-6">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
            {puzzleSet?.title || 'Puzzle Çözücü'}
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Puzzle {puzzleState.currentPuzzleIndex + 1} / {puzzleState.totalPuzzles}
          </p>
        </div>

        {/* BOARD COMPONENT - Enhanced for Mobile */}
        <div className="bg-white rounded-lg shadow p-2 md:p-4 mb-2 md:mb-4 relative">
          {/* Navigation Loading Overlay */}
          {isNavigating && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="text-center">
                <div className="animate-spin text-3xl mb-2">♟️</div>
                <div className="text-gray-600">Puzzle yükleniyor...</div>
              </div>
            </div>
          )}
          
          <div className={`flex justify-center transition-opacity duration-300 ${isNavigating ? 'opacity-0' : 'opacity-100'}`}>
            <PuzzleBoard
              position={puzzleState.boardPosition}
              onMove={handleBoardMove}
              onRightClick={handleRightClick}
              boardWidth={typeof window !== 'undefined' ? Math.min(window.innerWidth - 40, 500) : 500}
              orientation="white"
              customSquareStyles={getCombinedSquareStyles()}
              key={boardKey}
              disabled={isNavigating}
            />
          </div>
        </div>

        {/* YENİ: Collapsible Navigation Grid - TAHTANIN ALTINA TAŞINDI */}
        {showNavigation && (
          <div className="mb-4 md:mb-6 bg-white rounded-lg shadow p-3 md:p-4 animate-slideDown">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Puzzle Listesi</h3>
              <button
                onClick={toggleNavigation}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Kapat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PuzzleNavigation
              puzzles={puzzleSet?.puzzles || []}
              currentIndex={puzzleState.currentPuzzleIndex}
              onPuzzleSelect={handlePuzzleSelect}
              completedPuzzles={completedPuzzles}
              disabled={isNavigating}
              className="compact"
            />
          </div>
        )}

        {/* YENİ: Compact Controls - Mobile First */}
        <div className="bg-white rounded-lg shadow p-2 md:p-4">
          {/* Navigation Toggle & Main Controls */}
          <div className="flex justify-center items-center gap-2 mb-3">
            {/* Navigation Toggle Button */}
            <button
              onClick={toggleNavigation}
              className={`p-2 rounded-lg transition-colors ${
                showNavigation 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              title={showNavigation ? "Puzzle Listesini Kapat" : "Puzzle Listesini Aç"}
            >
              {showNavigation ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Previous Button */}
            <button
              onClick={puzzleState.previousPuzzle}
              disabled={puzzleState.currentPuzzleIndex === 0 || isNavigating}
              className="p-2 bg-gray-500 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors"
              title="Önceki Puzzle"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Hint Button */}
            <button
              onClick={handleHintClick}
              disabled={!puzzleState.expectedMoves || puzzleState.expectedMoves.length === 0 || puzzleState.isComplete || isNavigating}
              className="p-2 bg-green-500 text-white rounded-lg disabled:opacity-50 hover:bg-green-600 transition-colors"
              title="İpucu"
            >
              💡
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              disabled={isNavigating}
              className="p-2 bg-yellow-500 text-white rounded-lg disabled:opacity-50 hover:bg-yellow-600 transition-colors"
              title="Yeniden Başlat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={puzzleState.nextPuzzle}
              disabled={puzzleState.currentPuzzleIndex === puzzleState.totalPuzzles - 1 || isNavigating}
              className="p-2 bg-gray-500 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors"
              title="Sonraki Puzzle"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Move Info - Compact */}
          <div className="text-center">
            <div className="text-sm md:text-lg font-medium">
              Expected: <span className="text-blue-600">
                {puzzleState.expectedMoves?.[0]?.move || 'Hesaplanıyor...'}
              </span>
            </div>
            
            {puzzleState.lastMoveResult && (
              <div className={`text-sm mt-1 ${
                puzzleState.lastMoveResult === 'correct' ? 'text-green-600' : 'text-red-600'
              }`}>
                {puzzleState.lastMoveResult === 'correct' ? '✅ Doğru!' : '❌ Yanlış'}
              </div>
            )}

            {/* YENİ: Marked squares counter */}
            {Object.keys(markedSquares).length > 0 && (
              <div className="text-xs text-purple-600 mt-1">
                📍 {Object.keys(markedSquares).length} kare işaretli
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzlePage;



