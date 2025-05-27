import { Chess } from 'chess.js';
import { ExtendedChess } from '../utils/chess/ExtendedChess.js';

/**
 * Creates a chess instance based on FEN validity
 * @param {string} fen - FEN string
 * @returns {Chess|ExtendedChess} - Chess instance
 */
export const createChessInstance = (fen) => {
  try {
    // Check if FEN has both kings
    const hasKings = fen.includes('K') && fen.includes('k');
    
    if (hasKings) {
      // Try with regular Chess.js first
      return new Chess(fen);
    } else {
      // Use ExtendedChess for positions without both kings
      return new ExtendedChess(fen, { bypass: [10] });
    }
  } catch (error) {
    console.warn('FEN load failed, using ExtendedChess:', error);
    return new ExtendedChess(fen, { bypass: [10] });
  }
};

/**
 * Validates if a FEN string is valid
 * @param {string} fen - FEN string to validate
 * @returns {boolean} - True if valid
 */
export const isValidFen = (fen) => {
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
};

/**
 * Gets the default starting position
 * @returns {string} - Default FEN
 */
export const getDefaultFen = () => {
  return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
};

/**
 * Gets an empty board FEN
 * @returns {string} - Empty board FEN
 */
export const getEmptyBoardFen = () => {
  return '8/8/8/8/8/8/8/8 w - - 0 1';
};