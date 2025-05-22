import React, { Component, createRef, forwardRef } from 'react';
import html2canvas from 'html2canvas';
import './ChessboardStyle.css';

class ChessboardCapture extends Component {
  constructor(props) {
    super(props);
    this.boardRef = createRef();
    
    // State tanımlama
    this.state = {
      useCustomImages: Boolean(props.useCustomImages) || false
    };
    
    // forwardRef'i bağlayalım
    if (props.forwardedRef) {
      props.forwardedRef.current = this;
    }
  }

  componentDidUpdate() {
    // Props değiştiğinde ref bağlantısını güncelle
    if (this.props.forwardedRef) {
      this.props.forwardedRef.current = this;
    }
  }

  // captureImage metodu
  captureImage = async () => {
    const { boardId } = this.props;
    console.debug(`ChessboardCapture: Attempting to capture board ${boardId}`);
    
    // Board container'ın varlığını kontrol et
    const boardElement = this.boardRef.current;
    if (!boardElement) {
      console.error(`ChessboardCapture: Board element not found for ${boardId}`);
      return null;
    }
    
    try {
      // html2canvas öncesinde küçük bir gecikme ekle
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Tahta elemanının boyutlarını al
      const { width, height } = boardElement.getBoundingClientRect();
      console.debug(`ChessboardCapture: Capturing board ${boardId} with dimensions:`, {width, height});
      
      // html2canvas kullan
      const capturedCanvas = await html2canvas(boardElement, {
        backgroundColor: null,
        scale: 2, // Daha iyi kalite için
        logging: false,
        useCORS: true
      });
      
      console.debug(`ChessboardCapture: Successfully captured board ${boardId}`);
      const imageData = capturedCanvas.toDataURL('image/png', 0.95);
      console.debug(`ChessboardCapture: Image data length: ${imageData.length}`);
      
      return imageData;
    } catch (err) {
      console.error(`ChessboardCapture: Error capturing board ${boardId}:`, err);
      // Hata durumunda tahtayı manuel olarak çiz
      return this.createFallbackImage();
    }
  }
  
