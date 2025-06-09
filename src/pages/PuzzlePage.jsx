// src/pages/PuzzlePage.jsx
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
  // YENİ: Puzzle state hook
  const puzzleState = usePuzzleState(puzzleSet);

  // Board key for reset (flash fix)
  const [boardKey, setBoardKey] = useState(0);
  
  // Handle move from board
  const handleBoardMove = (moveData) => {
    console.log('Board move attempt:', moveData);
    
    const result = puzzleState.makeMove(moveData);
    
    // Visual feedback
    if (result) {
      console.log('✅ Move accepted!');
      
      // Success feedback eklenebilir
      if (puzzleState.isComplete) {
        setTimeout(() => {
          alert('🎉 Puzzle Complete! Well done!');
          // Auto advance to next puzzle
          if (puzzleState.currentPuzzleIndex < puzzleState.totalPuzzles - 1) {
            setTimeout(() => {
              puzzleState.nextPuzzle();
            }, 1000);
          }
        }, 500);
      }
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
    setBoardKey(prev => prev + 1); // Board'u yenile
    puzzleState.resetPuzzle();
  };

  useEffect(() => {
    const loadPuzzle = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
  }, [setId, testMode]);

  // Auto-advance to next puzzle when complete
  useEffect(() => {
    if (puzzleState.isComplete && !puzzleState.isAutoPlaying) {
      console.log('🎯 Puzzle complete, preparing auto-advance...');
      
      const timer = setTimeout(() => {
        if (puzzleState.currentPuzzleIndex < puzzleState.totalPuzzles - 1) {
          console.log('➡️ Auto-advancing to next puzzle');
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
  // Success state
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h1 className="text-2xl font-bold mb-2">
            {puzzleSet.title || `Puzzle Set: ${setId}`}
          </h1>
          <div className="text-sm text-gray-600">
            Puzzle {puzzleState.currentPuzzleIndex + 1} / {puzzleState.totalPuzzles}
          </div>
        </div>
          {/* Debug Panel - Enhanced */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-semibold mb-2">🔍 Puzzle State Debug:</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div>Current Puzzle: {puzzleState.currentPuzzle?.id}</div>
              <div>Move Index: {puzzleState.currentMoveIndex}</div>
              <div>Is Complete: {puzzleState.isComplete ? '✅' : '❌'}</div>
            </div>
            <div>
              <div>Expected Moves: {puzzleState.expectedMoves.map(m => m.move).join(', ')}</div>
              <div>Board FEN: {puzzleState.boardPosition.split(' ')[0]}</div>
              <div>Last Result: {puzzleState.lastMoveResult || 'none'}</div>
            </div>
          </div>
        </div>
        
        {/* BOARD COMPONENT - YENİ */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex justify-center">
            <PuzzleBoard
              position={puzzleState.boardPosition}
              onMove={handleBoardMove}
              boardWidth={500}
              orientation="white"
              key={boardKey}
            />
          </div>
          
          {/* Move Info */}
          <div className="mt-4 text-center">
            <div className="text-lg font-medium">
              Expected Move: <span className="text-blue-600">
                {puzzleState.expectedMoves[0]?.move || 'Puzzle Complete!'}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Click or drag pieces to make moves
            </div>
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex gap-2 justify-center">
          <button 
            onClick={puzzleState.previousPuzzle}
            disabled={puzzleState.currentPuzzleIndex === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            ← Previous
          </button>
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Reset
          </button>
          <button 
            onClick={puzzleState.nextPuzzle}
            disabled={puzzleState.currentPuzzleIndex >= puzzleState.totalPuzzles - 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PuzzlePage;