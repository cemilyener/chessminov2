import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * PDF Şablon Bileşeni
 * - jsPDF kullanarak satranç pozisyonlarından PDF oluşturur
 * - Çeşitli düzen tiplerini destekler: 1, 2, 4, 6, 8 pozisyon
 * - Her pozisyon kartı: başlık, tahta görüntüsü, hamle sırası, açıklama ve çözüm alanı içerir
 * - Footer: copyright, sosyal medya ve iletişim bilgilerini içerir
 */

// Standart fontlar ve font ailelerini tanımla
const FONTS = {
  SANS: 'helvetica',
  SERIF: 'times',
};

// Taş simgeleri için Unicode karakterler
const PIECE_SYMBOLS = {
  white: {
    king: '♔', // Şah
    queen: '♕', // Vezir
    rook: '♖', // Kale
    bishop: '♗', // Fil
    knight: '♘', // At
    pawn: '♙', // Piyon
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
  }
};

// Kare renkleri
const SQUARE_COLORS = {
  highlight: { r: 255, g: 255, b: 0, a: 0.3 }, // Sarı vurgu
  lastMove: { r: 173, g: 216, b: 230, a: 0.5 }, // Açık mavi
  check: { r: 255, g: 0, b: 0, a: 0.3 }, // Kırmızı
  selected: { r: 144, g: 238, b: 144, a: 0.5 }, // Açık yeşil
};

// Sayfa boyutu konfigürasyonları (mm)
const PAGE_SIZES = {
  A4: { width: 210, height: 297 },
  LETTER: { width: 216, height: 279 },
  LEGAL: { width: 216, height: 356 }
};

// PDF oluşturma ana fonksiyonu
export const generatePDF = async ({
  positions,
  pageTitle,
  layoutType,
  fileName = 'ChessMino-Çalışma-Sayfası',
  
  // Settings bileşeninden gelen local state değerleri
  description = '',
  author = '',
  headerImage = null,
  pageSize = 'A4',
  orientation = 'portrait',
  
  // Yeni eklenen okul bilgileri
  schoolName = '',
  schoolLogo = null,
  
  // Optimizasyon ayarları
  optimizeForWhatsApp = true,
  grayscalePreview = false
}) => {
  // Sayfa boyutları ve yönü belirleme
  const size = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
  const isLandscape = orientation === 'landscape';
  
  // Döküman oluştur
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: pageSize,
    compress: optimizeForWhatsApp, // WhatsApp için dosya boyutunu optimize et
  });
  
  // Döküman özellikleri
  doc.setProperties({
    title: pageTitle || 'Satranç Çalışma Sayfası',
    author: author || 'ChessMino',
    subject: description || 'Satranç pozisyonları',
    keywords: 'satranç, chess, pozisyon, egzersiz, ' + (schoolName || ''),
    creator: 'ChessMino PDF Generator'
  });

  // Font ayarları - daha okunaklı font kullan
  doc.setFont(FONTS.SANS);
  
  // Sayfa genişliği ve yüksekliği (mm)
  const pageWidth = isLandscape ? size.height : size.width;
  const pageHeight = isLandscape ? size.width : size.height;
  
  // Kenar boşlukları (mm) - artırılmış kenar boşlukları
  const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };
  
  // Kullanılabilir içerik alanı
  const contentWidth = pageWidth - margin.left - margin.right;
  const contentHeight = pageHeight - margin.top - margin.bottom;
  
  // Okul bilgileri yüksekliği
  const schoolInfoHeight = (schoolName || schoolLogo) ? 20 : 0;
  
  // Üst bilgi yüksekliği - başlık ile pozisyonlar arası boşluk artırıldı
  const headerHeight = 25 + (description ? 15 : 0) + (headerImage ? 35 : 0) + schoolInfoHeight;
  
  // Alt bilgi yüksekliği
  const footerHeight = 12;
  
  // Pozisyonlar için kullanılabilir alan
  const positionsAreaHeight = contentHeight - headerHeight - footerHeight;
  
  // Okul bilgilerini çiz
  if (schoolName || schoolLogo) {
    drawSchoolInfo(doc, {
      schoolName,
      schoolLogo,
      margin,
      contentWidth
    });
  }
  
  // PDF'in üst bölümünü çiz
  drawHeader(doc, {
    pageTitle,
    description,
    headerImage,
    margin,
    contentWidth,
    schoolInfoHeight
  });

  // Düzen tipini bir sayı olarak alıyoruz
  const layoutTypeNumber = parseInt(layoutType);

  // Grid ayarlarını düzen tipine göre belirle
  const gridConfig = getGridConfig(layoutTypeNumber);
  
  // Pozisyonları yerleştir
  await drawPositions(doc, {
    positions, 
    gridConfig,
    margin,
    headerHeight,
    contentWidth,
    positionsAreaHeight,
    grayscalePreview
  });
  
  // Alt bilgiyi çiz (her sayfada)
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, {
      margin,
      contentWidth,
      pageHeight
    });
  }

  // PDF'i kaydet
  doc.save(`${fileName}.pdf`);
  
  return doc;
};

