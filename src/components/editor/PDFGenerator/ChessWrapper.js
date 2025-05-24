import { Chess } from 'chess.js';

class ChessWrapper {
  constructor(fen) {
    // Standart chess.js örneği
    this.chess = new Chess(fen);
    
    // Şahsız mod için bayrak
    this.isKinglessMode = false;
    
    // Şahsız mod için bir önceki geçerli pozisyon
    this.lastValidPosition = fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }
  
  // Şahsız modu etkinleştir/devre dışı bırak
  setKinglessMode(enabled) {
    this.isKinglessMode = enabled;
    return this;
  }
  
  // FEN dizesini alma (Chess.js'nin fen() metodu)
  fen() {
    return this.chess.fen();
  }
  
  // Hamle yapma (Chess.js'nin move() metodunu genişletme)
  move(move) {
    try {
      const result = this.chess.move(move);
      if (result) {
        this.lastValidPosition = this.chess.fen();
      }
      return result;
    } catch (error) {
      if (this.isKinglessMode) {
        console.log("Şahsız modda hata görmezden gelindi:", error);
        
        // Geçici bir kopya oluştur
        const tempChess = new Chess(this.lastValidPosition);
        
        // Hamleyi bu geçici kopyada deneme
        try {
          const result = tempChess.move(move);
          if (result) {
            // Başarılı hamle yaptıysak, ana chess örneğimizi güncelle
            this.chess = tempChess;
            this.lastValidPosition = tempChess.fen();
            return result;
          }
        } catch (innerError) {
          console.error("Geçersiz hamle:", innerError);
        }
      }
      
      throw error;
    }
  }
  
  // FEN pozisyonunu yükleme (Chess.js'nin load() metodunu genişletme)
  load(fen) {
    try {
      const result = this.chess.load(fen);
      if (result) {
        this.lastValidPosition = fen;
      }
      return result;
    } catch (error) {
      if (this.isKinglessMode) {
        console.log("Şahsız modda FEN yükleme hatası görmezden gelindi:", error);
        return true; // Şahsız modda hataları görmezden gel
      }
      throw error;
    }
  }
  
  // Diğer chess.js metodlarını doğrudan ilet
  reset() {
    return this.chess.reset();
  }
  
  remove(square) {
    return this.chess.remove(square);
  }
  
  put(piece, square) {
    return this.chess.put(piece, square);
  }
  
  clear() {
    return this.chess.clear();
  }
  
  get(square) {
    return this.chess.get(square);
  }
  
  // Şahsız mod için özel metodlar
  setupKinglessBoardPosition() {
    if (this.isKinglessMode) {
      // Temiz bir tahta başlat
      this.chess.clear();
      
      // Piyon, kale, at, fil ve vezir yerleştir
      const pieces = {
        'r': 'a8', 'n': 'b8', 'b': 'c8', 'q': 'd8', 'b': 'f8', 'n': 'g8', 'r': 'h8',
        'p': 'a7', 'p': 'b7', 'p': 'c7', 'p': 'd7', 'p': 'e7', 'p': 'f7', 'p': 'g7', 'p': 'h7',
        'P': 'a2', 'P': 'b2', 'P': 'c2', 'P': 'd2', 'P': 'e2', 'P': 'f2', 'P': 'g2', 'P': 'h2',
        'R': 'a1', 'N': 'b1', 'B': 'c1', 'Q': 'd1', 'B': 'f1', 'N': 'g1', 'R': 'h1'
      };
      
      for (const [piece, square] of Object.entries(pieces)) {
        this.chess.put({ type: piece.toLowerCase(), color: piece === piece.toUpperCase() ? 'w' : 'b' }, square);
      }
      
      // Şahsız ama geçerli bir FEN oluştur
      this.lastValidPosition = this.chess.fen();
      
      return true;
    }
    
    return false;
  }
}

export default ChessWrapper;