// src/utils/puzzle/MoveValidator.js - Advanced move validation
import { Chess } from 'chess.js';

class MoveValidator {
  /**
   * Validates a move against expected moves
   * @param {Chess} game - Current game instance
   * @param {Object} moveData - Move data {from, to, promotion}
   * @param {Array} expectedMoves - Array of expected moves
   * @returns {Object} Validation result
   */
  static validateMove(game, moveData, expectedMoves) {
    try {
      // Pre-validate move format
      if (!moveData.from || !moveData.to) {
        return { 
          valid: false, 
          reason: 'Invalid move format',
          error: 'Missing from/to squares'
        };
      }

      // Create test game to validate move
      const testGame = new Chess(game.fen());
      
      // Test if move is legal
      const testMove = testGame.move({
        from: moveData.from,
        to: moveData.to,
        promotion: moveData.promotion || 'q'
      });

      if (!testMove) {
        return { 
          valid: false, 
          reason: 'Illegal move',
          error: `Cannot move from ${moveData.from} to ${moveData.to}`
        };
      }

      // Check against expected moves
      const matchedMove = expectedMoves.find(em => em.move === testMove.san);
      
      if (matchedMove) {
        return {
          valid: true,
          move: testMove,
          san: testMove.san,
          matchedMove,
          reason: `Correct ${matchedMove.type} move`
        };
      } else {
        return {
          valid: false,
          move: testMove,
          san: testMove.san,
          reason: 'Wrong move',
          expected: expectedMoves.map(em => em.move)
        };
      }

    } catch (error) {
      console.error('Move validation error:', error);
      return { 
        valid: false, 
        reason: 'Validation error',
        error: error.message 
      };
    }
  }

  /**
   * Get legal moves for current position
   * @param {Chess} game - Current game instance
   * @returns {Array} Array of legal moves
   */
  static getLegalMoves(game) {
    try {
      return game.moves({ verbose: true });
    } catch (error) {
      console.error('Error getting legal moves:', error);
      return [];
    }
  }
}

export default MoveValidator;