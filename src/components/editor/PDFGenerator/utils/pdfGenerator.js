/**
 * New PDFGenerator module that bridges the old API with the new implementation
 * This file provides compatibility with code still using the old PDF generation approach
 */

import { createPlaceholderImage, processChessboardImage } from './imageProcessor';

/**
 * Base64 string'in ge�erlili�ini kontrol eder
 * @param {string} base64String - Kontrol edilecek base64 string
 * @returns {boolean} - Ge�erli ise true, de�ilse false
 */
export const isValidBase64Image = (base64String) => {
  try {
    // Bo� veya string olmayan de�erler ge�ersizdir
    if (!base64String || typeof base64String !== 'string') {
      return false;
    }
    
    // Base64 image data URI format�nda olmal�
    if (!base64String.startsWith('data:image/')) {
      return false;
    }
    
    // Base64 k�sm�n� ay�kla
    const parts = base64String.split(',');
    if (parts.length !== 2) {
      return false;
    }
    
    const base64Data = parts[1];
    if (!base64Data || base64Data.trim() === '') {
      return false;
    }
    
    // Ge�erli base64 karakterleri kontrol�
    const validBase64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!validBase64Regex.test(base64Data)) {
      return false;
    }
    
    return true;
  } catch (e) {
    console.warn('Base64 do�rulama hatas�:', e.message);
    return false;
  }
};

/**
 * Base64 i�eri�ini d�zelt ve temizle - imageUtils.js'deki fonksiyonu kullanan versiyon
 * @param {string} base64String - Kontrol edilecek base64 string
 * @returns {Promise<string>} - Temizlenmi� base64 string veya placeholder
 */
const sanitizeBase64 = async (base64String) => {
  try {
    // imageUtils.js dosyas�ndan gelen sanitizeBase64Image fonksiyonunu �a��r
    const cleanedImage = await sanitizeBase64Image(base64String);
    return cleanedImage || getPlaceholderImage();
  } catch (e) {
    console.warn('Base64 sanitize i�lemi ba�ar�s�z:', e.message);
    return getPlaceholderImage();
  }
};

/**
 * Base64 g�r�nt�s�n� optimize eder
 * @param {string} base64Image - Base64 format�nda g�r�nt�
 * @param {number} maxWidth - Maksimum geni�lik (piksel)
 * @param {number} maxHeight - Maksimum y�kseklik (piksel)
 * @param {number} quality - JPEG kalitesi (0-1)
 * @returns {Promise<string>} - Optimize edilmi� base64 g�r�nt�
 */
export const optimizeImage = (base64Image, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    try {
      // �nce base64 do�rulamas� yap
      if (!isValidBase64Image(base64Image)) {
        reject(new Error('Ge�ersiz base64 g�r�nt� format�'));
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        // Boyut hesaplama
        let width = img.width;
        let height = img.height;
        
        // Maksimum boyutu a��yorsa �l�eklendirme yap
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Canvas'a �izim
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white'; // Beyaz arkaplan
        ctx.fillRect(0, 0, width, height);
        
        // G�r�nt�y� �iz
        ctx.drawImage(img, 0, 0, width, height);
        
        // Optimize edilmi� base64 d�nd�r
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.onerror = () => {
        reject(new Error('G�r�nt� y�klenemedi'));
      };
      
      img.src = base64Image;
    } catch (err) {
      reject(err);
    }
  });
};
