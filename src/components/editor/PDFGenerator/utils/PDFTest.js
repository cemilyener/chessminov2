/**
 * PDFTest.js - Test utilities for PDF generation
 * 
 * This file contains helper functions for testing the PDF generation process
 * to diagnose base64/atob errors and ensure the solution works correctly.
 */

const testFens = [
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',  // Başlangıç pozisyonu
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',  // İtalyan açılışı
  'rnbqkb1r/pp1ppppp/5n2/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3'   // Sicilya savunması
];

/**
 * Creates test positions with placeholder images for testing PDF generation
 * @param {number} count - Number of positions to create
 * @returns {Array} - Array of position objects
 */
export const createTestPositions = (count = 3) => {
  console.debug('PDFTest: Creating', count, 'test positions');
  const positions = [];
  
  for (let i = 0; i < count; i++) {
    console.debug('PDFTest: Creating test image', i);
    const testImage = createTestImage(i);
    
    const position = {
      id: `test-position-${i+1}`,
      title: `Test Position ${i+1}`,
      description: `This is a test position for debugging PDF generation. This position includes various testing elements.`,
      fen: testFens[i % testFens.length],
      orientation: i % 2 === 0 ? 'white' : 'black',
      moveOrder: i % 2 === 0 ? 'white' : 'black',
      // Hem screenshot hem de image özelliğini ekle
      screenshot: testImage,
      image: testImage
    };
    
    positions.push(position);
  }
  
  return positions;
};

/**
 * Creates a test image for a position
 * @param {number} index - Index to create variation
 * @returns {string} - Base64 image string
 */
export const createTestImage = (index = 0) => {
  try {
    // Canvas oluştur
    const canvas = document.createElement('canvas');
    const size = 400; // Daha büyük boyut
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Tahta arkaplanı
    ctx.fillStyle = '#E8C090'; // Tahta rengi
    ctx.fillRect(0, 0, size, size);
    
    // Kareler çiz - 8x8 satranç tahtası
    const squareSize = size / 8;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          ctx.fillStyle = '#B58863'; // Koyu kareler
          ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
        }
      }
    }
    
    // Bazı taşları ekleyin (basit çember ve kareler)
    for (let i = 0; i < 8; i++) {
      // Beyaz taşlar (alt satır)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(i * squareSize + squareSize/2, 7 * squareSize + squareSize/2, squareSize/3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Siyah taşlar (üst satır)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(i * squareSize + squareSize/2, 0 * squareSize + squareSize/2, squareSize/3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    
    // Test metni ekle
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Test Board ${index + 1}`, size/2, size/2);
    
    // Base64 formatına dönüştür
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    console.debug('PDFTest: Successfully created test image');
    console.debug('PDFTest: Test image length:', dataUrl.length);
    console.debug('PDFTest: Test image starts with:', dataUrl.substring(0, 30) + '...');
    
    return dataUrl;
  } catch (err) {
    console.error('Test image creation error:', err);
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  }
};

/**
 * Tests the PDF generation process end-to-end with a simple test position
 * @param {Function} processImage - Image processing function
 * @returns {Promise<boolean>} - Whether the test was successful
 */
export const testPDFGeneration = async (processImage) => {
  console.debug('PDFTest: Running end-to-end PDF generation test');
  
  try {
    // Create a test image
    const testImage = createTestImage(0);
    console.debug('PDFTest: Successfully created test image');
    console.debug(`PDFTest: Test image length: ${testImage ? testImage.length : 0}`);
    console.debug(`PDFTest: Test image starts with: ${testImage ? testImage.substring(0, 30) + '...' : 'empty'}`);
    
    // Process the image
    if (typeof processImage === 'function') {
      const processedImage = await processImage(testImage);
      console.debug('PDFTest: Successfully processed test image');
      console.debug(`PDFTest: Processed image length: ${processedImage ? processedImage.length : 0}`);
      console.debug(`PDFTest: Processed image starts with: ${processedImage ? processedImage.substring(0, 30) + '...' : 'empty'}`);
      
      // Validate the result
      if (!processedImage || typeof processedImage !== 'string' || !processedImage.startsWith('data:image/')) {
        console.error('PDFTest: Processing returned invalid result');
        return false;
      }
      
      return true;
    } else {
      console.error('PDFTest: No processing function provided');
      return false;
    }
  } catch (error) {
    console.error('PDFTest: Test failed with error:', error);
    return false;
  }
};

// CSS should be moved to a separate CSS file, not included in JavaScript
// /* Tahtanın tam boyutta görünmesini sağla */
// .board-container {
//   width: 100% !important;
//   height: 100% !important;
//   overflow: hidden !important;
// }
//
// .chessboard-wrapper {
//   display: block !important;
//   width: 400px !important; 
//   height: 400px !important;
//   position: relative !important;
// }
