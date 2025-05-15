/**
 * PDF Generator için taş paleti ve satranç tahtası çizim fonksiyonları
 */

/**
 * Taş paletini PDF dokümanına çizer
 * 
 * @param {Object} doc - jsPDF doküman nesnesi
 * @param {Object} options - Çizim seçenekleri
 * @param {number} options.x - Başlangıç X koordinatı
 * @param {number} options.y - Başlangıç Y koordinatı
 * @param {number} options.boardSize - Tahta boyutu (piksel)
 * @param {string} options.moveOrder - Hamle sırası ('white' veya 'black')
 * @param {string} options.scale - Ölçek boyutu ('compact', 'medium', 'large')
 */
export const drawPiecePalette = (doc, {
  x,
  y,
  boardSize,
  moveOrder = 'white',
  scale = 'medium'
}) => {
  // Taş tipleri ve harfleri
  const pieceTypes = [
    { key: 'p', name: 'Piyon', letter: 'P' },
    { key: 'n', name: 'At', letter: 'A' },
    { key: 'b', name: 'Fil', letter: 'F' },
    { key: 'r', name: 'Kale', letter: 'K' },
    { key: 'q', name: 'Vezir', letter: 'V' },
    { key: 'k', name: 'Şah', letter: 'Ş' }
  ];
  
  // Ölçeğe göre boyut ayarları
  const sizeMap = {
    compact: {
      pieceSize: boardSize / 12,
      gap: 1,
      maxPieces: 3,
      showLabels: false,
      fontSize: 0.6
    },
    medium: {
      pieceSize: boardSize / 10,
      gap: 2,
      maxPieces: 6,
      showLabels: true,
      fontSize: 0.7
    },
    large: {
      pieceSize: boardSize / 8,
      gap: 3, 
      maxPieces: 6,
      showLabels: true,
      fontSize: 0.8
    }
  };
  
  // Ölçek ayarlarını al
  const sizeConfig = sizeMap[scale] || sizeMap.medium;
  const { pieceSize, gap, maxPieces, showLabels, fontSize } = sizeConfig;
  
  // Kurallara uygun yönelim belirleme
  const isHorizontal = scale === 'compact';
  
  // Her taş için çizim döngüsü
  for (let i = 0; i < Math.min(pieceTypes.length, maxPieces); i++) {
    const piece = pieceTypes[i];
    
    // Koordinat hesaplama
    let pieceX, pieceY;
    
    if (isHorizontal) {
      // Yatay düzenleme
      pieceX = x + i * (pieceSize + gap);
      pieceY = y;
    } else {
      // Dikey düzenleme
      pieceX = x;
      pieceY = y + i * (pieceSize + gap);
    }
    
    // Taş arkaplanı
    doc.setFillColor(moveOrder === 'white' ? 240 : 200, moveOrder === 'white' ? 240 : 200, moveOrder === 'white' ? 240 : 200);
    doc.circle(pieceX + pieceSize/2, pieceY + pieceSize/2, pieceSize/2, 'F');
    
    // Taş harfi
    doc.setFontSize(pieceSize * fontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(moveOrder === 'white' ? 30 : 0);
    doc.text(piece.letter, pieceX + pieceSize/2, pieceY + pieceSize*0.7, { align: 'center' });
    
    // Taş adı (sadece showLabels true ise)
    if (showLabels) {
      const labelX = isHorizontal ? pieceX + pieceSize/2 : pieceX + pieceSize + gap;
      const labelY = isHorizontal ? pieceY + pieceSize + gap : pieceY + pieceSize/2;
      
      doc.setFontSize(pieceSize * (fontSize - 0.2));
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      
      const textOptions = isHorizontal 
        ? { align: 'center' } 
        : { align: 'left', baseline: 'middle' };
        
      doc.text(piece.name, labelX, labelY, textOptions);
    }
  }
};

/**
 * Satranç konumu kartını PDF dokümanına çizer
 * 
 * @param {Object} doc - jsPDF doküman nesnesi
 * @param {Object} options - Çizim seçenekleri
 * @param {Object} options.position - Konum bilgileri (fen, screenshot, title, description, moveOrder)
 * @param {number} options.x - Başlangıç X koordinatı
 * @param {number} options.y - Başlangıç Y koordinatı
 * @param {number} options.cardWidth - Kart genişliği
 * @param {number} options.cardHeight - Kart yüksekliği
 * @param {number} options.boardSize - Tahta boyutu
 * @param {string} options.scale - Ölçek boyutu ('compact', 'medium', 'large')
 * @param {boolean} options.grayscalePreview - Gri tonlama önizleme modu
 */
export const drawPositionCard = async (doc, {
  position,
  x,
  y,
  cardWidth,
  cardHeight,
  boardSize,
  scale = 'medium',
  grayscalePreview = false
}) => {
  const padding = 10;
  const titleHeight = 20;
  const metaHeight = position.description ? 30 : 15;

  // Kart arkaplanı
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');
  
  // Başlık
  const title = position.title || 'Konum';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(title, x + padding, y + padding + 5);
  
  // Tahta konumu hesaplama
  const boardX = x + padding;
  const boardY = y + padding + titleHeight;
  
  // Tahta görüntüsü
  if (position.screenshot) {
    try {
      // Base64 görüntüyü yükle
      const imageData = position.screenshot;
      
      // Görüntüyü PDF'e ekle
      if (grayscalePreview) {
        // Gri ton modu
        doc.addImage(imageData, 'PNG', boardX, boardY, boardSize, boardSize, undefined, 'NONE', 0);
      } else {
        // Normal renkli mod
        doc.addImage(imageData, 'PNG', boardX, boardY, boardSize, boardSize);
      }
      
      // Taş paleti için koordinatlar hesapla
      const paletteConfig = {
        compact: {
          x: boardX,
          y: boardY + boardSize + 5,
          orientation: 'horizontal'
        },
        medium: {
          x: boardX + boardSize + 10,
          y: boardY,
          orientation: 'vertical'
        },
        large: {
          x: boardX + boardSize + 15,
          y: boardY, 
          orientation: 'vertical'
        }
      };
      
      // Taş paletini çiz
      const palettePos = paletteConfig[scale] || paletteConfig.medium;
      
      drawPiecePalette(doc, {
        x: palettePos.x,
        y: palettePos.y,
        boardSize,
        moveOrder: position.moveOrder || 'white',
        scale
      });
      
    } catch (error) {
      // Görüntü yükleme hatası durumunda
      console.error("Konum görüntüsü eklenirken hata:", error);
      doc.setTextColor(200, 0, 0);
      doc.setFontSize(10);
      doc.text("Görüntü yüklenemedi", boardX + boardSize/2, boardY + boardSize/2, { align: 'center' });
    }
  } else {
    // Screenshot yoksa uyarı mesajı
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text("Konum görüntüsü yok", boardX + boardSize/2, boardY + boardSize/2, { align: 'center' });
  }
  
  // FEN ve açıklama
  const metaY = boardY + boardSize + 15;
  
  // FEN bilgisi
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const fenText = position.fen || '8/8/8/8/8/8/8/8 w - - 0 1';
  doc.text(`FEN: ${fenText}`, x + padding, metaY);
  
  // Açıklama
  if (position.description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(position.description, x + padding, metaY + 10, {
      maxWidth: cardWidth - (padding * 2)
    });
  }
};

/**
 * Satranç tahtasının koordinat etiketlerini çizer
 * 
 * @param {Object} doc - jsPDF doküman nesnesi
 * @param {Object} options - Çizim seçenekleri
 */
export const drawBoardCoordinates = (doc, {
  x,
  y,
  boardSize,
  orientation = 'white'
}) => {
  const squareSize = boardSize / 8;
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(squareSize * 0.4);
  doc.setTextColor(100, 100, 100);
  
  // Sütun harfleri
  for (let i = 0; i < 8; i++) {
    const fileIndex = orientation === 'white' ? i : 7 - i;
    const file = files[fileIndex];
    doc.text(file, 
      x + (i * squareSize) + (squareSize / 2),
      y + boardSize + (squareSize * 0.4),
      { align: 'center' });
  }
  
  // Satır sayıları
  for (let i = 0; i < 8; i++) {
    const rankIndex = orientation === 'white' ? 7 - i : i;
    const rank = ranks[rankIndex];
    doc.text(rank,
      x - (squareSize * 0.3),
      y + (i * squareSize) + (squareSize / 2) + (squareSize * 0.15),
      { align: 'right' });
  }
};