/**
 * Okul bilgilerini çiz
 * @param {jsPDF} doc - jsPDF döküman nesnesi
 * @param {Object} options - Okul bilgileri
 */
const drawSchoolInfo = (doc, { 
  schoolName,
  schoolLogo,
  margin, 
  contentWidth 
}) => {
  let y = margin.top;
  
  // Okul logosu
  if (schoolLogo) {
    try {
      // Logoyu sol tarafa yerleştir
      const logoSize = 15; // 15mm boyut
      
      // Logo boyutlarını ölç (oranları korumak için)
      const logoImg = new Image();
      logoImg.src = schoolLogo;
      
      // Logo oranları - varsayılan değerler
      let logoWidth = logoSize;
      let logoHeight = logoSize;
      
      // Logo boyutlarını ayarla (en-boy oranını koru)
      if (logoImg.width > logoImg.height) {
        // Yatay logo
        logoWidth = logoSize;
        logoHeight = logoSize * (logoImg.height / logoImg.width);
      } else {
        // Dikey logo
        logoHeight = logoSize;
        logoWidth = logoSize * (logoImg.width / logoImg.height);
      }
      
      doc.addImage(
        schoolLogo,
        'PNG',
        margin.left,
        y,
        logoWidth,
        logoHeight
      );
      
      // Okul adını logonun yanına yerleştir
      if (schoolName) {
        doc.setFontSize(12);
        doc.setFont(FONTS.SANS, 'bold');
        doc.text(
          schoolName,
          margin.left + logoSize + 5,
          y + logoHeight/2,
          { align: 'left', baseline: 'middle' }
        );
      }
    } catch (error) {
      console.error("Okul logosu eklenirken hata:", error);
      
      // Logo yüklenemediyse okul adını ortala
      if (schoolName) {
        doc.setFontSize(12);
        doc.setFont(FONTS.SANS, 'bold');
        doc.text(
          schoolName,
          margin.left + contentWidth / 2,
          y + 10,
          { align: 'center' }
        );
      }
    }
  } else if (schoolName) {
    // Sadece okul adı varsa ortala
    doc.setFontSize(12);
    doc.setFont(FONTS.SANS, 'bold');
    doc.text(
      schoolName,
      margin.left + contentWidth / 2,
      y + 10,
      { align: 'center' }
    );
  }
};

/**
 * Düzen tipine göre grid konfigürasyonu belirle
 * @param {number} layoutType - Düzen tipi (1, 2, 4, 6, 8)
 * @returns {Object} Grid yapılandırması
 */
