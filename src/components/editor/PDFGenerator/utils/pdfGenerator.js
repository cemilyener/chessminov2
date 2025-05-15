import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * PDF çalışma sayfası oluşturma yardımcı fonksiyonları
 */

/**
 * Base64 görüntüsünü optimize eder
 * @param {string} base64Image - Base64 formatında görüntü
 * @param {number} maxWidth - Maksimum genişlik (piksel)
 * @param {number} maxHeight - Maksimum yükseklik (piksel)
 * @param {number} quality - JPEG kalitesi (0-1)
 * @returns {Promise<string>} - Optimize edilmiş base64 görüntü
 */
export const optimizeImage = (base64Image, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        // Boyut hesaplama
        let width = img.width;
        let height = img.height;
        
        // Maksimum boyutu aşıyorsa ölçeklendirme yap
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Canvas'a çizim
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white'; // Beyaz arkaplan
        ctx.fillRect(0, 0, width, height);
        
        // Görüntüyü çiz
        ctx.drawImage(img, 0, 0, width, height);
        
        // Optimize edilmiş base64 döndür
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.onerror = () => {
        reject(new Error('Görüntü yüklenemedi'));
      };
      
      img.src = base64Image;
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Ekran görüntüsü alır
 * @param {HTMLElement} element - Ekran görüntüsü alınacak element
 * @param {Object} options - Seçenekler
 * @returns {Promise<string>} - Base64 formatında ekran görüntüsü
 */
export const takeScreenshot = async (element, options = {}) => {
  if (!element) throw new Error('Element bulunamadı');
  
  try {
    // html2canvas dinamik import
    const html2canvas = (await import('html2canvas')).default;
    
    // Oklch renk fonksiyonu hatası için geçici çözüm
    // Kopyalanan elementteki modern renk değerlerini dönüştür
    const preprocessElement = (clonedDoc) => {
      try {
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach(el => {
          // Modern renk fonksiyonlarını standart renklerle değiştir
          if (el.style && el.style.cssText) {
            let newCssText = el.style.cssText;
            
            // oklch() değerlerini varsayılan renklerle değiştir
            if (newCssText.includes('oklch(')) {
              newCssText = newCssText.replace(/oklch\([^)]+\)/g, '#666666');
            }
            
            // lab() değerlerini varsayılan renklerle değiştir
            if (newCssText.includes('lab(')) {
              newCssText = newCssText.replace(/lab\([^)]+\)/g, '#666666');
            }
            
            // lch() değerlerini varsayılan renklerle değiştir
            if (newCssText.includes('lch(')) {
              newCssText = newCssText.replace(/lch\([^)]+\)/g, '#666666');
            }
            
            el.style.cssText = newCssText;
          }
          
          // oklch sınıflarını işle - Tailwind oklch kullanımlarını temizle
          const classList = Array.from(el.classList || []);
          classList.forEach(className => {
            if (className.includes('oklch-') || 
                className.includes('from-oklch-') || 
                className.includes('to-oklch-') ||
                className.includes('via-oklch-')) {
              el.classList.remove(className);
            }
          });
        });
      } catch (e) {
        console.warn('Element ön işleme sırasında hata:', e);
      }
    };
    
    const defaultOptions = {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      removeContainer: false,
      onclone: (clonedDoc) => {
        // Klonlanmış element üzerinde işlem yap
        preprocessElement(clonedDoc);
        
        // Orijinal onclone fonksiyonunu da çağır (eğer varsa)
        if (options.onclone) {
          options.onclone(clonedDoc);
        }
      }
    };
    
    // Önişlem yapılmış element ile ekran görüntüsü al
    const canvas = await html2canvas(element, { ...defaultOptions, ...options });
    const screenshot = canvas.toDataURL('image/png', 1.0);
    
    return screenshot;
  } catch (error) {
    console.error('Ekran görüntüsü alınırken hata:', error);
    throw error;
  }
};

/**
 * PDF dosyası oluşturur
 * @param {Object} data - PDF oluşturma verileri
 * @param {Array} data.positions - Pozisyon dizisi
 * @param {Object} data.settings - PDF ayarları
 * @returns {jsPDF} - jsPDF nesnesi
 */
