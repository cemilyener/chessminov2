import React from 'react';
import '../../styles/PuzzleNavigation.css';

const PuzzleNavigation = ({ 
  puzzles = [], 
  currentIndex = 0, 
  onPuzzleSelect = () => {},
  completedPuzzles = [],
  disabled = false, // YENİ PROP
  className = ""
}) => {
  
  // Puzzle status'unu belirle
  const getPuzzleStatus = (index) => {
    if (completedPuzzles.includes(index)) {
      return 'completed';
    }
    if (index === currentIndex) {
      return 'current';
    }
    if (index <= currentIndex + 1) { // Mevcut ve bir sonraki puzzle açık
      return 'available';
    }
    return 'locked';
  };

  // Click handler - disabled kontrolü ekle
  const handlePuzzleClick = (index) => {
    if (disabled) return; // Navigation sırasında click'i engelle
    
    const status = getPuzzleStatus(index);
    if (status !== 'locked') {
      onPuzzleSelect(index);
    }
  };

  return (
    <div className={`puzzle-navigation ${className} ${disabled ? 'puzzle-navigation--disabled' : ''}`}>
      <div className="puzzle-grid">
        {Array.from({ length: 18 }, (_, index) => {
          const status = getPuzzleStatus(index);
          const puzzle = puzzles[index];
          
          return (
            <button
              key={index}
              className={`puzzle-cell puzzle-cell--${status} ${disabled ? 'puzzle-cell--navigating' : ''}`}
              onClick={() => handlePuzzleClick(index)}
              disabled={status === 'locked' || disabled} // disabled prop'u ekle
              title={puzzle?.title || `Puzzle ${index + 1}`}
            >
              <span className="puzzle-number">{index + 1}</span>
              {status === 'completed' && (
                <span className="puzzle-checkmark">✓</span>
              )}
              {status === 'current' && (
                <span className="puzzle-indicator">•</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PuzzleNavigation;