const getGridConfig = (layoutType) => {
  switch (layoutType) {
    case 1:
      return { cols: 1, rows: 1, positionsPerPage: 1, scale: 'large' }; // 1 pozisyon, tam sayfa
    case 2:
      return { cols: 1, rows: 2, positionsPerPage: 2, scale: 'medium' }; // 2 pozisyon, alt alta
    case 4:
      return { cols: 2, rows: 2, positionsPerPage: 4, scale: 'medium' }; // 4 pozisyon, 2x2 grid
    case 6:
      return { cols: 2, rows: 3, positionsPerPage: 6, scale: 'compact' }; // 6 pozisyon, 2x3 grid
    case 8:
      return { cols: 4, rows: 2, positionsPerPage: 8, scale: 'compact' }; // 8 pozisyon, 4x2 grid
    default:
      return { cols: 2, rows: 3, positionsPerPage: 6, scale: 'compact' }; // Varsayılan: 6 pozisyon
  }
};

/**
 * PDF başlık alanını çiz
 * @param {jsPDF} doc - jsPDF döküman nesnesi
 * @param {Object} options - Başlık seçenekleri
 */
const drawHeader = (doc, { 
  pageTitle,
  description, 
  headerImage,
  margin,
  contentWidth,
  schoolInfoHeight
}) => {
  // Okul bilgilerinden sonraki başlangıç pozisyonu
  let y = margin.top + (schoolInfoHeight ? schoolInfoHeight + 5 : 0);
  
  // Logo / Başlık resmi
  if (headerImage) {
    try {
      const imgHeight = 25; // sabit yükseklik
      const imgWidth = contentWidth * 0.7; // genişliğin %70'i

      doc.addImage(
        headerImage, 
        'PNG', 
        margin.left + (contentWidth - imgWidth) / 2, // ortalamak için
        y,
        imgWidth,
        imgHeight
      );
      y += imgHeight + 10; // resimden sonra daha fazla boşluk bırak
    } catch (error) {
      console.error("Başlık resmi eklenirken hata oluştu:", error);
    }
  }

  // Sayfa başlığı - Font boyutunu arttır ve daha okunaklı font kullan
  doc.setFontSize(24); // Artırılmış font boyutu
  doc.setFont(FONTS.SANS, 'bold');
  doc.text(
    pageTitle || 'Satranç Çalışma Sayfası', 
    margin.left + contentWidth / 2, 
    y, 
    { align: 'center' }
  );
  y += 15; // Başlıktan sonra daha fazla boşluk

  // Açıklama - sans-serif font
  if (description) {
    doc.setFontSize(11);
    doc.setFont(FONTS.SANS, 'italic');
    doc.text(
      description, 
      margin.left + contentWidth / 2, 
      y, 
      { align: 'center', maxWidth: contentWidth * 0.9 }
    );
    y += 10;
  }

  return y; // son y pozisyonunu döndür
};

/**
 * PDF alt bilgi alanını çiz
 * @param {jsPDF} doc - jsPDF döküman nesnesi
 * @param {Object} options - Alt bilgi seçenekleri
 */
const drawFooter = (doc, { 
  margin,
  contentWidth,
  pageHeight
}) => {
  const footerY = pageHeight - margin.bottom + 3;
  
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80); // koyu gri renk (daha iyi kontrast)
  doc.setFont(FONTS.SANS, 'normal');
  
  // Sol: Copyright
  doc.text('ChessMino ©2025', margin.left, footerY);
  
  // Orta: Sosyal medya
  doc.text(
    '@chessmino | youtube.com/chessmino', 
    margin.left + contentWidth / 2, 
    footerY,
    { align: 'center' }
  );
  
  // Sağ: İletişim
  doc.text(
    'info@chessmino.com', 
    margin.left + contentWidth, 
    footerY,
    { align: 'right' }
  );
  
  doc.setTextColor(0, 0, 0); // rengi siyaha geri çevir
};

/**
 * Pozisyonları grid düzeninde yerleştir
 * @param {jsPDF} doc - jsPDF döküman nesnesi
 * @param {Object} options - Pozisyon yerleşim seçenekleri
 */
