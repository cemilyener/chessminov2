import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import usePDFStore from '../../store/usePDFStore';
import { ExtendedChess } from '../../utils/chess/ExtendedChess';
import { useNavigate } from 'react-router-dom';
import WorkflowExplanation from '../editor/PDFGenerator/components/WorkflowExplanation';
import './ChessWorksheet.css';

// Default positions with starting position if none are provided
const defaultPositions = [{
  id: 'default-1',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  title: 'Başlangıç Pozisyonu',
  description: 'Satranç oyununun başlangıç pozisyonu'
}];

/**
 * ChessWorksheet component displays chess positions in a printable layout.
 * It arranges 6 positions in a grid layout and provides print functionality.
 */
const ChessWorksheet = () => {  const { positions, pageTitle, fileName, clearAll } = usePDFStore();
  const [boardWidth, setBoardWidth] = useState(180);
  const [worksheetPositions, setWorksheetPositions] = useState([]);
  const [showPlaceholders, setShowPlaceholders] = useState(true);
  const navigate = useNavigate();
  const contentRef = useRef(null);  // Initialize positions - use store positions or defaults if none are available
  useEffect(() => {
    console.log('ChessWorksheet: Processing positions', positions?.length || 0);
    
    try {
      // Process positions from store or use defaults
      if (positions && positions.length > 0) {
        console.log('ChessWorksheet: Using positions from store');
        
        // Validate positions and filter out any invalid ones
        const validPositions = positions.filter(p => p && p.fen);
        console.log(`ChessWorksheet: Found ${validPositions.length} valid positions out of ${positions.length}`);
        
        // Limit to 6 positions for the worksheet
        let displayPositions = validPositions.slice(0, 6);
        
        // If we have fewer than 6 positions and placeholders are enabled, pad with empty positions
        if (displayPositions.length < 6 && showPlaceholders) {
          const emptyCount = 6 - displayPositions.length;
          console.log(`ChessWorksheet: Adding ${emptyCount} placeholder positions`);
          
          for (let i = 0; i < emptyCount; i++) {
            displayPositions.push({
              id: `empty-${i}`,
              fen: '8/8/8/8/8/8/8/8 w - - 0 1',
              title: 'Empty Position',
              description: 'This position is empty. Add more positions in the editor.',
              isEmpty: true
            });
          }
        } else if (!showPlaceholders) {
          // Filter out any placeholder positions if they were previously added
          displayPositions = displayPositions.filter(position => !position.isEmpty);
          console.log(`ChessWorksheet: Filtered placeholders, now showing ${displayPositions.length} positions`);
        }
        
        setWorksheetPositions(displayPositions);
      } else {
        console.log('ChessWorksheet: No positions found, using defaults');
        
        // Create default positions if none exist
        const defaultSet = [...defaultPositions];
        
        if (showPlaceholders) {
          while (defaultSet.length < 6) {
            defaultSet.push({
              id: `default-${defaultSet.length + 1}`,
              fen: '8/8/8/8/8/8/8/8 w - - 0 1',
              title: 'Empty Position',
              description: 'Add positions in the editor to replace this placeholder.',
              isEmpty: true
            });
          }
        }
        
        setWorksheetPositions(defaultSet);
      }
    } catch (error) {
      console.error('ChessWorksheet: Error processing positions:', error);
      // Fallback to default positions in case of any error
      setWorksheetPositions([...defaultPositions]);
    }
  }, [positions, showPlaceholders]);

  // Setup responsive board sizes
  useEffect(() => {
    const handleResize = () => {
      // For a 6-position grid, we want smaller boards than for a single board view
      const containerWidth = Math.min(window.innerWidth - 48, 900); // Max width with margin
      const calculatedWidth = Math.floor((containerWidth / 2) - 32); // 2 columns, with margin
      setBoardWidth(calculatedWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Function to create a valid Chess instance with a FEN string
  const createValidChess = (fen) => {
    try {
      return new ExtendedChess(fen, { bypass: [10] });
    } catch (error) {
      console.error("Invalid FEN:", error);
      return new ExtendedChess();
    }
  };  
    // Print the worksheet - wrapped in useCallback to prevent recreation on every render
  const handlePrint = useCallback(() => {
    // Yazdırma için tahtaları büyüt
    setBoardWidth(140); // Daha büyük tahta
    
    // Kısa bir gecikme ile yazdırma işlemi başlat
    setTimeout(() => {
      window.print();
    }, 300);
  }, [setBoardWidth]);  // Go back to editing positions - wrapped in useCallback
  const handleBack = useCallback(() => {
    // Basitleştirilmiş FEN Generator'a dön
    console.log('FEN Generator sayfasına dönülüyor');
    navigate('/fen-generator');
  }, [navigate]);
    // Add keyboard shortcuts for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl+P for Print
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
      
      // Escape for Back
      if (e.key === 'Escape') {
        handleBack();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrint, handleBack]);

  // Clear all positions and start fresh
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all positions? This will remove all positions from both the Worksheet and PDF Generator.')) {
      // Clear all positions from the store
      clearAll();
      
      // Show feedback to user
      alert('All positions have been cleared. You can now create new positions in the PDF Generator.');
      
      // Redirect to PDF Generator to create new positions
      navigate('/pdf-generator');
    }
  };

  return (
    <div className="chess-worksheet">      {/* Non-printable controls */}
      <div className="screen-only mb-6">
        <WorkflowExplanation currentStep={3} />
      </div>
      
      <div className="controls bg-white p-4 rounded-lg shadow-md mb-6 screen-only">
        <div className="flex justify-between items-center mb-4">
          <div>
            <input 
              type="text"
              value={pageTitle}
              onChange={(e) => usePDFStore.setState({ pageTitle: e.target.value })}
              className="text-2xl font-bold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent px-1"
              placeholder="Worksheet Title"
            />
          </div>          <div className="space-x-2">            <button              onClick={handleBack} 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center"
              title="Go back to PDF Generator (Shortcut: Esc)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>              Pozisyon Düzenleme
            </button>
            <button 
              onClick={handleClear} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hepsini Temizle
            </button>            <button              onClick={handlePrint} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              title="PDF oluştur (Kısayol: Ctrl+P veya ⌘+P)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              PDF Oluştur
            </button>
          </div>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-2">          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showPlaceholders} 
              onChange={() => setShowPlaceholders(!showPlaceholders)}
              className="form-checkbox h-5 w-5 text-blue-600"
              aria-label="Show placeholders for empty positions"
              title="Toggle placeholder positions (Tab to focus, Space to toggle)"
            />            <span className="ml-2 text-gray-700">Boş pozisyonlar için yer tutucu göster</span>
          </label>
          
          <div className="flex space-x-4 items-center">
            <label className="text-gray-700 flex items-center cursor-pointer">
              <span className="mr-2">Kenarlık stili:</span>
              <select 
                className="form-select py-1 px-2 border border-gray-300 rounded"
                onChange={(e) => {
                  const style = e.target.value;
                  const items = document.querySelectorAll('.position-item');
                  items.forEach(item => {
                    item.className = `position-item ${style}`;
                  });
                }}
              >
                <option value="border border-gray-200">İnce</option>
                <option value="border-2 border-gray-300">Orta</option>
                <option value="border-2 border-black">Kalın</option>
                <option value="border border-dashed border-gray-400">Kesikli</option>
              </select>
            </label>
          </div>
        </div>          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700">
          <p className="font-medium">PDF Oluşturma Talimatları:</p>
          <ul className="list-disc ml-5 mt-2">
            <li>'PDF Oluştur' düğmesine tıklayarak yazdırma penceresini açın</li>
            <li>Yazdırma penceresinde <strong>"PDF olarak kaydet"</strong> seçeneğini kullanın</li>
            <li>En iyi sonuçlar için kağıt yönünü 'Dikey' olarak ayarlayın</li>
            <li>Tarayıcı yazdırma ayarlarında üst ve alt bilgileri devre dışı bırakın</li>
            <li>A4 kağıt boyutunu kullanmanız önerilir</li>
            <li>Yazdırmadan önce öğrenci adı ve tarih alanlarını doldurun</li>
          </ul>
            <div className="mt-3 pt-2 border-t border-blue-200">
            <p className="font-medium">Çalışma Adımları:</p>
            <ol className="list-decimal ml-5 mt-2">
              <li><strong>Pozisyon Düzenleme</strong> ekranında 6 satranç pozisyonu oluşturun</li>
              <li>Buradaki ayarları istediğiniz şekilde özelleştirin</li>
              <li><strong>PDF Oluştur</strong> düğmesi ile PDF oluşturun veya yazdırın</li>              <li>Gerekirse değişiklikler için <strong>Pozisyon Düzenleme</strong> sayfasına geri dönün</li>
            </ol>
          </div>
            <div className="mt-4 pt-3 border-t border-blue-200">
            <p className="font-medium">İpuçları:</p>
            <ul className="list-disc ml-5 mt-2">
              <li>Her sayfaya en fazla 6 satranç pozisyonu sığdırabilirsiniz</li>
              <li>Daha az pozisyon kullanıyorsanız, boş yer tutucuları kapatabilirsiniz</li>
              <li>Öğretim stilinize uygun farklı kenarlık stilleri seçebilirsiniz</li>
              <li>Yazdırmadan önce öğrenci adı ve tarih alanlarını doldurmayı unutmayın</li>
            </ul>
            
            <p className="mt-3 text-sm text-blue-600">
              <a href="/docs/WorksheetGuide.md" target="_blank" className="flex items-center hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Çalışma Sayfası Rehberini Oku
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Printable content */}      <div 
        ref={contentRef} 
        className="printable-content bg-white p-4 rounded-lg shadow-md print-container"
      >
        {/* Title - will be visible in print */}        <h1 className="text-3xl font-bold text-center mb-1 print:text-lg">{pageTitle || "Satranç Çalışma Sayfası"}</h1>
        <p className="text-center mb-1 print:mb-0 print:text-sm">Mate in 1 move.</p>
        
        {/* Student information - will be visible in print */}        <div className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-0">
          <div className="mb-2 sm:mb-0 w-full sm:w-1/2 pr-4">
            <label className="block text-sm font-medium text-gray-700 print:font-bold">Öğrenci Adı:</label>
            <div className="mt-1 print:mt-0">
              <input
                type="text"
                className="shadow-sm border-b-2 border-gray-300 w-full print:border-0 print:border-b-2 print:border-black print:h-5"
                placeholder="Adınızı buraya yazın"
              />
            </div>
          </div>
          <div className="w-full sm:w-1/3">
            <label className="block text-sm font-medium text-gray-700 print:font-bold">Tarih:</label>
            <div className="mt-1 print:mt-0">
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="shadow-sm border-b-2 border-gray-300 print:border-0 print:border-b-2 print:border-black print:h-5 w-full"
              />
            </div>
          </div>
        </div>{/* Instructions - visible in both screen and print */}        <div className="mb-1 border-l-4 border-gray-300 pl-2 print:border-black bg-gray-50 py-0">
          <p className="text-xs text-gray-700 print:text-black print:font-medium print:text-xs">
            <strong>Talimatlar:</strong> Her satranç pozisyonunu dikkatle inceleyin. Her pozisyon için en iyi hamleyi düşünün veya açıklamasında belirtilen soruyu yanıtlayın. 
            Cevaplarınızı her diyagramın altındaki boşluğa yazın.
          </p>
        </div>{/* Chess positions grid */}
        {worksheetPositions.length > 0 ? (
          <div className="positions-grid grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-5">
            {worksheetPositions.map((position, index) => {
              const chess = createValidChess(position.fen);
              return (                <div key={position.id || index} className="position-item border border-gray-200">                  <div className="mb-0 flex justify-between items-baseline border-b pb-0 print:pb-0">
                    <h2 className="text-lg font-bold print:text-xs">{index + 1}</h2>
                    <div className="print:hidden text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded print:text-xs">
                      {chess && chess._turn === 'w' ? 'Beyaz oynar' : 'Siyah oynar'}
                    </div>
                  </div>                    <div className="board-container flex justify-center py-0 print:py-0">
                    <div className="chess-board my-0 print:my-0">                      <Chessboard 
                        position={position.fen}
                        boardWidth={boardWidth}
                        areArrowsAllowed={false}
                        arePiecesDraggable={false}
                        customDarkSquareStyle={{ backgroundColor: '#b58863' }}
                        customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                        boardStyle={{ margin: "0 auto" }}
                      />
                    </div>
                  </div>                  {position.description && (
                    <div className="mt-0 p-0 bg-gray-50 text-xs border-t description print:text-xxs">
                      {position.description}
                    </div>
                  )}{/* Student answer area - only visible in print for non-empty positions */}
                  {!position.isEmpty && (
                    <div className="hidden print:block mt-0 border-t pt-0">
                      <div className="text-xxs text-gray-500 mb-0 print:text-xxs">Cevabınız:</div>
                      <div className="border-b border-dashed border-gray-400 h-2"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600">Henüz pozisyon eklenmemiş.</p>
            <p className="mt-2 text-gray-500">
              Satranç pozisyonları eklemek için pozisyon düzenleme ekranına geri dönün.
            </p>
          </div>
        )}          {/* Teacher notes section - visible when printing */}        <div className="mt-1 pt-0 border-t border-gray-300 hidden print:block">
          <div className="mb-1">
            <h3 className="text-xs font-bold mb-0">Öğretmen Notları:</h3>
            <div className="border-b border-gray-300 h-3"></div>
          </div>
        </div>
        
        {/* Footer with page info - will show in print */}
        <div className="mt-1 pt-0 border-t border-gray-300 text-center text-xs text-gray-500">
          <p className="text-xxs">{fileName} - ChessMino ile oluşturuldu © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default ChessWorksheet;


