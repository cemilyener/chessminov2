// puzzleSetSchema.js - LESSON_TOPICS ekleme

// ✅ YENİ - LESSON_TOPICS tanımı (UNIFIED_PUZZLE_SYSTEM.md'den):
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

// 📋 MEVCUT PIECE_TYPES - Kalsın mı? Yoksa silinsin mi?
// KARAR: En basit yol için PIECE_TYPES'ı kaldırmak
// Çünkü LESSON_TOPICS artık onun yerini alıyor

// ❌ ESKİ PIECE_TYPES (silinebilir):
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

// 🎯 EN BASİT YOL: 
// 1. LESSON_TOPICS ekle
// 2. PIECE_TYPES'ı kaldır (veya comment out yap)
// 3. Tüm import'ları LESSON_TOPICS'e çevir

// 📋 EXERCISE_TYPES - Değişmez (mevcut):
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

// 📋 DIFFICULTY_LEVELS - Değişmez (mevcut):
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

// 🧪 TEST KODU:
/*
console.log('🧪 Schema Test:');
console.log('LESSON_TOPICS.k:', LESSON_TOPICS.k);
console.log('EXERCISE_TYPES.a:', EXERCISE_TYPES.a);
console.log('DIFFICULTY_LEVELS.1:', DIFFICULTY_LEVELS['1']);
*/