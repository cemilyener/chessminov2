import { useState, useEffect, useMemo, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

function ChessboardComponent({ onChange, onReset }) {
  // FEN pozisyonu tutmak için state
  const [position, setPosition] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  const [selectedPiece, setSelectedPiece] = useState(null);

  // Chess.js olmadan doğrudan FEN manipülasyonu için yardımcı fonksiyonlar
  const fenToBoard = (fen) => {
    // FEN'in ilk kısmını al (sadece taşların konumu)
    const positionPart = fen.split(' ')[0];
    return positionPart;
  };

  const boardToFen = (board) => {
    // Geçerli bir FEN oluştur (her zaman beyazın hamlesi, rok hakları yok)
    return `${board} w - - 0 1`;
  };

  // useCallback ile resetBoard'u sarmalayalım ki fonksiyon referansı değişmesin
  const resetBoard = useCallback((type) => {
    let newPosition = "";
    
    if (type === "standard") {
      newPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    } else if (type === "kingless") {
      newPosition = "rnbq1bnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQ1BNR";
    } else {
      newPosition = "8/8/8/8/8/8/8/8";
    }
    
    setPosition(newPosition);
  }, []);

  // onChange'i useEffect içinde çağırın
  useEffect(() => {
    if (onChange) {
      onChange(position);
    }
  }, [position, onChange]);

  // Taş sürükleme işlemi - chess.js kullanmadan
  const onPieceDrop = (sourceSquare, targetSquare) => {
    // FEN'i parçalara ayır
    const pieces = {};
    let currentRank = 8;
    let currentFile = 0;
    
    // Mevcut pozisyonu al
    const currentPosition = position;
    
    // FEN'i parçalayıp pieces nesnesine dönüştür
    for (let i = 0; i < currentPosition.length; i++) {
      const char = currentPosition[i];
      
      if (char === '/') {
        currentRank--;
        currentFile = 0;
      } else if ('12345678'.includes(char)) {
        currentFile += parseInt(char, 10);
      } else {
        const square = String.fromCharCode(97 + currentFile) + currentRank;
        pieces[square] = char;
        currentFile++;
      }
    }
    
    // Taşı hedef kareye koy (kaynak kareden alıp hedef kareye taşı)
    if (pieces[sourceSquare]) {
      pieces[targetSquare] = pieces[sourceSquare];
      delete pieces[sourceSquare];
      
      // Pieces nesnesini FEN'e dönüştür
      let newFen = '';
      for (let rank = 8; rank >= 1; rank--) {
        let emptySquares = 0;
        
        for (let file = 0; file < 8; file++) {
          const square = String.fromCharCode(97 + file) + rank;
          
          if (pieces[square]) {
            if (emptySquares > 0) {
              newFen += emptySquares;
              emptySquares = 0;
            }
            newFen += pieces[square];
          } else {
            emptySquares++;
          }
        }
        
        if (emptySquares > 0) {
          newFen += emptySquares;
        }
        
        if (rank > 1) {
          newFen += '/';
        }
      }
      
      setPosition(newFen);
      
      if (onChange) {
        onChange(boardToFen(newFen));
      }
      
      return true;
    }
    
    return false;
  };

  // Sağ tıklama ile taş kaldırma
  const onSquareRightClick = (square) => {
    // FEN'i parçalara ayır
    const pieces = {};
    let currentRank = 8;
    let currentFile = 0;
    
    // Mevcut pozisyonu al
    const currentPosition = position;
    
    // FEN'i parçalayıp pieces nesnesine dönüştür
    for (let i = 0; i < currentPosition.length; i++) {
      const char = currentPosition[i];
      
      if (char === '/') {
        currentRank--;
        currentFile = 0;
      } else if ('12345678'.includes(char)) {
        currentFile += parseInt(char, 10);
      } else {
        const sq = String.fromCharCode(97 + currentFile) + currentRank;
        pieces[sq] = char;
        currentFile++;
      }
    }
    
    // Tıklanan karedeki taşı kaldır
    if (pieces[square]) {
      delete pieces[square];
      
      // Pieces nesnesini FEN'e dönüştür
      let newFen = '';
      for (let rank = 8; rank >= 1; rank--) {
        let emptySquares = 0;
        
        for (let file = 0; file < 8; file++) {
          const sq = String.fromCharCode(97 + file) + rank;
          
          if (pieces[sq]) {
            if (emptySquares > 0) {
              newFen += emptySquares;
              emptySquares = 0;
            }
            newFen += pieces[sq];
          } else {
            emptySquares++;
          }
        }
        
        if (emptySquares > 0) {
          newFen += emptySquares;
        }
        
        if (rank > 1) {
          newFen += '/';
        }
      }
      
      setPosition(newFen);
      
      if (onChange) {
        onChange(boardToFen(newFen));
      }
    }
  };

  // Taş eklemek için tıklama
  const onSquareClick = (square) => {
    if (selectedPiece) {
      // FEN'i parçalara ayır
      const pieces = {};
      let currentRank = 8;
      let currentFile = 0;
      
      // Mevcut pozisyonu al
      const currentPosition = position;
      
      // FEN'i parçalayıp pieces nesnesine dönüştür
      for (let i = 0; i < currentPosition.length; i++) {
        const char = currentPosition[i];
        
        if (char === '/') {
          currentRank--;
          currentFile = 0;
        } else if ('12345678'.includes(char)) {
          currentFile += parseInt(char, 10);
        } else {
          const sq = String.fromCharCode(97 + currentFile) + currentRank;
          pieces[sq] = char;
          currentFile++;
        }
      }
      
      // Seçilen taşı kareye ekle
      pieces[square] = selectedPiece;
      
      // Pieces nesnesini FEN'e dönüştür
      let newFen = '';
      for (let rank = 8; rank >= 1; rank--) {
        let emptySquares = 0;
        
        for (let file = 0; file < 8; file++) {
          const sq = String.fromCharCode(97 + file) + rank;
          
          if (pieces[sq]) {
            if (emptySquares > 0) {
              newFen += emptySquares;
              emptySquares = 0;
            }
            newFen += pieces[sq];
          } else {
            emptySquares++;
          }
        }
        
        if (emptySquares > 0) {
          newFen += emptySquares;
        }
        
        if (rank > 1) {
          newFen += '/';
        }
      }
      
      setPosition(newFen);
      
      if (onChange) {
        onChange(boardToFen(newFen));
      }
      
      // Seçimi temizle
      setSelectedPiece(null);
    }
  };

  // Taş seçme butonları
  const pieceButtons = useMemo(() => {
    // Düzenlenmiş taş dizisi - Beyaz ve Siyah taşlar ayrı gruplar halinde
    const whitePieces = [
      { type: "K", img: "/pieces/wK.png", value: "K" },
      { type: "Q", img: "/pieces/wQ.png", value: "Q" },
      { type: "R", img: "/pieces/wR.png", value: "R" },
      { type: "B", img: "/pieces/wB.png", value: "B" },
      { type: "N", img: "/pieces/wN.png", value: "N" },
      { type: "P", img: "/pieces/wP.png", value: "P" },
    ];

    const blackPieces = [
      { type: "k", img: "/pieces/bK.png", value: "k" },
      { type: "q", img: "/pieces/bQ.png", value: "q" },
      { type: "r", img: "/pieces/bR.png", value: "r" },
      { type: "b", img: "/pieces/bB.png", value: "b" },
      { type: "n", img: "/pieces/bN.png", value: "n" },
      { type: "p", img: "/pieces/bP.png", value: "p" },
    ];

    return (
      <div className="mt-4">
        {/* Beyaz Taşlar */}
        <div className="flex flex-wrap gap-2 justify-center mb-2">
          {whitePieces.map((piece) => (
            <button
              key={piece.type}
              onClick={() => setSelectedPiece(piece.value)}
              className={`w-12 h-12 flex items-center justify-center border ${
                selectedPiece === piece.value ? "bg-blue-200 border-blue-500" : "bg-white"
              }`}
            >
              <img src={piece.img} alt={piece.type} className="w-8 h-8" />
            </button>
          ))}
        </div>
        
        {/* Siyah Taşlar */}
        <div className="flex flex-wrap gap-2 justify-center">
          {blackPieces.map((piece) => (
            <button
              key={piece.type}
              onClick={() => setSelectedPiece(piece.value)}
              className={`w-12 h-12 flex items-center justify-center border ${
                selectedPiece === piece.value ? "bg-blue-200 border-blue-500" : "bg-gray-100"
              }`}
            >
              <img src={piece.img} alt={piece.type} className="w-8 h-8" />
            </button>
          ))}
        </div>
      </div>
    );
  }, [selectedPiece]);

  // Export resetBoard to parent component - bağımlılık listesine resetBoard eklendi
  useEffect(() => {
    if (onReset) {
      onReset(resetBoard);
    }
  }, [onReset, resetBoard]);

  return (
    <div>
      <Chessboard
        position={boardToFen(position)}
        onPieceDrop={onPieceDrop}
        onSquareRightClick={onSquareRightClick}
        onSquareClick={onSquareClick}
        boardWidth={500}
      />

      {pieceButtons}

      <div className="mt-4 flex space-x-2">
        <button 
          onClick={() => resetBoard("standard")} 
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Standart Konum
        </button>
        
        <button 
          onClick={() => resetBoard("empty")} 
          className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Tahtayı Temizle
        </button>
      </div>
    </div>
  );
}

export default ChessboardComponent;
