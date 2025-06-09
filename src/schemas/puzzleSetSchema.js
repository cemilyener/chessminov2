// puzzleSetSchema.js - Step 1: LESSON_TOPICS Ekleme ve PIECE_TYPES Kaldırma

/**
 * ChessMino Puzzle Set Schema - Updated with LESSON_TOPICS
 */

// ✅ YENİ: LESSON_TOPICS (UNIFIED_PUZZLE_SYSTEM.md'den)
export const LESSON_TOPICS = {
  // Satranç Taşları Konuları
  'k': { name: 'Kale Dersi', englishName: 'Rook Lesson' },
  'f': { name: 'Fil Dersi', englishName: 'Bishop Lesson' },
  'v': { name: 'Vezir Dersi', englishName: 'Queen Lesson' },
  's': { name: 'Şah Dersi', englishName: 'King Lesson' },
  'p': { name: 'Piyon Dersi', englishName: 'Pawn Lesson' },
  'a': { name: 'At Dersi', englishName: 'Knight Lesson' },
  
  // Serbest Bölüm Konuları
  'm': { name: 'Mat Konusu', englishName: 'Checkmate Topic' },
  't': { name: 'Pat Konusu', englishName: 'Stalemate Topic' },
  'r': { name: 'Rok Konusu', englishName: 'Castling Topic' },
  'g': { name: 'Geçerken Alma Konusu', englishName: 'En Passant Topic' },
  'h': { name: 'Şah Çekme Konusu', englishName: 'Check Topic' },
  'b': { name: 'Tahta Tanıma Dersi', englishName: 'Board Introduction Lesson' }
};

// ❌ ESKİ: PIECE_TYPES (KALDIRILIYOR - LESSON_TOPICS ile değiştirildi)
/*
export const PIECE_TYPES = {
  'k': { name: 'Kale', englishName: 'Rook' },
  'f': { name: 'Fil', englishName: 'Bishop' },
  'v': { name: 'Vezir', englishName: 'Queen' },
  's': { name: 'Şah', englishName: 'King' },
  'p': { name: 'Piyon', englishName: 'Pawn' },
  'a': { name: 'At', englishName: 'Knight' },
  'm': { name: 'Mat', englishName: 'Checkmate' },
  't': { name: 'Pat', englishName: 'Stalemate' },
  'r': { name: 'Rok', englishName: 'Castling' },
  'g': { name: 'Geçerken Alma', englishName: 'En Passant' },
  'h': { name: 'Şah Çekme', englishName: 'Check' },
  'b': { name: 'Board', englishName: 'Board' }
};
*/

// ✅ MEVCUT: EXERCISE_TYPES (Değişmez)
export const EXERCISE_TYPES = {
  'a': { 
    name: 'Alma', 
    description: 'Rakip taşı al',
    category: 'temel'
  },
  'i': { 
    name: 'İsteme', 
    description: 'Taş isteme egzersizleri',
    category: 'temel'
  },
  'b': { 
    name: 'Bedava', 
    description: 'Bedava taş egzersizleri',
    category: 'temel'
  },
  'c': { 
    name: 'Canavar', 
    description: 'Canavar (tehdit) egzersizleri',
    category: 'temel'
  },
  's': { 
    name: 'Serbest', 
    description: 'Serbest stil egzersizleri',
    category: 'serbest'
  }
};

// ✅ MEVCUT: DIFFICULTY_LEVELS (Değişmez)
export const DIFFICULTY_LEVELS = {
  '1': { 
    name: 'Kolay', 
    description: 'Başlangıç seviyesi',
    color: 'green'
  },
  '2': { 
    name: 'Orta', 
    description: 'Orta seviye',
    color: 'yellow'
  },
  '3': { 
    name: 'Zor', 
    description: 'İleri seviye',
    color: 'red'
  }
};

// ✅ MEVCUT: PIECE_SETS (Değişmez)
export const PIECE_SETS = {
  'merida': { name: 'Merida', isDefault: true },
  'classic': { name: 'Classic', isDefault: false },
  'modern': { name: 'Modern', isDefault: false },
  'wooden': { name: 'Wooden', isDefault: false },
  'marble': { name: 'Marble', isDefault: false }
};

// ✅ MEVCUT: Validation functions (Değişmez)
export const validateSetId = (setId) => {
  if (!setId || typeof setId !== 'string' || setId.length !== 6) {
    return { isValid: false, message: 'Set ID 6 karakter olmalı' };
  }
  
  const pattern = /^(\d{3})([kfvsapmtrgbh])([aibcs])([123])$/;
  const match = setId.match(pattern);
  
  if (!match) {
    return { isValid: false, message: 'Geçersiz format (001ka1 olmalı)' };
  }
  
  const [, setNum, pieceType, exerciseType, difficulty] = match;
  
  // LESSON_TOPICS ile validasyon
  if (!Object.keys(LESSON_TOPICS).includes(pieceType)) {
    return { isValid: false, message: 'Geçersiz taş tipi' };
  }
  
  if (!Object.keys(EXERCISE_TYPES).includes(exerciseType)) {
    return { isValid: false, message: 'Geçersiz egzersiz tipi' };
  }
  
  if (!Object.keys(DIFFICULTY_LEVELS).includes(difficulty)) {
    return { isValid: false, message: 'Geçersiz zorluk seviyesi' };
  }
  
  return { isValid: true, message: 'Geçerli set ID' };
};

// ✅ MEVCUT: generateTitle function (SmartNamingDecoder'da güncellenecek)
export const generateTitle = (setId) => {
  const validation = validateSetId(setId);
  if (!validation.isValid) return 'Geçersiz Set';
  
  const [, setNum, pieceType, exerciseType, difficulty] = setId.match(/^(\d{3})([kfvsapmtrgbh])([aibcs])([123])$/);
  
  const piece = LESSON_TOPICS[pieceType]?.name || 'Taş';
  const exercise = EXERCISE_TYPES[exerciseType]?.name || 'Egzersiz';
  const stars = '⭐'.repeat(parseInt(difficulty));
  
  return `${piece} ${exercise} ${stars}`;
};

// ✅ MEVCUT: generateNextSetId function (Değişmez)
export const generateNextSetId = (currentId) => {
  if (!currentId || currentId.length !== 6) return '001ka1';
  
  const num = parseInt(currentId.substring(0, 3)) + 1;
  return String(num).padStart(3, '0') + currentId.substring(3);
};