const drawPositions = async (doc, { 
  positions,
  gridConfig,
  margin,
  headerHeight,
  contentWidth,
  positionsAreaHeight,
  grayscalePreview
}) => {
  // Pozisyon yoksa "Henüz pozisyon eklenmedi" mesajı göster
  if (!positions.length) {
    doc.setFontSize(12);
    doc.setFont(FONTS.SANS, 'italic');
    doc.text(
      'Henüz pozisyon eklenmedi. Lütfen pozisyon ekleyiniz.', 
      margin.left + contentWidth / 2, 
      margin.top + headerHeight + 30, 
      { align: 'center' }
    );
    return;
  }

  // Grid hesaplamaları
  const { cols, rows, positionsPerPage, scale } = gridConfig;
  
  // Pozisyonlar arasında daha fazla boşluk bırak
  const gapSize = scale === 'compact' ? 5 : (scale === 'medium' ? 8 : 10);
  
  // Her bir pozisyon kartının boyutu - pozisyonlar arası boşluk eklendi
  const cardWidth = (contentWidth - ((cols - 1) * gapSize)) / cols;
  const cardHeight = (positionsAreaHeight - ((rows - 1) * gapSize)) / rows;
  
  // Responsive tahta görüntüsü boyutu - düzen tipine göre boyutlandırma
  const boardSizeScaleFactor = scale === 'large' ? 0.85 : (scale === 'medium' ? 0.75 : 0.65);
  const boardSize = Math.min(cardWidth * 0.8, cardHeight * boardSizeScaleFactor);
  
  // Pozisyon kartları için döngü
  for (let i = 0; i < positions.length; i++) {
    // Yeni sayfa gerekliyse ekle
    if (i > 0 && i % positionsPerPage === 0) {
      doc.addPage();
    }
    
    const position = positions[i];
    const pageIndex = Math.floor(i / positionsPerPage);
    const positionIndex = i % positionsPerPage;
    
    // Grid içindeki pozisyon
    const col = positionIndex % cols;
    const row = Math.floor(positionIndex / cols);
    
    // Pozisyon kartının sol üst köşe koordinatları - boşluklar dikkate alınır
    const x = margin.left + col * (cardWidth + gapSize);
    const y = margin.top + headerHeight + row * (cardHeight + gapSize);
    
    // Pozisyon kartını çiz
    await drawPositionCard(doc, {
      position,
      x,
      y,
      cardWidth,
      cardHeight,
      boardSize,
      scale,
      grayscalePreview
    });
  }
};

/**
 * Tek bir pozisyon kartını çiz
 * @param {jsPDF} doc - jsPDF döküman nesnesi
 * @param {Object} options - Kart seçenekleri
 */
