import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import usePDFStore from '../../../../store/usePDFStore';
import { DEFAULT_SETTINGS } from '../utils/constants';
import PDFGeneratorMain from './PDFGeneratorMain';
import { Link, useNavigate } from 'react-router-dom';
import { sanitizeBase64Image } from '../utils/imageUtils';
import { jsPDF } from 'jspdf';

// Simple PDF creation function for the component
const createPDF = async ({ positions, settings }) => {
  try {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add content (simplified version)
    doc.setFont('helvetica');
    doc.setFontSize(16);
    doc.text('Chess Positions', 105, 20, { align: 'center' });
    
    // Return the document for further processing
    return doc;
  } catch (error) {
    console.error('Error creating PDF:', error);
    throw error;
  }
};

const PDFPreview = () => {
  const positions = usePDFStore((state) => state.positions);
  const settings = usePDFStore((state) => state.settings);
  const { setPositionsForWorksheet } = usePDFStore();
  const navigate = useNavigate();
  const [validPositions, setValidPositions] = useState([]);
  const [hasInvalidImages, setHasInvalidImages] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const blobUrlRef = useRef(null);
  // Gelişmiş doğrulama ve temizleme ile pozisyonları işle - asenkron versiyon
  useEffect(() => {
    let isMounted = true; // Bileşen unmount kontrolü
    
    console.log(`PDF Önizleme: ${positions.length} pozisyon işleniyor...`);
    
    const processImages = async () => {
      try {
        if (positions.length === 0) {
          console.log('PDF Önizleme: İşlenecek pozisyon yok');
          if (isMounted) {
            setValidPositions([]);
            setHasInvalidImages(false);
          }
          return;
        }
        
        console.log('PDF Önizleme: Görüntüleri işleniyor...');
        
        // Her pozisyon için asenkron görüntü işleme
        const positionPromises = positions.map(async (position, index) => {
          if (!position || !position.screenshot) {
            console.warn(`PDF Önizleme: Pozisyon #${index} geçersiz veya screenshot yok`);
            return null;
          }
          
          try {
            // Asenkron temizleme ve onarma girişimi
            console.log(`PDF Önizleme: Pozisyon #${index} görüntüsü temizleniyor...`);
            const cleanedScreenshot = await sanitizeBase64Image(position.screenshot);
            
            if (!cleanedScreenshot) {
              console.warn(`PDF Önizleme: Pozisyon #${index} için geçerli görüntü oluşturulamadı`);
              return null;
            }
            
            // Temiz screenshot ile pozisyonu döndür
            console.log(`PDF Önizleme: Pozisyon #${index} başarıyla işlendi`);
            return {
              ...position,
              screenshot: cleanedScreenshot
            };
          } catch (e) {
            console.warn(`PDF Önizleme: Pozisyon #${index} işleme hatası:`, e.message);
            return null;
          }
        });
        
        // Tüm işlemler tamamlandığında
        const processedPositions = (await Promise.all(positionPromises)).filter(Boolean);
        console.log(`PDF Önizleme: ${positions.length} pozisyondan ${processedPositions.length} tanesi başarıyla işlendi`);
        
        // Bileşen hala mount edilmişse, state güncelle
        if (isMounted) {
          setValidPositions(processedPositions);
          setHasInvalidImages(positions.length !== processedPositions.length);
          
          if (positions.length !== processedPositions.length) {
            console.warn(`PDF Önizleme: ${positions.length - processedPositions.length} pozisyon işlenemedi`);
          }
        }
      } catch (error) {
        console.error('PDF Önizleme: Pozisyon işleme hatası:', error);
        if (isMounted) {
          setPdfError('Görüntüler işlenirken hata oluştu: ' + error.message);
        }
      }
    };
    
    processImages();
    
    // Cleanup
    return () => {
      console.log('PDF Önizleme: Bileşen unmount oldu, işlemler temizleniyor');
      isMounted = false;
    };
  }, [positions]);
    // PDF oluşturma işlemi - Asenkron işlemle PDF oluşturuyor
  useEffect(() => {
    // Önceki blob'u temizle
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    
    if (validPositions.length === 0) {
      setPdfBlob(null);
      return;
    }
    
    let isMounted = true; // Komponent unmount olması durumu için kontrol
    
    const createPdfAsync = async () => {
      console.log('PDF Önizleme: PDF oluşturma başlatılıyor...');
      setIsGenerating(true);
      setPdfError(null);
      
      try {
        console.log(`PDF Önizleme: ${validPositions.length} pozisyon ile PDF oluşturuluyor...`);
        
        // PDF oluştur - Asenkron createPDF fonksiyonu ile
        const doc = await createPDF({ 
          positions: validPositions, 
          settings: {
            ...settings,
            // WhatsApp optimizasyonu için compress parametresi ekle
            compress: settings.optimizeForWhatsApp || true
          } 
        }).catch(error => {
          console.error('PDF Önizleme: PDF oluşturma promise hatası:', error);
          throw error; // Hatayı yukarı ilet
        });
        
        if (!isMounted) {
          console.log('PDF Önizleme: Bileşen unmount olmuş, işlem durduruldu');
          return;
        }
        
        if (!doc) {
          console.error('PDF Önizleme: PDF dokümanı oluşturulamadı (null döndü)');
          throw new Error('PDF dokümanı oluşturulamadı');
        }
        
        console.log('PDF Önizleme: PDF başarıyla oluşturuldu, blob hazırlanıyor...');
        
        try {
          // Blob oluştur
          const blob = doc.output('blob');
          const url = URL.createObjectURL(blob);
          
          console.log('PDF Önizleme: Blob URL başarıyla oluşturuldu');
          
          // Referansı sakla (cleanup için)
          if (isMounted) {
            blobUrlRef.current = url;
            setPdfBlob(url);
          }
        } catch (blobError) {
          console.error('PDF Önizleme: Blob oluşturma hatası:', blobError);
          throw new Error(`PDF blob oluşturulamadı: ${blobError.message}`);
        }
      } catch (error) {
        console.error('PDF Önizleme: PDF oluşturma hatası:', error);
        if (isMounted) {
          setPdfError(`PDF oluşturulamadı: ${error.message}`);
        }
      } finally {
        console.log('PDF Önizleme: PDF oluşturma işlemi tamamlandı');
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    };
    
    createPdfAsync();
      // Cleanup
    return () => {
      isMounted = false; // Bileşen unmount oldu, state güncelleme yapılmamalı
      
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [validPositions, settings]);
  
  // Dosya adı oluştur
  const generateFilename = useCallback(() => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
    const author = (settings.author || '').replace(/\s+/g, '') || 'ChessMino';
    
    return `ChessMino_${author}_${dateStr}_${timeStr}.pdf`;
  }, [settings.author]);  // PDF indirme işlemi - Geliştirilmiş hata yakalama ve işleme
  const downloadPDF = useCallback(async () => {
    console.log('PDF Önizleme: PDF indirme işlemi başlatılıyor...');
    try {
      if (validPositions.length === 0) {
        console.warn('PDF Önizleme: İndirme için geçerli pozisyon yok');
        setPdfError('İndirme için geçerli pozisyon bulunamadı');
        return;
      }
      
      setIsGenerating(true);
      setPdfError(null);
      
      console.log(`PDF Önizleme: ${validPositions.length} pozisyon ile PDF oluşturuluyor...`);
      
      // Asenkron olarak PDF oluştur - hata yakalama ile
      let doc;
      try {
        doc = await createPDF({ 
          positions: validPositions, 
          settings: {
            ...settings,
            compress: settings.optimizeForWhatsApp || true
          } 
        });
      } catch (pdfError) {
        console.error('PDF Önizleme: PDF oluşturma hatası:', pdfError);
        throw new Error(`PDF oluşturulamadı: ${pdfError.message}`);
      }
      
      // PDF nesnesini kontrol et
      if (!doc) {
        console.error('PDF Önizleme: PDF nesnesi boş döndü');
        throw new Error('PDF dokümanı boş');
      }
      
      // Doğrudan indir
      try {
        console.log('PDF Önizleme: PDF indirme işlemi başlatılıyor');
        doc.save(generateFilename());
        console.log('PDF Önizleme: PDF başarıyla indirildi');
      } catch (saveError) {
        console.error('PDF Önizleme: PDF indirme hatası:', saveError);
        throw new Error(`PDF indirme hatası: ${saveError.message}`);
      }
    } catch (error) {
      console.error('PDF Önizleme: Genel indirme hatası:', error);
      setPdfError('PDF indirilemedi: ' + error.message);
    } finally {
      console.log('PDF Önizleme: İndirme işlemi tamamlandı');
      setIsGenerating(false);
    }
  }, [validPositions, settings, generateFilename]);

  const goToWorksheet = () => {
    // Transfer valid positions to worksheet store
    if (validPositions && validPositions.length > 0) {
      console.log(`Transferring ${validPositions.length} positions to worksheet`);
      setPositionsForWorksheet(validPositions);
    } else {
      console.warn('No valid positions to transfer to worksheet');
      // If no valid positions, still transfer whatever we have to avoid empty worksheet
      setPositionsForWorksheet(positions.filter(pos => pos && pos.fen));
    }
    
    // Navigate to worksheet page
    navigate('/worksheet');
  };

  if (!validPositions.length) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
        {positions.length > 0 ? 
          'Geçerli pozisyon bulunamadı. Pozisyonları tekrar ekleyin.' : 
          'Önizleme için en az bir pozisyon ekleyin.'
        }
      </div>
    );
  }

  return (
    <div className="pdf-preview flex flex-col h-full">      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">PDF Önizleme</h3>        <div className="space-x-2">          {validPositions.length > 0 && !isGenerating && (
            <>
              <div className="flex flex-col items-end">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 mb-2 rounded-md flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {validPositions.length} {validPositions.length === 1 ? 'position' : 'positions'} ready
                </span>
                <button
                  onClick={goToWorksheet}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center"
                  title="Go to printable worksheet view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Yazdırılabilir Çalışma Sayfası
                </button>
              </div>
              
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                disabled={isGenerating}
              >
                {isGenerating ? 'İşleniyor...' : 'Doğrudan İndir'}
              </button>
              
              {pdfBlob && (
                <a
                  href={pdfBlob}
                  download={generateFilename()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  PDF İndir
                </a>
              )}
            </>
          )}
          {isGenerating && (
            <span className="inline-flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              PDF Hazırlanıyor...
            </span>
          )}
        </div>
      </div>
      
      {hasInvalidImages && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                {positions.length !== validPositions.length ? 
                  `Bazı pozisyonlar geçersiz görüntüler içeriyor ve onarıldı veya atlandı. Toplam: ${positions.length}, Geçerli: ${validPositions.length}` :
                  'Tüm pozisyonlar başarıyla işlendi.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
      
      {pdfError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{pdfError}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 border border-gray-300 rounded">
        {pdfBlob ? (
          <iframe 
            src={pdfBlob} 
            width="100%" 
            height="100%" 
            className="rounded" 
            title="PDF Önizleme"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {isGenerating ? (
              <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>PDF yükleniyor...</p>
              </div>
            ) : validPositions.length > 0 ? (
              'PDF hazırlanıyor...'
            ) : (
              'Önizleme için en az bir pozisyon ekleyin.'
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(PDFPreview);