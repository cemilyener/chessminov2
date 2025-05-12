import { Chess } from 'chess.js';

export class ExtendedChess extends Chess {
  constructor(fen, options = {}) {
    if (!fen) {
      super();
      return;
    }

    // If bypass is enabled, manually validate with custom settings
    if (options.bypass && options.bypass.includes(10)) {
      // Initialize empty board first
      super();
      this.loadWithoutKingValidation(fen);
    } else {
      // Use regular validation
      super(fen);
    }
  }

  loadWithoutKingValidation(fen) {
    // Parse FEN without full validation
    const tokens = fen.split(/\s+/);
    const position = tokens[0];
    const rows = position.split('/');

    // Clear the board
    this.clear();

    // Set turn, castling rights, etc. directly
    this._turn = tokens[1] === 'b' ? 'b' : 'w';
    this._castling = { w: 0, b: 0 };
    if (tokens[2] !== '-') {
      if (tokens[2].includes('K')) this._castling.w |= 1;
      if (tokens[2].includes('Q')) this._castling.w |= 2;
      if (tokens[2].includes('k')) this._castling.b |= 1;
      if (tokens[2].includes('q')) this._castling.b |= 2;
    }
    this._epSquare = tokens[3] === '-' ? null : tokens[3];
    this._halfMoves = parseInt(tokens[4]) || 0;
    this._moveNumber = parseInt(tokens[5]) || 1;

    // Place pieces manually
    let rank = 7;
    for (let i = 0; i < 8; i++) {
      let file = 0;
      for (let j = 0; j < rows[i].length; j++) {
        const piece = rows[i][j];
        if (piece >= '1' && piece <= '8') {
          file += parseInt(piece);
        } else {
          const color = piece < 'a' ? 'w' : 'b';
          const type = piece.toLowerCase();
          const square = String.fromCharCode(97 + file) + (rank + 1);
          this.put({ type, color }, square);
          file++;
        }
      }
      rank--;
    }

    return true;
  }
}