import React, { useState } from 'react';
import { ExtendedChess } from '../../utils/ExtendedChess';

const calculateFenForMoves = (startFen, moves) => {
  if (!moves || moves.length === 0) return [];
  
  console.log('📊 calculateFenForMoves input:', {
    startFen,
    moves,
    movesTypes: moves.map(m => typeof m)
  });
    try {
    // CRITICAL: Determine if we need ExtendedChess
    const hasKings = startFen.includes('K') && startFen.includes('k');
    const chess = hasKings ? 
      new ExtendedChess(startFen) : 
      new ExtendedChess(startFen, { bypass: [10] });
    
    console.log('📊 Using chess engine:', hasKings ? 'ExtendedChess (normal)' : 'ExtendedChess (bypass)');
    
    return moves.map((move, index) => {
      // Ensure we're working with string
      const moveString = typeof move === 'string' ? move : (move.move || move);
      
      console.log(`📊 Processing move ${index}:`, moveString);
      
      try {
        const result = chess.move(moveString);
        
        if (!result) {
          console.error('❌ Failed move:', moveString, 'at FEN:', chess.fen());
          return {
            move: moveString,
            fen: chess.fen(),
            isLast: index === moves.length - 1
          };
        }
        
        const newFen = chess.fen();
        console.log(`✅ Move ${index} (${result.san}) -> FEN: ${newFen}`);
        
        return {
          move: result.san,
          fen: newFen,
          isLast: index === moves.length - 1
        };
      } catch (moveError) {
        console.error('❌ Move error:', moveError, 'for move:', moveString);
        return {
          move: moveString,
          fen: chess.fen(),
          isLast: index === moves.length - 1
        };
      }
    });
  } catch (error) {
    console.error('❌ Chess init error:', error);
    return moves.map((move, index) => ({
      move: typeof move === 'string' ? move : (move.move || move),
      fen: startFen,
      isLast: index === moves.length - 1
    }));
  }
};

const generateNextSetId = (currentId) => {
  const match = currentId.match(/(\d+)(\w+)(\d+)/);
  if (match) {
    const [, prefix, middle, suffix] = match;
    const nextPrefix = String(parseInt(prefix) + 1).padStart(3, '0');
    return `${nextPrefix}${middle}${suffix}`;
  }
  return `${currentId}_next`;
};

const SimplePuzzleCreator = ({ puzzleSet, onNext, onPrevious }) => {
  const [exportedData, setExportedData] = useState(null);

  // Move formatExportData INSIDE the component to access puzzleSet
  const formatExportData = () => {
    console.log('🎯 formatExportData called with puzzleSet:', puzzleSet);
    
    const formattedPuzzles = puzzleSet.puzzles.map((puzzle, index) => {
      const puzzleId = `${puzzleSet.id}_${String(index + 1).padStart(2, '0')}`;
      const fenToUse = puzzle.startingFen || puzzle.fen;
      
      console.log(`🎯 Formatting Puzzle ${index}:`, {
        puzzleId,
        fenToUse,
        mainLine: puzzle.mainLine,
        alternatives: puzzle.alternatives
      });
      
      // Process main line
      const mainLine = calculateFenForMoves(fenToUse, puzzle.mainLine);
      
      // Process alternatives with CORRECT starting FEN
      const alternatives = (puzzle.alternatives || []).map((alt, altIndex) => {
        // CRITICAL: Calculate correct starting FEN for variant
        let variantStartFen = fenToUse; // Default to puzzle start
        
        if (alt.parentMoveIndex > 0) {
          // If variant starts after some moves, calculate the FEN at that position
          try {
            const tempChess = new ExtendedChess(fenToUse, { bypass: [10] });
            
            // Play moves up to the variant start point
            for (let i = 0; i < alt.parentMoveIndex && i < puzzle.mainLine.length; i++) {
              const move = puzzle.mainLine[i];
              const moveString = typeof move === 'string' ? move : move.move;
              const result = tempChess.move(moveString);
              if (!result) {
                console.error(`❌ Failed to calculate variant start FEN at move ${i}: ${moveString}`);
                break;
              }
            }
            
            variantStartFen = tempChess.fen();
            console.log(`🎯 Variant ${alt.name} starts from FEN:`, variantStartFen);
          } catch (error) {
            console.error('❌ Error calculating variant start FEN:', error);
            variantStartFen = fenToUse; // Fallback
          }
        }
        
        return {
          name: alt.name || `variant_${String.fromCharCode(97 + altIndex)}`,
          parentVariant: alt.parentVariant || "main",
          parentMoveIndex: alt.parentMoveIndex || 0,
          moves: calculateFenForMoves(variantStartFen, alt.moves) // ✅ Use correct start FEN
        };
      });

      return {
        id: puzzleId,
        index: index + 1,
        fen: fenToUse,
        mainLine: mainLine,
        alternatives: alternatives
      };
    });

    return {
      id: puzzleSet.id,
      pieceSet: puzzleSet.pieceSet || "merida",
      nextSetId: puzzleSet.nextSetId || generateNextSetId(puzzleSet.id),
      puzzles: formattedPuzzles,
      puzzleCount: formattedPuzzles.length
    };
  };

  const handleTestExport = () => {
    console.log('🧪 Testing export function...');
    console.log('🧪 Current puzzleSet:', puzzleSet);
    
    if (puzzleSet.puzzles.length === 0) {
      console.log('❌ No puzzles to export');
      return;
    }
    
    const result = formatExportData();
    console.log('🧪 Export result:', result);
    setExportedData(result);
  };

  const handleExportJSON = () => {
    const data = formatExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${puzzleSet.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="puzzle-creator">
      <h2>Puzzle Creator</h2>
      
      <div className="puzzle-info">
        <p>Current Set: {puzzleSet.id}</p>
        <p>Puzzles Created: {puzzleSet.puzzles.length}</p>
      </div>

      <div className="controls">
        <button onClick={handleTestExport} className="test-export-btn">
          🧪 Test Export (Debug)
        </button>
        
        <button onClick={handleExportJSON} className="export-btn">
          📁 Export JSON
        </button>
        
        {onPrevious && (
          <button onClick={onPrevious} className="nav-btn">
            ← Previous
          </button>
        )}
        
        {onNext && (
          <button onClick={onNext} className="nav-btn">
            Next →
          </button>
        )}
      </div>

      {exportedData && (
        <div className="export-preview">
          <h3>Export Preview (Check Console for Details)</h3>
          <pre>{JSON.stringify(exportedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SimplePuzzleCreator;