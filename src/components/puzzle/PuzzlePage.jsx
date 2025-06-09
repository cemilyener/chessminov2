import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PuzzleLoader from '../utils/puzzle/PuzzleLoader';
import usePuzzleState from '../hooks/usePuzzleState';
import PuzzleBoard from '../components/puzzle/PuzzleBoard';

const PuzzlePage = ({ testMode = false }) => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [puzzleSet, setPuzzleSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boardKey, setBoardKey] = useState(0);
  
  // Puzzle state hook
  const puzzleState = usePuzzleState(puzzleSet);

  // ⭐ DEBUG: Track puzzle transitions
  useEffect(() => {
    if (puzzleState.currentPuzzle) {
      console.log('📋 PUZZLE CHANGED:', {
        id: puzzleState.currentPuzzle.id,
        fen: puzzleState.currentPuzzle.fen,
        turn: puzzleState.currentPuzzle.fen.split(' ')[1],
        firstMove: puzzleState.currentPuzzle.mainLine[0]?.move,
        isWaitingForUser: puzzleState.isWaitingForUser
      });
    }
  }, [puzzleState]);

  // Auto-advance when puzzle complete
  useEffect(() => {
    if (puzzleState.isComplete && !puzzleState.isAutoPlaying) {
      const timer = setTimeout(() => {
        if (puzzleState.currentPuzzleIndex < puzzleState.totalPuzzles - 1) {
          puzzleState.nextPuzzle();
        } else {
          // All puzzles complete
          setTimeout(() => {
            alert('🏆 Congratulations! All puzzles completed!');
            navigate('/'); // Navigate home
          }, 1000);
        }
      }, 2000); // 2 second delay to show completion
      
      return () => clearTimeout(timer);
    }
  }, [puzzleState.isComplete, puzzleState.isAutoPlaying, puzzleState.currentPuzzleIndex, puzzleState.totalPuzzles, puzzleState.nextPuzzle, navigate]);

  // Handle board move
  const handleBoardMove = (moveData) => {
    const result = puzzleState.makeMove(moveData);
    
    // Visual feedback
    if (result) {
      console.log('✅ Move accepted!');
      // Success feedback can be added here
    } else {
      console.log('❌ Move rejected!');
      
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
    setBoardKey(prev => prev + 1); // Board refresh
    puzzleState.resetPuzzle();
  };

  // Load puzzle set
  useEffect(() => {
    const loadPuzzle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (testMode) {
          // Test mode with mock data
          setPuzzleSet({
            id: 'test',
            title: 'Test Puzzle Set',
            puzzleCount: 1,
            puzzles: [{
              id: 'test_01',
              fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
              mainLine: [
                { move: 'e4', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', isLast: false },
                { move: 'e5', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2', isLast: true }
              ],
              alternatives: []
            }]
          });
        } else {
          // Real data loading
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
  }, [setId, testMode]);

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

  // Dynamic move info with auto-play support
  const getMoveInfo = () => {
    if (puzzleState.isAutoPlaying) {
      return (
        <div className="text-lg font-medium text-gray-600">
          <span className="inline-block animate-pulse">🤖 Computer thinking...</span>
        </div>
      );
    }
    
    if (puzzleState.isComplete) {
      return (
        <div className="text-lg font-medium text-green-600">
          ✅ Puzzle Complete! 
          {puzzleState.currentPuzzleIndex < puzzleState.totalPuzzles - 1 && (
            <span className="text-sm block">Next puzzle in 2 seconds...</span>
          )}
        </div>
      );
    }
    
    if (!puzzleState.isWaitingForUser) {
      return (
        <div className="text-lg font-medium text-orange-600">
          ⏳ Waiting for computer move...
        </div>
      );
    }
    
    const nextMove = puzzleState.expectedMoves[0];
    return (
      <div className="text-lg font-medium">
        Expected Move: <span className="text-blue-600">
          {nextMove?.move || 'Loading...'}
        </span>
      </div>
    );
  };

  // Success state - Main puzzle interface
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {puzzleSet?.smartCode || puzzleSet?.id} - Puzzle {puzzleState.currentPuzzleIndex + 1}/{puzzleState.totalPuzzles}
          </h1>
          <div className="text-sm text-gray-600">
            Moves played: {puzzleState.moveHistory.length}
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Board */}
          <div className="flex-1 flex justify-center">
            <PuzzleBoard
              position={puzzleState.boardPosition}
              onMove={handleBoardMove}
              boardWidth={Math.min(500, window.innerWidth - 100)}
              boardKey={boardKey}
            />
          </div>

          {/* Info panel */}
          <div className="lg:w-80 space-y-4">
            {/* Move info */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold mb-2">Move Status</h3>
              {getMoveInfo()}
              <div className="text-sm text-gray-600 mt-2">
                {puzzleState.isWaitingForUser && !puzzleState.isComplete && 
                  'Your turn - Click or drag pieces to move'}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold mb-3">Controls</h3>
              <div className="space-y-2">
                <button 
                  onClick={handleReset}
                  disabled={puzzleState.isAutoPlaying}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  🔄 Reset Puzzle
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  🏠 Home
                </button>
              </div>
            </div>

            {/* Move history */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold mb-2">Move History</h3>
              <div className="text-sm space-y-1">
                {puzzleState.moveHistory.map((move, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{Math.floor(index / 2) + 1}.</span>
                    <span>{move}</span>
                  </div>
                ))}
                {puzzleState.moveHistory.length === 0 && (
                  <div className="text-gray-500 italic">No moves yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzlePage;