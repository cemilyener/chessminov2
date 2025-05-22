// filepath: c:\Users\PC\Desktop\chessminov2\src\components\editor\PDFGenerator\utils\imageUtils.js
/**
 * Base64 görüntü verilerini temizler ve onarır - Canvas tabanlı güvenli yaklaşım
 * @param {string} base64String - İşlenecek base64 string
 * @returns {Promise<string>} - Temizlenmiş base64 string veya placeholder
 */
export const sanitizeBase64Image = async (base64String) => {
  // 1. Temel kontroller - her zaman string dönmesini sağla
  if (!base64String) {
    console.warn('ImageUtils: Base64 string geçersiz veya boş');
    return getPlaceholderImage();
  }
  
  // String değilse dönüştürmeye çalış
  if (typeof base64String !== 'string') {
    try {
      console.warn('ImageUtils: Base64 string değil, dönüştürülüyor');
      base64String = String(base64String);
    } catch (e) {
      console.error('ImageUtils: String dönüşümü başarısız:', e.message);
      return getPlaceholderImage();
    }
  }
  
  // Görüntünün ilk 50 karakterini loglayalım (debugging için)
  try {
    const preview = base64String.substring(0, 50) + '...';
    console.log(`ImageUtils: Base64 işleniyor: ${preview}`);
  } catch (e) {
    console.warn('ImageUtils: Base64 önizleme hatası:', e.message);
    return getPlaceholderImage();
  }
  
  // Format kontrolü
  if (!base64String.startsWith('data:image/')) {
    console.warn('ImageUtils: Geçersiz format, data:image/ ile başlamıyor');
    return getPlaceholderImage();
  }
  
  try {
    // Canvas üzerinden görüntü oluştur, böylece atob() hatasını önle
    const result = await convertBase64ViaCanvas(base64String);
    
    if (result && typeof result === 'string' && result.startsWith('data:image/')) {
      console.log('ImageUtils: Görüntü başarıyla temizlendi');
      return result;
    } else {
      console.warn('ImageUtils: Temizleme başarısız, sonuç geçersiz');
      return getPlaceholderImage();
    }
  } catch (e) {
    console.warn('ImageUtils: Base64 görüntü dönüşümü başarısız:', e.message);
    return getPlaceholderImage();
  }
};

/**
 * Base64 görüntüyü Canvas üzerinden geçirerek temizler
 * atob() kullanmadan çalışır, tarayıcının görüntü işleme yeteneklerini kullanır
 * @param {string} base64Str - İşlenecek base64 görüntü
 * @returns {Promise<string>} - Temizlenmiş base64 görüntü
 */
const convertBase64ViaCanvas = (base64Str) => {
  if (typeof base64Str !== 'string') {
    console.warn('ImageUtils: convertBase64ViaCanvas string değil');
    return Promise.resolve(getPlaceholderImage());
  }
  
  try {
    // Canvas oluştur
    const canvas = document.createElement('canvas');
    canvas.width = 400; // Satranç tahtası için makul bir boyut
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Arkaplanı beyaz yap
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Görüntüyü canvas'a çizmek için bir Image nesnesi oluştur
    const img = new Image();
    
    // Bir promise ile senkron hale getir
    return new Promise((resolve) => {
      // Yükleme tamamlandığında
      img.onload = () => {
        try {
          // Görüntüyü canvas'a çiz
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          try {
            // Önce PNG olarak dene
            const pngBase64 = canvas.toDataURL('image/png');
            if (pngBase64 && pngBase64.startsWith('data:image/png')) {
              resolve(pngBase64);
              return;
            }
          } catch (pngErr) {
            console.warn('PNG dönüşümü başarısız:', pngErr.message);
          }
          
          try {
            // PNG başarısız olursa JPEG dene
            const jpegBase64 = canvas.toDataURL('image/jpeg', 0.9);
            if (jpegBase64 && jpegBase64.startsWith('data:image/jpeg')) {
              resolve(jpegBase64);
              return;
            }
          } catch (jpegErr) {
            console.warn('JPEG dönüşümü başarısız:', jpegErr.message);
          }
          
          // Her iki format da başarısız olursa placeholder kullan
          resolve(getPlaceholderImage());
        } catch (drawErr) {
          console.error('Canvas çizim hatası:', drawErr);
          resolve(getPlaceholderImage());
        }
      };
      
      // Yükleme hatası
      img.onerror = (err) => {
        console.error('Görüntü yükleme hatası:', err);
        resolve(getPlaceholderImage());
      };
      
      // Src ayarlamada hata olabilir
      try {
        img.src = base64Str;
      } catch (srcErr) {
        console.error('Görüntü src hatası:', srcErr);
        resolve(getPlaceholderImage());
      }
      
      // 2 saniye içinde yüklenmezse timeout
      setTimeout(() => {
        if (!img.complete) {
          console.warn('Görüntü yükleme zaman aşımı');
          resolve(getPlaceholderImage());
        }
      }, 2000);
    });
  } catch (e) {
    console.error('Canvas işleme hatası:', e);
    return Promise.resolve(getPlaceholderImage());
  }
};

