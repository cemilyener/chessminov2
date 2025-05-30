/**
 * ChessMino Akıllı İsimlendirme Sistemi Decoder
 * 
 * Format: AAABCD
 * AAA: Set numarası (001-999)
 * B: Taş/konu türü (k:kale, f:fil, v:vezir, s:şah, p:piyon, a:at)
 * C: Egzersiz tipi (a:alma, i:isteme, b:bedava, c:canavar, s:serbest)
 * D: Zorluk seviyesi (1:kolay, 2:orta, 3:zor)
 */

// Taş türleri mapping
export const PIECE_TYPES = {
  'k': { name: 'Kale', englishName: 'Rook' },
  'f': { name: 'Fil', englishName: 'Bishop' },
  'v': { name: 'Vezir', englishName: 'Queen' },
  's': { name: 'Şah', englishName: 'King' },
  'p': { name: 'Piyon', englishName: 'Pawn' },
  'a': { name: 'At', englishName: 'Knight' }
};

// Egzersiz tipleri mapping
export const EXERCISE_TYPES = {
  'a': { name: 'Alma', description: 'Taş alma egzersizleri' },
  'i': { name: 'İsteme', description: 'Taş isteme egzersizleri' },
  'b': { name: 'Bedava', description: 'Bedava taş egzersizleri' },
  'c': { name: 'Canavar', description: 'Canavar (tehdit) egzersizleri' },
  's': { name: 'Serbest', description: 'Serbest stil egzersizleri' }
};

// Zorluk seviyeleri
export const DIFFICULTY_LEVELS = {
  '1': { name: 'Kolay', color: 'green', description: 'Yeni başlayanlar için' },
  '2': { name: 'Orta', color: 'yellow', description: 'Orta seviye oyuncular için' },
  '3': { name: 'Zor', color: 'red', description: 'İleri seviye oyuncular için' }
};

// Taş setleri
export const PIECE_SETS = {
  'merida': { name: 'Merida', isDefault: true },
  'lucide': { name: 'Lucide', isDefault: false },
  'berlin': { name: 'Berlin', isDefault: false },
  'sahgizli': { name: 'Şahgizli', isDefault: false },
  'piyondag': { name: 'Piyondağ', isDefault: false },
  'atkupa': { name: 'Atkupa', isDefault: false }
};

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

    // Validasyon kontrolleri
    const isValidSetNumber = /^\d{3}$/.test(setNumber);
    const isValidPieceType = Object.keys(PIECE_TYPES).includes(pieceType);
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
        ...PIECE_TYPES[pieceType]
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
        ...PIECE_TYPES['k']
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
   */
  static generateTitle(setNumber, pieceType, exerciseType, difficulty) {
    const piece = PIECE_TYPES[pieceType]?.name || 'Taş';
    const exercise = EXERCISE_TYPES[exerciseType]?.name || 'Egzersiz';
    const difficultyName = DIFFICULTY_LEVELS[difficulty]?.name || 'Seviye';
    
    return `${piece} ${exercise} - Seviye ${difficulty} (Set ${setNumber})`;
  }

  /**
   * Kod bilgilerinden otomatik açıklama üret
   */
  static generateDescription(pieceType, exerciseType, difficulty) {
    const piece = PIECE_TYPES[pieceType]?.name || 'taş';
    const exercise = EXERCISE_TYPES[exerciseType]?.description || 'egzersizleri';
    const difficultyDesc = DIFFICULTY_LEVELS[difficulty]?.description || '';
    
    return `${piece} ile ${exercise}. ${difficultyDesc}`;
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
      pieceTypes: Object.entries(PIECE_TYPES).map(([code, data]) => ({
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
    if (!code) return { isValid: true, message: '' };
    
    if (code.length > 6) {
      return { isValid: false, message: 'Kod en fazla 6 karakter olabilir' };
    }
    
    if (code.length < 6) {
      return { isValid: true, message: `${6 - code.length} karakter daha gerekli` };
    }
    
    const decoded = this.decode(code);
    if (!decoded.isValid) {
      return { isValid: false, message: 'Geçersiz kod formatı' };
    }
    
    return { isValid: true, message: 'Geçerli kod ✓' };
  }
}

export default SmartNamingDecoder;