  // Yedek görüntü oluştur
  createFallbackImage = () => {
    const { fen, orientation } = this.props;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Satranç tahtası desenini çiz
    const squareSize = 50;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? '#F0D9B5' : '#B58863';
        ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
      }
    }
    
    // FEN'i metinsel olarak ekle
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.fillText(`FEN: ${fen || 'Standart başlangıç pozisyonu'}`, 10, 390);
    ctx.fillText(`Orientation: ${orientation || 'white'}`, 10, 375);
    
    return canvas.toDataURL('image/png', 0.95);
  }

  // Temel satranç tahtası desenini çiz
  drawChessboard = (ctx, width, height) => {
    const squareSize = Math.min(width, height) / 8;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? '#F0D9B5' : '#B58863';
        ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
      }
    }
  }

  render() {
    const { fen, orientation, size = 400 } = this.props;
    
    return (
      <div ref={this.boardRef} className="chessboard-wrapper" style={{ width: size, height: size }}>
        <div className="chess-board real-chess-board" data-fen={fen} data-orientation={orientation}>
          {/* Satranç tahtası kareleri */}
          <div className="board-squares">
            {Array(8).fill().map((_, row) => (
              Array(8).fill().map((_, col) => (
                <div key={`${row}-${col}`} 
                  className={`board-square ${(row + col) % 2 === 0 ? 'light-square' : 'dark-square'}`}
                  style={{
                    position: 'absolute',
                    width: `${100/8}%`,
                    height: `${100/8}%`,
                    top: `${row * 100/8}%`,
                    left: `${col * 100/8}%`
                  }}
                />
              ))
            ))}
          </div>
          
          {/* Satranç taşları */}
          <div className="chess-pieces">
            {this.renderChessPieces(fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', orientation || 'white')}
          </div>
        </div>
        
        {/* Konum bilgisini küçük metinle göster */}
        <div style={{ position: 'absolute', bottom: '2px', left: '5px', fontSize: '8px', color: '#666' }}>
          {fen && <span>{fen.split(' ')[0]}</span>}
        </div>
      </div>
    );
  }

  renderChessPieces = (fen, orientation) => {
    if (!fen) return null;
    
    // FEN pozisyonunu parse et
    const fenParts = fen.split(' ');
    const position = fenParts[0];
    const rows = position.split('/');
    
    const pieces = [];
    let squareIndex = 0;
    
    rows.forEach((row, rowIndex) => {
      let colIndex = 0;
      
      // Her satırdaki karakterleri işle
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (isNaN(char)) {
          // Bu bir taş (rakam değil)
          const pieceColor = char === char.toUpperCase() ? 'white' : 'black';
          const pieceType = char.toLowerCase();
          
          // Taşın konumunu hesapla (satranç tahtasının hizalamasına uygun olarak)
          const squareRow = orientation === 'white' ? rowIndex : 7 - rowIndex;
          const squareCol = orientation === 'white' ? colIndex : 7 - colIndex;
          
          pieces.push(
            <div 
              key={`piece-${squareIndex}`}
              className={`chess-piece ${pieceColor}-${pieceType}`}
              style={{
                position: 'absolute',
                width: `12.5%`,
                height: `12.5%`,
                top: `${squareRow * 12.5}%`,
                left: `${squareCol * 12.5}%`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontSize: '32px',
                lineHeight: '1',
                zIndex: 5
              }}
            >
              {this.getPieceUnicode(pieceType, pieceColor)}
            </div>
          );
          
          colIndex++;
          squareIndex++;
        } else {
          // Bu bir rakam, boş kare sayısını belirtir
          const emptySquares = parseInt(char, 10);
          colIndex += emptySquares;
          squareIndex += emptySquares;
        }
      }
    });
    
    return pieces;
  }

  getPieceUnicode(pieceType, color) {
    const pieces = {
      'white': {
        'k': '♔', // kral
        'q': '♕', // vezir
        'r': '♖', // kale
        'b': '♗', // fil
        'n': '♘', // at
        'p': '♙'  // piyon
      },
      'black': {
        'k': '♚',
        'q': '♛',
        'r': '♜',
        'b': '♝',
        'n': '♞',
        'p': '♟'
      }
    };
    
    return pieces[color][pieceType];
  }
  
  // Taş görüntülerini render et
  renderPieceImage = (pieceType, pieceColor) => {
    // Taş görsellerini kullanıp kullanmayacağımızı kontrol et
    if (this.state && this.state.useCustomImages) {
      try {
        // Taş görselleri için yolu oluştur
        const imagePath = `/assets/pieces/${pieceColor}_${pieceType}.png`;
        
        return (
          <img 
            src={imagePath} 
            alt={`${pieceColor} ${pieceType}`} 
            className="chess-piece-image"
            style={{ 
              width: '90%', 
              height: '90%', 
              objectFit: 'contain',
              userSelect: 'none'
            }}
            onError={() => {
              // Görsel yüklenemezse Unicode karakterlere geri dön
              if (this.state.useCustomImages) {
                this.setState({ useCustomImages: false });
              }
            }}
          />
        );
      } catch (err) {
        console.error('Error loading piece image:', err);
        // Hata durumunda Unicode karakterleri kullan
        return this.getPieceUnicode(pieceType, pieceColor);
      }
    }
    
    // Varsayılan olarak Unicode karakterleri kullan
    return this.getPieceUnicode(pieceType, pieceColor);
  }
  
  componentDidMount() {
    const { boardId } = this.props;
    console.debug(`ChessboardCapture mounted for board ${boardId}`);
    console.debug(`ref exists: ${!!this.props.forwardedRef}, internal ref has current: ${!!this.boardRef.current}`);
    
    // forwardRef bağlantısını kontrol et ve düzelt
    if (this.props.forwardedRef && !this.props.forwardedRef.current) {
      this.props.forwardedRef.current = this;
      console.debug(`Fixed forwardRef connection for board ${boardId}`);
    }
    
    // Callback ile yüklendi bilgisini gönder
    if (this.props.onMount) {
      this.props.onMount(boardId);
    }
  }

  componentWillUnmount() {
    const { boardId } = this.props;
    console.debug(`ChessboardCapture unmounted for board ${boardId}`);
  }
}

// React.forwardRef'i doğru şekilde kullanın
export default React.forwardRef((props, ref) => {
  return <ChessboardCapture {...props} forwardedRef={ref} />;
});