/**
 * jsPDF için güvenli, test edilmiş bir placeholder görüntü
 * Satranç tahtası üzerinde taşların görünebildiği bir varsayılan şablon
 * @returns {string} - Base64 encoded placeholder chess board image
 */
export const getPlaceholderImage = () => {
  // 8x8 satranç tahtası görünümünde bir varsayılan görüntü
  // Bu görüntü satranç tahtası şablonunu temsil eder
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARgAAAEYCAIAAAAI7H7bAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMC0wMy0yNlQyMTo0MDo0NiswMzowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjAtMDMtMjZUMjE6NDI6NDErMDM6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjAtMDMtMjZUMjE6NDI6NDErMDM6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZWViNzZkZDEtZWZmMy0zODRlLWI0NTMtYzYzYWRmNzhhN2Y1IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOmVlYjc2ZGQxLWVmZjMtMzg0ZS1iNDUzLWM2M2FkZjc4YTdmNSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmVlYjc2ZGQxLWVmZjMtMzg0ZS1iNDUzLWM2M2FkZjc4YTdmNSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZWViNzZkZDEtZWZmMy0zODRlLWI0NTMtYzYzYWRmNzhhN2Y1IiBzdEV2dDp3aGVuPSIyMDIwLTAzLTI2VDIxOjQwOjQ2KzAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Plh0FxAAAA9XSURBVHja7d15c1RVnsDx33PurbX30E06CyQkbGGTRUBEWmyBQdQZqfK1Z97O+wHmYf6debJqrLKdcV+wLUSUTXawWQOEhOx7Out9b91zXnRPNyN2OuTWreT5fqpS6U53OVV86Zyc5d6IMEYQ0XCY7gAiCyKiICIKIqIgIgoioiAiCiKiICKiICIKIqIgIgoioiAiCiKiICKiICIKIqIgIgoioiAiCiKiICIKIiIKIqIgIgoioiAiCiKiICIKIiIKIqIgIgoioiAiCiKiICIKIiIKIqIgIgoioiAiCiKiICIKIqIgIqIgIgoioiAiCiKiICIKIqIgIqIgIgoioiAiCiKiICIKIqIgIqIgIgoioiAiCiKiICIKIqIgIqIgIgoioiAiCiKiICIKIqIgIqIgIgoiogD7PwEGALM+F9JMID0WAAAAAElFTkSuQmCC';
};

/**
 * Safely processes images for PDF generation by limiting sizes
 * to avoid RangeError: Invalid array length errors
 */
export const safeProcessImage = (dataUrl) => {
  // If the data URL is too large, scale it down
  if (dataUrl && dataUrl.length > 1000000) {
    return compressImageDataUrl(dataUrl);
  }
  return dataUrl;
};

/**
 * Compresses an image data URL by creating a smaller version
 */
const compressImageDataUrl = (dataUrl) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        // Calculate new dimensions - scale down to 50%
        const newWidth = Math.floor(img.width * 0.5);
        const newHeight = Math.floor(img.height * 0.5);
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw the image at the new size
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Get the compressed data URL
        const compressedDataUrl = canvas.toDataURL('image/png', 0.7);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => {
        // If there's an error, return a small placeholder
        console.warn('Error loading image for compression');
        resolve(createPlaceholderImage());
      };
      
      img.src = dataUrl;
    } catch (e) {
      console.error('Error compressing image:', e);
      resolve(createPlaceholderImage());
    }
  });
};

// You already have this function, referencing to be clear
export const createPlaceholderImage = () => {
  // Return a very small transparent PNG data URL
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
};
