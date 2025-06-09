// src/utils/chess/SANParser.js - ENHANCED DEBUG + FIX
import { Chess } from 'chess.js';

/**
 * SAN notation'ı move object'e çevirir
 * @param {string} san - SAN notation (örn: "Bxd7", "Qd4+")
 * @param {Chess} game - Current chess instance
 * @returns {Object|null} - Move object veya null
 */
export function parseSANtoMoveObject(san, game) {
  if (!san || !game) {
    console.warn('❌ parseSANtoMoveObject: Invalid parameters');
    return null;
  }

  try {
    // Get all legal moves in verbose format
    const legalMoves = game.moves({ verbose: true });
    
    console.log('🔍 SAN Parser - Enhanced Debug:');
    console.log('├── Position FEN:', game.fen());
    console.log('├── Target SAN:', san);
    console.log('├── Legal moves count:', legalMoves.length);
    console.log('├── All legal moves:', legalMoves.map(m => m.san));
    
    // ⭐ ENHANCED: Case-insensitive direct match
    const matchingMove = legalMoves.find(move => 
      move.san.toLowerCase() === san.toLowerCase()
    );
    
    if (matchingMove) {
      console.log('✅ Direct SAN match found:', matchingMove);
      return {
        from: matchingMove.from,
        to: matchingMove.to,
        promotion: matchingMove.promotion || undefined
      };
    }

    // ⭐ ENHANCED: Try exact piece matching first
    console.log('🔍 Direct match failed, analyzing move...');
    
    // Check if any legal move matches the pattern
    const movePattern = san.replace(/[+#]$/, ''); // Remove check/mate symbols
    
    if (movePattern.includes('x')) {
      // Capture move
      const captures = legalMoves.filter(m => m.captured);
      console.log('🎯 Available captures:', captures.map(m => `${m.san} (${m.from}->${m.to})`));
      
      // Try to match capture pattern
      const targetSquare = movePattern.split('x')[1];
      const pieceType = movePattern.split('x')[0];
      
      console.log('├── Target square:', targetSquare);
      console.log('├── Piece pattern:', pieceType);
      
      const captureMatches = captures.filter(m => {
        const matchesTarget = m.to === targetSquare;
        const matchesPiece = pieceType.length === 1 ? 
          m.piece.toUpperCase() === pieceType.toUpperCase() :
          m.from[0] === pieceType[0]; // File capture (e.g., exf6)
        
        console.log(`├── Checking ${m.san}: target=${matchesTarget}, piece=${matchesPiece}`);
        return matchesTarget && matchesPiece;
      });
      
      console.log('├── Capture matches:', captureMatches.length);
      
      if (captureMatches.length > 0) {
        const chosen = captureMatches[0];
        console.log('✅ Capture match found:', chosen);
        return {
          from: chosen.from,
          to: chosen.to,
          promotion: chosen.promotion || undefined
        };
      }
    }

    // ⭐ FALLBACK: Advanced manual parsing
    return parseAmbiguousSAN(san, legalMoves);
    
  } catch (error) {
    console.error('❌ SAN parsing error:', error);
    return null;
  }
}

/**
 * ⭐ ENHANCED: Belirsiz SAN notation'ları çözer
 */
function parseAmbiguousSAN(san, legalMoves) {
  const cleanSan = san.replace(/[+#]$/, '');
  
  console.log('🧩 Enhanced Ambiguous SAN Parsing:');
  console.log('├── Clean SAN:', cleanSan);
  console.log('├── Available moves:', legalMoves.map(m => m.san));
  
  // ⭐ ENHANCED: Special handling for different move types
  
  // 1. Castling
  if (cleanSan === 'O-O' || cleanSan === 'O-O-O') {
    const castleMove = legalMoves.find(move => move.san === cleanSan);
    if (castleMove) {
      console.log('✅ Castling move found:', castleMove);
      return {
        from: castleMove.from,
        to: castleMove.to
      };
    }
  }
  
  // 2. ⭐ ENHANCED: Capture moves with better logic
  if (cleanSan.includes('x')) {
    const parts = cleanSan.split('x');
    const piece = parts[0];
    const target = parts[1];
    
    console.log('🎯 Enhanced capture analysis:');
    console.log('├── Piece part:', piece);
    console.log('├── Target part:', target);
    
    const candidates = legalMoves.filter(move => {
      if (!move.captured) return false;
      if (move.to !== target) return false;
      
      // ⭐ ENHANCED: Better piece matching
      if (piece.length === 1) {
        // Simple piece: Bxd7, Nxf6
        const matches = move.piece.toUpperCase() === piece.toUpperCase();
        console.log(`├── Checking ${move.san}: piece ${move.piece} vs ${piece} = ${matches}`);
        return matches;
      } else if (piece.length === 2) {
        // Disambiguated: Nbd7, R1a3
        const firstChar = piece[0];
        if (firstChar >= 'a' && firstChar <= 'h') {
          // File disambiguation: exf6
          const matches = move.from[0] === firstChar;
          console.log(`├── Checking ${move.san}: file ${move.from[0]} vs ${firstChar} = ${matches}`);
          return matches;
        } else if (firstChar >= '1' && firstChar <= '8') {
          // Rank disambiguation: R1a3
          const matches = move.from[1] === firstChar;
          console.log(`├── Checking ${move.san}: rank ${move.from[1]} vs ${firstChar} = ${matches}`);
          return matches;
        } else {
          // Piece + file: Nbd7
          const pieceMatches = move.piece.toUpperCase() === firstChar.toUpperCase();
          const fileMatches = move.from[0] === piece[1];
          const matches = pieceMatches && fileMatches;
          console.log(`├── Checking ${move.san}: piece+file ${move.piece}${move.from[0]} vs ${piece} = ${matches}`);
          return matches;
        }
      }
      
      return false;
    });
    
    console.log('├── Capture candidates found:', candidates.length);
    candidates.forEach(c => console.log(`│   ${c.san}: ${c.from} → ${c.to}`));
    
    if (candidates.length > 0) {
      const chosen = candidates[0];
      console.log('✅ Enhanced capture candidate chosen:', chosen);
      return {
        from: chosen.from,
        to: chosen.to,
        promotion: chosen.promotion
      };
    }
  }
  
  // 3. ⭐ ENHANCED: Regular moves
  const target = cleanSan.slice(-2);
  const piece = cleanSan[0];
  
  console.log('🎯 Enhanced regular move analysis:');
  console.log('├── Target square:', target);
  console.log('├── Piece:', piece);
  
  const candidates = legalMoves.filter(move => {
    if (move.captured) return false;
    if (move.to !== target) return false;
    
    if (piece === piece.toUpperCase() && piece !== piece.toLowerCase()) {
      // Piece move: Bd7, Qd4
      const matches = move.piece.toUpperCase() === piece;
      console.log(`├── Checking ${move.san}: piece ${move.piece} vs ${piece} = ${matches}`);
      return matches;
    } else {
      // Pawn move: e4, d5
      const matches = move.piece === 'p' && move.to === cleanSan;
      console.log(`├── Checking ${move.san}: pawn to ${move.to} vs ${cleanSan} = ${matches}`);
      return matches;
    }
  });
  
  console.log('├── Regular move candidates:', candidates.length);
  candidates.forEach(c => console.log(`│   ${c.san}: ${c.from} → ${c.to}`));
  
  if (candidates.length > 0) {
    const chosen = candidates[0];
    console.log('✅ Enhanced regular candidate chosen:', chosen);
    return {
      from: chosen.from,
      to: chosen.to,
      promotion: chosen.promotion
    };
  }
  
  console.error('❌ Enhanced parsing failed for:', san);
  console.error('├── No candidates found in any category');
  console.error('└── Available legal moves:', legalMoves.map(m => m.san).join(', '));
  
  return null;
}

/**
 * ⭐ NEW: Test specific position
 */
export function testSpecificPosition() {
  console.log('🧪 Testing Specific Position - 012fc3_01');
  
  const startFen = "7k/3P4/2b3P1/3P3P/P7/5P2/2P3P1/4K3 b - - 0 1";
  const game = new Chess(startFen);
  
  console.log('📋 Position:', startFen);
  console.log('📋 Legal moves:', game.moves());
  console.log('📋 Legal moves (verbose):', game.moves({ verbose: true }));
  
  // Test Bxd7 specifically
  const testMove = parseSANtoMoveObject('Bxd7', game);
  console.log('📋 Test result for Bxd7:', testMove);
  
  return testMove;
}

/**
 * Test function for SAN parser
 */
export function testSANParser() {
  console.log('🧪 Testing Enhanced SAN Parser...');
  
  // Test the problematic position
  testSpecificPosition();
  
  return true;
}