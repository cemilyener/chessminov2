// src/utils/lessons/loadLessonData.js
import { Chess } from 'chess.js';

/**
 * JSON formatındaki ders verisini düğüm tabanlı Map yapısına dönüştürür.
 * @param {Object|string} lessonData - JSON formatındaki ders verisi veya dosya yolu.
 * @returns {Promise<Object>} - Map yapısına dönüştürülmüş ders verisi.
 */
export const loadLessonData = async (lessonData) => {
  try {
    // JSON veri kaynağını belirle ve yükle
    let data;
    if (typeof lessonData === 'string') {
      // Dosya yolu verilmişse, dosyayı yükle
      try {
        const response = await fetch(lessonData);
        if (!response.ok) {
          throw new Error(`Ders verisi yüklenirken hata: ${response.status}`);
        }
        data = await response.json();
      } catch (error) {
        throw new Error(`Ders dosyası okunamadı: ${error.message}`);
      }
    } else {
      // Doğrudan JSON nesnesi verilmişse kullan
      data = lessonData;
    }

    // Temel veri yapısı doğrulaması
    if (!data || !data.nodes || typeof data.nodes !== 'object') {
      throw new Error('Geçersiz ders verisi formatı: nodes alanı eksik veya hatalı');
    }

    // Chess.js ile FEN doğrulaması (dikkat: Chess.js şahsız konumları desteklemez)
    try {
      new Chess(data.initialFen);
    } catch (error) {
      console.warn(`FEN doğrulama uyarısı: ${error.message}. İşleme devam edilecek.`);
      // Not: Gerçek uygulamada burada Chess.js sınırlamaları için workaround uygulanabilir
    }

    // JSON'daki düğüm nesnesini Map yapısına dönüştür
    const nodeMap = new Map();
    
    // Tüm düğümleri Map'e ekle
    for (const [nodeId, node] of Object.entries(data.nodes)) {
      nodeMap.set(nodeId, { ...node });
    }

    // Düğüm bağlantılarını doğrula
    for (const [nodeId, node] of nodeMap.entries()) {
      // Ebeveyn bağlantısını kontrol et
      if (node.parentId && !nodeMap.has(node.parentId)) {
        console.warn(`Uyarı: "${nodeId}" düğümünün ebeveyni "${node.parentId}" bulunamadı`);
      }
      
      // Çocuk bağlantılarını kontrol et
      if (node.childrenIds && Array.isArray(node.childrenIds)) {
        for (const childId of node.childrenIds) {
          if (!nodeMap.has(childId)) {
            console.warn(`Uyarı: "${nodeId}" düğümünün çocuğu "${childId}" bulunamadı`);
          }
        }
      } else {
        // childrenIds yoksa veya dizi değilse, boş dizi olarak ata
        node.childrenIds = [];
      }
    }

    // Ana hat düğümlerini hesapla ve işaretle
    const mainLineNodeIds = calculateMainLine(nodeMap);
    
    // Sonuç nesnesini oluştur
    return {
      ...data,
      nodes: nodeMap,
      metadata: {
        rootId: "root",
        mainLineNodeIds: mainLineNodeIds,
        currentNodeId: "root",
        ...(data.metadata || {})
      }
    };
  } catch (error) {
    console.error('Ders verisi yüklenirken hata oluştu:', error);
    throw error;
  }
};

/**
 * Ana hattı (main line) hesaplar - kökten başlayarak ilk çocuk yolunu takip eder.
 * @param {Map} nodeMap - Düğümleri içeren Map.
 * @returns {Array} - Ana hat düğüm ID'lerinin listesi.
 */
function calculateMainLine(nodeMap) {
  const mainLine = ["root"];
  let currentId = "root";
  
  // Kökten başlayarak ana hattı izle (her zaman ilk çocuk)
  while (nodeMap.has(currentId)) {
    const node = nodeMap.get(currentId);
    
    // Ana hat düğümünü işaretle
    if (node.metadata) {
      node.metadata.isMainLine = true;
    } else {
      node.metadata = { isMainLine: true };
    }
    
    // Çocuk düğüm var mı kontrol et
    if (node.childrenIds && node.childrenIds.length > 0) {
      // İlk çocuğu ana hat olarak kabul et
      currentId = node.childrenIds[0];
      mainLine.push(currentId);
      
      // Diğer kardeşleri (varsa) ana hat olmayan olarak işaretle
      for (let i = 1; i < node.childrenIds.length; i++) {
        const childId = node.childrenIds[i];
        markSubtreeNonMainline(nodeMap, childId);
      }
    } else {
      break;
    }
  }
  
  return mainLine;
}

/**
 * Bir düğümün alt ağacındaki tüm düğümleri ana hat olmayan olarak işaretler.
 * @param {Map} nodeMap - Düğümleri içeren Map.
 * @param {string} nodeId - İşaretlemeye başlanacak düğüm ID'si.
 */
function markSubtreeNonMainline(nodeMap, nodeId) {
  const node = nodeMap.get(nodeId);
  if (node) {
    // Düğümü ana hat olmayan olarak işaretle
    if (node.metadata) {
      node.metadata.isMainLine = false;
    } else {
      node.metadata = { isMainLine: false };
    }
    
    // Alt ağacı rekursif olarak işaretle
    if (node.childrenIds) {
      node.childrenIds.forEach(childId => {
        markSubtreeNonMainline(nodeMap, childId);
      });
    }
  }
}

/**
 * Belirli ID'ye sahip dersi yükler.
 * @param {string} lessonId - Yüklenecek dersin ID'si.
 * @returns {Promise<Object>} - Map yapısına dönüştürülmüş ders verisi.
 */
export const loadLessonById = async (lessonId) => {
  try {
    const lessonFilePath = `src/data/lessons/${lessonId}.json`;
    return await loadLessonData(lessonFilePath);
  } catch (error) {
    console.error(`${lessonId} ID'li ders yüklenirken hata:`, error);
    throw error;
  }
};

/**
 * Tüm derslerin özetlerini içeren listeyi yükler.
 * @returns {Promise<Array>} - Ders özetlerinin listesi.
 */
export const loadAllLessons = async () => {
  try {
    const response = await fetch('src/data/lessons/lessonsList.json');
    if (!response.ok) {
      throw new Error(`Ders listesi yüklenemedi: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Ders listesi yüklenirken hata:', error);
    throw error;
  }
};

export default loadLessonData;