const drawPositionCard = async (doc, {
  position,
  x,
  y,
  cardWidth,
  cardHeight,
  boardSize,
  scale,
  grayscalePreview
}) => {
  // Kart için iç kenar boşluğu
  const padding = 6;
  
  // Tahta alanı
  const boardX = x + (cardWidth - boardSize) / 2; // Yatayda ortala
  const boardY = y + padding + 15; // Başlıktan sonra
  
  // Çerçeve yerine hafif gölge efekti ekle
  doc.setFillColor(250, 250, 250); // Kart arka plan rengi
  
  // Gölge efekti (opsiyonel) - shadow effect için siyah transparan dikdörtgenler
  doc.setDrawColor(230, 230, 230);
  doc.setFillColor(0, 0, 0, 0.05); // %5 transparan siyah (rgba)
  doc.roundedRect(x + 3, y + 3, cardWidth - 2, cardHeight - 2, 2, 2, 'F');
  
  // Kart arka planı
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'F');
  
  // Pozisyon başlığı - sans-serif font
  doc.setFontSize(scale === 'compact' ? 11 : 13);
  doc.setFont(FONTS.SANS, 'bold');
  doc.text(
    position.title || 'Pozisyon', 
    x + cardWidth / 2, 
    y + padding + 5,
    { align: 'center', maxWidth: cardWidth - padding * 2 }
  );
  
  // Tahta görüntüsü
  if (position.screenshot) {
    try {
      // Grayscale optimizasyonu
      if (grayscalePreview) {
        // Grayscale image çizme işlemi burada yapılabilir
        // jsPDF doğrudan grayscale desteklemiyor, bu yüzden kontrastı artırıyoruz
      }
      
      doc.addImage(
        position.screenshot,
        'PNG',
        boardX,
        boardY,
        boardSize,
        boardSize
      );
      
      // Tahta çevresine hafif kenarlık ekle
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(boardX, boardY, boardSize, boardSize);

      // Kareleri renklendir (varsa)
      if (position.highlightedSquares && position.highlightedSquares.length > 0) {
        drawHighlightedSquares(doc, {
          squares: position.highlightedSquares,
          boardX,
          boardY,
          boardSize
        });
      }

      // Ok çiz (varsa)
      if (position.arrows && position.arrows.length > 0) {
        drawArrows(doc, {
          arrows: position.arrows,
          boardX,
          boardY,
          boardSize
        });
      }
    } catch (error) {
      // Görüntü eklenemezse placeholder göster - açık gri arkaplan
      doc.setFillColor(245, 245, 245);
      doc.rect(boardX, boardY, boardSize, boardSize, 'F');
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(
        'Tahta görüntüsü yüklenemedi',
        boardX + boardSize / 2,
        boardY + boardSize / 2,
        { align: 'center' }
      );
      doc.setTextColor(0, 0, 0);
      console.error("Tahta görüntüsü eklenirken hata:", error);
    }
  } else {
    // Görüntü yoksa placeholder göster - açık gri arkaplan
    doc.setFillColor(245, 245, 245);
    doc.rect(boardX, boardY, boardSize, boardSize, 'F');
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Tahta görüntüsü mevcut değil',
      boardX + boardSize / 2,
      boardY + boardSize / 2,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
  }
  
  // Taş paleti ekle (compact ölçeği için bile göster, sadece daha küçük boyutta)
  const paletteX = scale === 'compact' ? 
    boardX : // Compact ise tahta ile aynı hizadan başlat
    boardX + boardSize + 5; // Normal ölçekte tahtanın yanına
    
  const paletteY = scale === 'compact' ? 
    boardY + boardSize + 12 : // Compact ise tahtanın altına
    boardY; // Normal ölçekte tahta ile aynı seviyede
    
  drawPiecePalette(doc, {
    x: paletteX,
    y: paletteY,
    height: boardSize,
    moveOrder: position.moveOrder,
    scale: scale
  });
  
  // Hamle sırası göstergesi
  const moveOrderY = boardY + boardSize + 5;
  doc.setFontSize(scale === 'compact' ? 9 : 10);
  doc.setFont(FONTS.SANS, 'bold');
  
  // Hamle sırasını daha belirgin yap
  const moveColor = position.moveOrder === 'white' ? '#333333' : '#000000';
  doc.setTextColor(moveColor);
  doc.text(
    `Hamle: ${position.moveOrder === 'white' ? 'Beyaz' : 'Siyah'}`,
    x + cardWidth / 2,
    moveOrderY,
    { align: 'center' }
  );
  doc.setTextColor(0, 0, 0);
  
  // Pozisyon açıklaması - sans-serif font
  if (position.description) {
    doc.setFontSize(scale === 'compact' ? 8 : 9);
    doc.setFont(FONTS.SANS, 'normal');
    doc.text(
      position.description,
      x + padding + 2, // sol taraftan biraz içeri
      moveOrderY + 10, // hamle sirasından sonra
      { maxWidth: cardWidth - padding * 2 - 4 }
    );
  }
  
  // Çözüm alanı - daha belirgin yapmak için
  const solutionY = moveOrderY + 20 + (position.description ? 15 : 0);
  if (solutionY + 20 < y + cardHeight) { // Kart sınırları içinde kalıyorsa
    // Çözüm alanı için daha belirgin arka plan
    doc.setFillColor(240, 245, 255); // Açık mavi ton
    doc.roundedRect(
      x + padding + 2,
      solutionY,
      cardWidth - padding * 2 - 4,
      20,
      2,
      2,
      'F'
    );
    
    // Çözüm alanı kenar çizgisi
    doc.setDrawColor(210, 220, 240); // Açık mavi kenar
    doc.roundedRect(
      x + padding + 2,
      solutionY,
      cardWidth - padding * 2 - 4,
      20,
      2,
      2,
      'D'
    );
    
    doc.setFontSize(scale === 'compact' ? 8 : 9);
    doc.setFont(FONTS.SANS, 'bold');
    doc.setTextColor(80, 100, 140); // Koyu mavi ton
    doc.text(
      'Çözüm:',
      x + padding + 6,
      solutionY + 6
    );
    doc.setTextColor(0, 0, 0);
    
    // Çözüm yazma alanı için çizgiler
    doc.setDrawColor(210, 220, 240);
    doc.line(
      x + padding + 6,
      solutionY + 10,
      x + cardWidth - padding - 6,
      solutionY + 10
    );
    
    // İkinci çizgi (cevap için)
    if (scale !== 'compact') {
      doc.line(
        x + padding + 6,
        solutionY + 15,
        x + cardWidth - padding - 6,
        solutionY + 15
      );
    }
  }
};

