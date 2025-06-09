/**
 * ChessMino Akıllı İsimlendirme Sistemi Decoder - Updated with LESSON_TOPICS
 * Step 2: PIECE_TYPES → LESSON_TOPICS + Description Format Fix
 */

// ✅ YENİ Import - PIECE_TYPES → LESSON_TOPICS
import { 
  LESSON_TOPICS,  // ⭐ PIECE_TYPES yerine LESSON_TOPICS
  EXERCISE_TYPES, 
  DIFFICULTY_LEVELS, 
  PIECE_SETS,
  validateSetId,
  generateTitle as schemaGenerateTitle,
  generateNextSetId as schemaGenerateNextSetId
} from '@/schemas/puzzleSetSchema';

/**
 * Akıllı kod decoder sınıfı
 */
export class SmartNamingDecoder {
  
  /**
   * Kodu parçalara ayır ve decode et
   * @param {string} code - Örnek: "001ka1"
   * @returns {Object} - Decode edilmiş bilgiler
   */
  static decode(code) {
    // Kod validasyonu
    if (!code || typeof code !== 'string' || code.length !== 6) {
      return this.getDefaultDecoded();
    }

    const setNumber = code.substring(0, 3);
    const pieceType = code.charAt(3).toLowerCase();
    const exerciseType = code.charAt(4).toLowerCase();
    const difficulty = code.charAt(5);

    // Validasyon kontrolleri - LESSON_TOPICS ile
    const isValidSetNumber = /^\d{3}$/.test(setNumber);
    const isValidPieceType = Object.keys(LESSON_TOPICS).includes(pieceType);  // ⭐ LESSON_TOPICS
    const isValidExerciseType = Object.keys(EXERCISE_TYPES).includes(exerciseType);
    const isValidDifficulty = Object.keys(DIFFICULTY_LEVELS).includes(difficulty);

    if (!isValidSetNumber || !isValidPieceType || !isValidExerciseType || !isValidDifficulty) {
      return this.getDefaultDecoded();
    }

    return {
      isValid: true,
      raw: code,
      setNumber: parseInt(setNumber),
      setNumberStr: setNumber,
      pieceType: {
        code: pieceType,
        ...LESSON_TOPICS[pieceType]  // ⭐ LESSON_TOPICS kullanımı
      },
      exerciseType: {
        code: exerciseType,
        ...EXERCISE_TYPES[exerciseType]
      },
      difficulty: {
        code: difficulty,
        level: parseInt(difficulty),
        ...DIFFICULTY_LEVELS[difficulty]
      },
      pieceSet: 'merida', // Varsayılan taş seti
      generatedTitle: this.generateTitle(setNumber, pieceType, exerciseType, difficulty),
      generatedDescription: this.generateDescription(pieceType, exerciseType, difficulty)
    };
  }

  /**
   * Varsayılan decode bilgilerini döndür
   */
  static getDefaultDecoded() {
    return {
      isValid: false,
      raw: '',
      setNumber: 1,
      setNumberStr: '001',
      pieceType: {
        code: 'k',
        ...LESSON_TOPICS['k']  // ⭐ LESSON_TOPICS kullanımı
      },
      exerciseType: {
        code: 'a',
        ...EXERCISE_TYPES['a']
      },
      difficulty: {
        code: '1',
        level: 1,
        ...DIFFICULTY_LEVELS['1']
      },
      pieceSet: 'merida',
      generatedTitle: 'Yeni Puzzle Seti',
      generatedDescription: 'Açıklama ekleyin'
    };
  }

  /**
   * Kod bilgilerinden otomatik başlık üret
   * Format: "Kale Alma ⭐" (dersi kelimesi temizlendi)
   */
  static generateTitle(setNumber, pieceType, exerciseType, difficulty) {
    const piece = LESSON_TOPICS[pieceType]?.name || 'Taş';  // ⭐ LESSON_TOPICS
    const exercise = EXERCISE_TYPES[exerciseType]?.name || 'Egzersiz';
    const stars = '⭐'.repeat(parseInt(difficulty));
    
    // "Kale Dersi" → "Kale", "Mat Konusu" → "Mat" dönüşümü
    const cleanPiece = piece.replace(/\s*([Dd]ersi?|[Kk]onusu)\s*/g, '');
    
    return `${cleanPiece} ${exercise} ${stars}`;
  }

  /**
   * Kod bilgilerinden otomatik açıklama üret
   * YENİ Format: "Kale taş alma ⭐" (hedef format)
   */
  static generateDescription(pieceType, exerciseType, difficulty) {
    const piece = LESSON_TOPICS[pieceType]?.name || 'taş';  // ⭐ LESSON_TOPICS
    const exercise = EXERCISE_TYPES[exerciseType]?.name || 'egzersiz';
    const stars = '⭐'.repeat(parseInt(difficulty));
    
    // "Kale Dersi" → "Kale", "Mat Konusu" → "Mat" dönüşümü
    const cleanPiece = piece.replace(/\s*([Dd]ersi?|[Kk]onusu)\s*/g, '');
    
    // Türkçe toLowerCase sorunu çözümü
    const cleanExercise = exercise.replace(/İ/g, 'i').toLowerCase();
    
    // ⭐ HEDEF FORMAT: "Kale taş alma ⭐"
    return `${cleanPiece} taş ${cleanExercise} ${stars}`;
  }

  /**
   * Form verilerinden kod üret
   */
  static encode(setNumber, pieceTypeCode, exerciseTypeCode, difficultyCode) {
    const paddedSetNumber = setNumber.toString().padStart(3, '0');
    return `${paddedSetNumber}${pieceTypeCode}${exerciseTypeCode}${difficultyCode}`;
  }

  /**
   * Tüm mevcut seçenekleri liste halinde döndür
   */
  static getAllOptions() {
    return {
      lessonTopics: Object.entries(LESSON_TOPICS).map(([code, data]) => ({  // ⭐ pieceTypes → lessonTopics
        value: code,
        label: data.name,
        englishName: data.englishName
      })),
      exerciseTypes: Object.entries(EXERCISE_TYPES).map(([code, data]) => ({
        value: code,
        label: data.name,
        description: data.description
      })),
      difficultyLevels: Object.entries(DIFFICULTY_LEVELS).map(([code, data]) => ({
        value: code,
        label: `${code} - ${data.name}`,
        description: data.description,
        color: data.color
      })),
      pieceSets: Object.entries(PIECE_SETS).map(([key, data]) => ({
        value: key,
        label: data.name,
        isDefault: data.isDefault
      }))
    };
  }

  /**
   * Kod real-time validation
   */
  static validateCode(code) {
    return validateSetId(code);
  }
}

// Schema fonksiyonlarını export et
export const generateTitle = schemaGenerateTitle;
export const generateNextSetId = schemaGenerateNextSetId;
export { validateSetId };

export default SmartNamingDecoder;