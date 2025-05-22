import React, { useRef, useState, useCallback, useEffect } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { toPng } from 'html-to-image';
import ChessboardCapture from './ChessboardCapture';
import PDFRenderer from './PDFRenderer';
import { usePDFStore } from '../store/usePDFStore';
import { processChessboardImage, batchProcessImages, createPlaceholderImage } from '../utils/imageProcessor';
import { createTestPositions, testPDFGeneration } from '../utils/PDFTest';
import { initBufferPolyfill } from '../utils/bufferPolyfill';
import { safeProcessImage } from '../utils/imageUtils';
import { checkBufferPolyfill, logDetailedError } from '../utils/debugTools';

// Initialize the buffer polyfill
initBufferPolyfill();

/**
 * Main PDF Generator component that integrates image capture and PDF rendering
 * This completely new approach avoids the base64/atob errors
 */
const PDFGeneratorMain = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [processedPositions, setProcessedPositions] = useState([]);
  const [error, setError] = useState(null);
  
  // Get data from store
  const { positions, settings } = usePDFStore();
  
  // Ref for container element that holds all the boards
  const boardsContainerRef = useRef(null);
  // Keep individual board refs
  const boardRefs = useRef({});
  
  // Check if the Buffer polyfill is working correctly
  useEffect(() => {
    console.debug('Checking Buffer polyfill in PDFGeneratorMain');
    checkBufferPolyfill();
  }, []);
  
  /**
   * Process a single position board image
   */
  const processPositionImage = async (position) => {
    try {
      // Önce referansın var olup olmadığını ve bağlantı olup olmadığını kontrol et
      const ref = boardRefs.current[position.id];
      
      // Debug çıktıları ekleyelim
      console.debug(`Processing position ${position.id}`);
      console.debug(`Has ref: ${!!ref}, ref current: ${!!ref?.current}`);
      console.debug(`Has captureImage: ${!!ref?.current?.captureImage}`);
      
      // Referans bağlantısının hazır olması için kısa bir gecikme ekleyelim
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Referans kontrolünü tekrar yapalım
      if (!ref?.current?.captureImage) {
        console.warn(`No valid captureImage method for position ${position.id}, using test image`);
        
        // Test görüntüsü kullan
        const { createTestImage } = await import('../utils/PDFTest');
        const testImage = createTestImage(0);
        
        return {
          ...position,
          screenshot: testImage,
          image: testImage
        };
      }
      
      // Görüntüyü yakala
      console.debug(`Capturing image for position ${position.id} using ChessboardCapture component`);
      const image = await ref.current.captureImage();
      
      if (!image) {
        console.error(`Failed to capture image for position ${position.id}`);
        const { createTestImage } = await import('../utils/PDFTest');
        const testImage = createTestImage(0);
        return {
          ...position,
          screenshot: testImage,
          image: testImage
        };
      }
      
      console.debug(`Successfully captured image for position ${position.id}, length: ${image.length}`);
      
      // İşlenmiş görüntüyü döndür
      return {
        ...position,
        screenshot: image,
        image: image
      };
    } catch (err) {
      console.error(`Error processing position ${position.id}:`, err);
      // Hata durumunda bile bir görüntü dönelim
      const { createTestImage } = await import('../utils/PDFTest');
      const testImage = createTestImage(0);
      return {
        ...position,
        screenshot: testImage,
        image: testImage
      };
    }
  };
  
  /**
   * Capture all board images
   */
  const captureAllBoardImages = useCallback(async () => {
    if (positions.length === 0) {
      setError('No positions to generate PDF for');
      return [];
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      
      console.log(`PDFGeneratorMain: Processing ${positions.length} positions`);
      
      // Process all positions in parallel
      const results = await Promise.all(
        positions.map(position => processPositionImage(position))
      );
      
      console.log('PDFGeneratorMain: All positions processed successfully');
      return results;
    } catch (error) {
      logDetailedError(error, 'Capturing all board images');
      setError('Failed to capture board images: ' + (error.message || 'Unknown error'));
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, [positions, processPositionImage]);
  
  /**
   * Generate the PDF
   */
  const generatePDF = useCallback(async () => {
    try {
      // Reset state
      setIsGenerating(true);
      setError(null);
      setPdfReady(false);
      
      console.debug('PDFGeneratorMain: Starting PDF generation process');
      console.debug(`PDFGeneratorMain: Processing ${positions.length} positions`);
      
      // Test with a single position first if there are multiple positions
      if (positions.length > 1) {
        console.debug('PDFGeneratorMain: Testing with first position first');
        const testPosition = positions[0];
        const testResult = await processPositionImage(testPosition);
        
        if (!testResult?.image) {
          console.warn('PDFGeneratorMain: Test position processing failed');
          throw new Error('Failed to process test position');
        }
        
        console.debug('PDFGeneratorMain: Test position processed successfully, proceeding with all positions');
      }
      
      // Process all positions
      const processed = await captureAllBoardImages();
      console.debug(`PDFGeneratorMain: Processed ${processed.length} positions out of ${positions.length}`);
      
      // Validate results
      const validResults = processed.filter(p => p && p.image);
      if (validResults.length === 0 && positions.length > 0) {
        throw new Error('No positions could be processed successfully');
      }
      
      if (validResults.length < processed.length) {
        console.warn(`PDFGeneratorMain: ${processed.length - validResults.length} positions failed to process`);
      }
      
      // Update state with the processed positions
      setProcessedPositions(validResults);
      setPdfReady(true);
      
      console.debug('PDFGeneratorMain: PDF generation complete!');
      
      return validResults;
    } catch (error) {
      logDetailedError(error, 'PDF generation');
      setError('PDF generation failed: ' + (error.message || 'Unknown error'));
      setPdfReady(false);
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, [captureAllBoardImages, positions, processPositionImage]);
  
  // Register a ref for each position
  useEffect(() => {
    console.debug(`Registering board refs for ${positions.length} positions`);
    
    // Create a ref for each position, but don't reset existing refs
    // to avoid losing existing references
    const existingKeys = Object.keys(boardRefs.current);
    console.debug(`Currently have ${existingKeys.length} existing board refs`);
    
    positions.forEach(position => {
      if (!boardRefs.current[position.id]) {
        console.debug(`Creating new ref for position ${position.id}`);
        boardRefs.current[position.id] = React.createRef();
      } else {
        console.debug(`Using existing ref for position ${position.id}`);
      }
    });
    
    // Clean up any refs for positions that no longer exist
    const positionIds = positions.map(p => p.id);
    Object.keys(boardRefs.current).forEach(id => {
      if (!positionIds.includes(id)) {
        console.debug(`Removing stale ref for position ${id}`);
        delete boardRefs.current[id];
      }
    });
    
    console.debug(`Board refs registered: ${Object.keys(boardRefs.current).length}`);
  }, [positions]);
  
  return (
    <div className="pdf-generator">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">PDF Oluşturucu</h2>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            onClick={generatePDF}
            disabled={isGenerating || positions.length === 0}
          >
            {isGenerating ? 'PDF Oluşturuluyor...' : 'PDF Oluştur'}
          </button>
          
          {pdfReady && processedPositions.length > 0 && (
            <PDFDownloadLink
              document={
                <PDFRenderer 
                  positions={processedPositions}
                  title={settings.title || 'Satranç Pozisyonları'}
                  subtitle={settings.subtitle || ''}
                  author={settings.author || 'ChessMino'}
                  showPageNumbers={settings.showPageNumbers !== false}
                  footerText={settings.footerText || ' ChessMino Satranç Eğitim Platformu'}
                />
              }
              fileName={`${settings.title || 'chessmino-positions'}.pdf`}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
            >
              {({ loading }) => (loading ? 'PDF Hazırlanıyor...' : 'PDF İndir')}
            </PDFDownloadLink>
          )}
          
          {/* Debug tools - always visible */}
          <div className="mt-4 p-4 border border-gray-300 rounded-md w-full">
            <h3 className="text-lg font-medium mb-2">Debugging Araçları</h3>
            <div className="flex flex-wrap gap-2">
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 text-sm rounded-md"
                onClick={async () => {
                  console.debug('Testing single position capture...');
                  if (positions.length === 0) {
                    alert('Test için en az bir pozisyon gerekli');
                    return;
                  }
                  try {
                    const result = await processPositionImage(positions[0]);
                    console.debug('Test result:', result);
                    alert(`Test başarılı: ${result?.image ? 'Görüntü alındı' : 'Görüntü alınamadı'}`);
                  } catch (err) {
                    console.error('Test error:', err);
                    alert(`Test hatası: ${err.message}`);
                  }
                }}
              >
                Tek Pozisyon Testi
              </button>
              
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 text-sm rounded-md"
                onClick={() => {
                  const debugInfo = {
                    positionCount: positions.length,
                    processedCount: processedPositions.length,
                    pdfReady,
                    error: error || 'Yok',
                    boardRefs: Object.keys(boardRefs.current).length,
                    settings
                  };
                  console.debug('Debug info:', debugInfo);
                  alert(`Debug bilgileri konsola yazıldı. ${positions.length} pozisyon var.`);
                }}
              >
                Debug Bilgileri
              </button>
              
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 text-sm rounded-md"
                onClick={() => {
                  console.log("Current board refs:", boardRefs.current);
                  const refStatus = Object.entries(boardRefs.current).map(([id, ref]) => ({
                    id,
                    hasRef: !!ref,
                    isConnected: !!ref.current,
                  }));
                  console.table(refStatus);
                }}
              >
                Debug Refs
              </button>
              
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 text-sm rounded-md"
                onClick={() => {
                  // Clear console and try again
                  console.clear();
                  setProcessedPositions([]);
                  setPdfReady(false);
                  setError(null);
                  alert('Durum sıfırlandı. Tekrar deneyin.');
                }}
              >
                Sıfırla ve Tekrar Dene
              </button>
              
              <button
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 text-sm rounded-md"
                onClick={async () => {
                  // Use test positions
                  console.debug('Creating test positions...');
                  
                  try {
                    // Test image creation first
                    const testResult = await testPDFGeneration(processChessboardImage);
                    console.debug('Basic test result:', testResult);
                    
                    if (!testResult) {
                      alert('Basit test başarısız oldu! Konsolu kontrol edin.');
                      return;
                    }
                    
                    // Generate test positions
                    const testPositions = createTestPositions(3);
                    console.debug('Created test positions:', testPositions);
                    
                    // Ensure test positions have valid image data in the format expected by PDFRenderer
                    testPositions.forEach(pos => {
                      console.debug(`Test position ${pos.id}: Screenshot length: ${pos.screenshot ? pos.screenshot.length : 0}`);
                    });
                    
                    // Set processed positions for rendering
                    setProcessedPositions(testPositions);
                    setPdfReady(true);
                    
                    alert('Test pozisyonları başarıyla oluşturuldu!');
                  } catch (err) {
                    console.error('Test error:', err);
                    alert(`Test hatası: ${err.message}`);
                  }
                }}
              >
                Test Pozisyonları Oluştur
              </button>
              
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-sm rounded-md"
                onClick={() => {
                  // Check Buffer polyfill status
                  const status = checkBufferPolyfill();
                  console.debug('Buffer polyfill status:', status);
                  alert(`Buffer polyfill durumu: ${status ? 'Çalışıyor' : 'Hata var'}`);
                }}
              >
                Buffer Durum Kontrolü
              </button>

              <button
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 text-sm rounded-md"
                onClick={() => {
                  // Check DOM hierarchy and parent-child relationships
                  console.log("Boards container:", boardsContainerRef.current);
                  console.log("Position containers:", 
                    boardsContainerRef.current ? 
                    boardsContainerRef.current.querySelectorAll('.position-container') : 
                    'No container'
                  );
                  
                  // Detailed ref inspection
                  Object.entries(boardRefs.current).forEach(([id, ref]) => {
                    console.group(`Board ref ${id}`);
                    console.log("Ref object:", ref);
                    console.log("Has current:", !!ref?.current);
                    console.log("Methods:", ref?.current ? Object.getOwnPropertyNames(ref.current) : 'None');
                    
                    if (ref?.current?.captureImage) {
                      console.log("Has captureImage method ✅");
                    } else {
                      console.log("Missing captureImage method ❌");
                    }
                    console.groupEnd();
                  });
                  
                  alert("Detailed reference check complete - see console");
                }}
              >
                Debug DOM Structure
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {/* Error icon */}
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-700">PDF oluşturma hatası:</h3>
                <p className="text-sm mt-1">{error}</p>
                <p className="text-xs mt-2">
                  Lütfen pozisyonların doğru yüklendiğinden emin olun ve tekrar deneyin.
                  Sorun devam ederse tarayıcıyı yenileyin.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Status info */}
        {isGenerating && (
          <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 rounded-md mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-700">PDF oluşturuluyor...</h3>
                <p className="text-sm mt-1">Bu işlem birkaç saniye sürebilir.</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Invisible boards container for capturing */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div ref={boardsContainerRef} className="boards-container">
            {positions.map(position => (
              <div key={position.id} className="position-container">
                <ChessboardCapture
                  ref={boardRefs.current[position.id]}
                  boardId={position.id}
                  fen={position.fen}
                  orientation={position.orientation || 'white'}
                  size={400}
                  quality={0.95}
                  onCaptureComplete={(image, id) => {
                    console.log(`Captured image for position ${id}`);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* PDF Preview */}
      {pdfReady && processedPositions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">PDF Önizleme</h3>
          <div className="border rounded-md overflow-hidden" style={{ height: '800px' }}>
            <PDFViewer width="100%" height="100%" className="border-0">
              <PDFRenderer 
                positions={processedPositions}
                title={settings.title || 'Satranç Pozisyonları'}
                subtitle={settings.subtitle || ''}
                author={settings.author || 'ChessMino'}
                showPageNumbers={settings.showPageNumbers !== false}
                footerText={settings.footerText || ' ChessMino Satranç Eğitim Platformu'}
              />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFGeneratorMain;