export const createPDF = (data) => {
  const { positions, settings } = data;
  
  // PDF nesnesi oluştur - Türkçe karakterler için encoding ayarı
  const doc = new jsPDF({
    orientation: settings.orientation || 'portrait',
    unit: 'mm',
    format: settings.pageSize || 'a4'
  });
  
  // Türkçe karakterler için font desteği ekle
  doc.addFont('helvetica', 'normal');
  
  // Yazı tipi boyutları ve türleri
  const fontSizes = {
    title: 18,
    subtitle: 14,
    positionTitle: 12,
    description: 10,
    footer: 9
  };
  
  // PDF boyutları
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Başlık
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontSizes.title);
  doc.text(settings.title || 'Satranç Çalışma Sayfası', pageWidth / 2, 15, { align: 'center' });
  
  // Yazar/Okul bilgisi
  if (settings.author || settings.schoolName) {
    doc.setFontSize(10);
    const infoText = [
      settings.author && `Hazırlayan: ${settings.author}`,
      settings.schoolName && `Okul: ${settings.schoolName}`
    ].filter(Boolean).join(' | ');
    
    doc.text(infoText, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }
  
  // Logo ekleme (varsa)
  if (settings.schoolLogo) {
    try {
      doc.addImage(settings.schoolLogo, 'PNG', 15, 10, 20, 20);
    } catch (error) {
      console.error('Logo eklenirken hata:', error);
    }
  }
  
  // Pozisyonları düzenle
  const layoutConfig = {
    '1': { cols: 1, rows: 1 },
    '2': { cols: 1, rows: 2 },
    '4': { cols: 2, rows: 2 },
    '6': { cols: 2, rows: 3 },
    '8': { cols: 2, rows: 4 }
  };
  
  const layout = layoutConfig[settings.layoutType] || layoutConfig['6'];
  const positionsPerPage = layout.cols * layout.rows;
  
  // Sayfa içi kenar boşlukları
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  const contentHeight = pageHeight - (2 * margin) - 35; // Başlık ve alt bilgi için ek boşluk
  
  // Her pozisyon için boyutlar
  const cellWidth = contentWidth / layout.cols;
  const cellHeight = contentHeight / layout.rows;
  
  // Pozisyonları yerleştir
  positions.forEach((position, index) => {
    // Yeni sayfa gerekiyor mu?
    if (index > 0 && index % positionsPerPage === 0) {
      doc.addPage();
    }
    
    // Pozisyonun sayfadaki konumu
    const posIndexOnPage = index % positionsPerPage;
    const col = posIndexOnPage % layout.cols;
    const row = Math.floor(posIndexOnPage / layout.cols);
    
    const x = margin + (col * cellWidth);
    const y = margin + (row * cellHeight) + 25; // Başlık için ek boşluk
    
    // Her pozisyonun hamle sırası
    const moveOrder = position.moveOrder || 'white';
    const moveText = moveOrder === 'white' ? 'Hamle: Beyaz' : 'Hamle: Siyah';
    
    // Pozisyon başlığı - Türkçe karakter desteği ile
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fontSizes.positionTitle);
    doc.text(
      position.title || `Pozisyon ${index+1}`, 
      x + (cellWidth / 2), 
      y - 10, 
      { align: 'center' }
    );
    
    // Hamle göstergesi (metin olarak)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSizes.description);
    doc.text(moveText, x + (cellWidth / 2), y - 4, { align: 'center' });        // Pozisyon görüntüsü
    if (position.screenshot) {
      try {
        // KARE TAHTA OLARAK AYARLA - ÖNEMLİ DEĞİŞİKLİK
        // Kare boyutunu hem genişlik hem yükseklik için aynı değerle hesapla
        const squareSize = Math.min(cellWidth * 0.9, cellHeight * 0.6);
        
        // Tahtayı merkeze hizala
        const imageX = x + (cellWidth - squareSize) / 2;
        const imageY = y;
        
        // KARE şeklinde ekle (genişlik = yükseklik - aynı değer kullanılıyor)
        doc.addImage(position.screenshot, 'PNG', imageX, imageY, squareSize, squareSize);
        
        // Açıklama için Y konumu - artık kare olduğundan squareSize kullanılıyor
        const descY = imageY + squareSize + 5;
        
        // Açıklama - Türkçe karakter desteği ile
        if (position.description) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(fontSizes.description);
          
          const splitDesc = doc.splitTextToSize(
            position.description,
            cellWidth * 0.9
          );
          
          doc.text(splitDesc, x + (cellWidth / 2), descY, { 
            align: 'center',
            maxWidth: cellWidth * 0.9
          });
        }
      } catch (error) {
        console.error(`Pozisyon ${index+1} eklenirken hata:`, error);
        // Hata kodları...
      }
    } else {
      // Görüntü yoksa FEN göster
      doc.setFontSize(10);
      doc.text(`FEN: ${position.fen || 'Mevcut değil'}`, x + (cellWidth / 2), y + 20, { 
        align: 'center',
        maxWidth: cellWidth * 0.9
      });
    }
  });
  
  return doc;
};