/**
 * Vurgulanmış kareleri çiz
 * @param {jsPDF} doc - jsPDF döküman nesnesi
 * @param {Object} options - Vurgu seçenekleri
 */
const drawHighlightedSquares = (doc, {
  squares,
  boardX,
  boardY,
  boardSize
}) => {
  // Kare boyutu (8x8 tahta)
  const squareSize = boardSize / 8;
  
  // Her vurgulanmış kare için
  squares.forEach(square => {
    if (typeof square !== 'string' || square.length !== 2) return;
    
    // Kare koordinatlarını hesapla (örn: "e4" -> x=4, y=3)
    const file = square.charCodeAt(0) - 97; // 'a'=0, 'b'=1, ...
    const rank = 8 - parseInt(square.charAt(1)); // '8'=0, '7'=1, ...
    
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return;
    
    // Karenin sol üst köşe koordinatları
    const squareX = boardX + file * squareSize;
    const squareY = boardY + rank * squareSize;
    
    // Karenin rengini belirle (varsayılan: vurgu - sarı)
    const color = SQUARE_COLORS.highlight;
    
    // Renkli dikdörtgen çiz
    doc.setFillColor(color.r, color.g, color.b);
    doc.setGState(new doc.GState({ opacity: color.a }));
    doc.rect(squareX, squareY, squareSize, squareSize, 'F');
    doc.setGState(new doc.GState({ opacity: 1.0 })); // Opaklığı sıfırla
  });
};

/**
 * Okları çiz
 * @param {jsPDF} doc - jsPDF döküman nesnesi
 * @param {Object} options - Ok çizim seçenekleri
 */
const drawArrows = (doc, {
  arrows,
  boardX,
  boardY,
  boardSize
}) => {
  // Kare boyutu (8x8 tahta)
  const squareSize = boardSize / 8;
  
  // Her ok için
  arrows.forEach(arrow => {
    if (!arrow.from || !arrow.to) return;
    
    // Başlangıç koordinatlarını hesapla
    const fromFile = arrow.from.charCodeAt(0) - 97; // 'a'=0, 'b'=1, ...
    const fromRank = 8 - parseInt(arrow.from.charAt(1)); // '8'=0, '7'=1, ...
    
    // Bitiş koordinatlarını hesapla
    const toFile = arrow.to.charCodeAt(0) - 97;
    const toRank = 8 - parseInt(arrow.to.charAt(1));
    
    // Geçersiz koordinatları atlat
    if (fromFile < 0 || fromFile > 7 || fromRank < 0 || fromRank > 7 ||
        toFile < 0 || toFile > 7 || toRank < 0 || toRank > 7) return;
    
    // Karelerin merkez noktaları
    const startX = boardX + (fromFile + 0.5) * squareSize;
    const startY = boardY + (fromRank + 0.5) * squareSize;
    const endX = boardX + (toFile + 0.5) * squareSize;
    const endY = boardY + (toRank + 0.5) * squareSize;
    
    // Ok stili (kırmızı oklar)
    doc.setDrawColor(255, 0, 0);
    doc.setLineWidth(0.5); // Kalın çizgi
    
    // Çizgi çiz
    doc.line(startX, startY, endX, endY);
    
    // Ok başı çiz
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowSize = squareSize * 0.3; // Ok başı boyutu
    
    // Ok başı için iki çizgi
    const x1 = endX - arrowSize * Math.cos(angle - Math.PI / 6);
    const y1 = endY - arrowSize * Math.sin(angle - Math.PI / 6);
    const x2 = endX - arrowSize * Math.cos(angle + Math.PI / 6);
    const y2 = endY - arrowSize * Math.sin(angle + Math.PI / 6);
    
    doc.line(endX, endY, x1, y1);
    doc.line(endX, endY, x2, y2);
    
    // Çizgi kalınlığını sıfırla
    doc.setLineWidth(0.2);
  });
};

/**
 * Taş paletini çiz
 * @param {jsPDF} doc - jsPDF döküman nesnesi
 * @param {Object} options - Palet seçenekleri
 */
const drawPiecePalette = (doc, {
  x,
  y,
  height,
  moveOrder = 'white',
  scale = 'medium'
}) => {
  // Paletteki taşları belirle (sıradaki oyuncuya göre)
  const pieces = moveOrder === 'white' ? PIECE_SYMBOLS.white : PIECE_SYMBOLS.black;
  
  // Compact ölçek için daha küçük boyutlar
  const pieceSize = scale === 'compact' ? 8 : 10; // Her taşın yüksekliği
  const gap = scale === 'compact' ? 1 : 2; // Taşlar arası boşluk
  
  // Taş tipi isimleri ve sembolleri
  const pieceTypes = [
    { name: 'Şah', symbol: pieces.king, letter: 'Ş' },
    { name: 'Vezir', symbol: pieces.queen, letter: 'V' },
    { name: 'Kale', symbol: pieces.rook, letter: 'K' },
    { name: 'Fil', symbol: pieces.bishop, letter: 'F' },
    { name: 'At', symbol: pieces.knight, letter: 'A' },
    { name: 'Piyon', symbol: pieces.pawn, letter: 'P' }
  ];
  
  // Taşların gösterileceği maksimum sayı hesaplama (compact ölçeği için daha az taş)
  const maxPieces = scale === 'compact' ? 3 : 
                   (height < (pieceTypes.length * (pieceSize + gap)) ? 3 : pieceTypes.length);
  
  // Gösterilecek taşları filtrele
  const piecesToShow = pieceTypes.slice(0, maxPieces);
  
  // Taş paletini çiz
  for (let i = 0; i < piecesToShow.length; i++) {
    const piece = piecesToShow[i];
    const pieceY = y + i * (pieceSize + gap);
    
    // UNICODE karakterler yerine harflerle çiz
    // Taş harfi için arkaplan çemberi
    doc.setFillColor(moveOrder === 'white' ? 240 : 200, moveOrder === 'white' ? 240 : 200, moveOrder === 'white' ? 240 : 200);
    doc.circle(x + 4, pieceY + 4, 4, 'F');
    
    // Taş harfi
    doc.setFontSize(scale === 'compact' ? 6 : 8);
    doc.setFont(FONTS.SANS, 'bold');
    doc.setTextColor(moveOrder === 'white' ? 30 : 0, moveOrder === 'white' ? 30 : 0, moveOrder === 'white' ? 30 : 0);
    doc.text(piece.letter, x + 4, pieceY + 6, { align: 'center' });
    
    // Taş adı
    doc.setFontSize(scale === 'compact' ? 5 : 6);
    doc.setFont(FONTS.SANS, 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(piece.name, x + (scale === 'compact' ? 9 : 10), pieceY + 5);
  }
  
  // Renkleri sıfırla
  doc.setTextColor(0, 0, 0);
};

export default {
  generatePDF
};