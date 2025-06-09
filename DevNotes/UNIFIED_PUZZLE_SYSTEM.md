# ChessMino - Unified Puzzle System Documentation

## 🎯 **Sistem Genel Bakış**

ChessMino'da 3 ana sistem birlikte çalışır:
1. **Akıllı İsimlendirme Sistemi** - Smart Code tabanlı puzzle organizasyonu
2. **Format Bütünlüğü** - JSON standardizasyonu (PGN+Admin Editor uyumu)
3. **Puzzle Oynatıcı** - JSON verilerini oynatma motoru

---

## 🔧 **1. AKILLI İSİMLENDİRME SİSTEMİ**

### **Format: `XXXYYY` (6 karakter)**
- **XXX** (3 digit): Set numarası (001-999)
- **Y** (1 char): Taş tipi
- **Y** (1 char): Egzersiz tipi  
- **Y** (1 char): Zorluk seviyesi (1-3)

### **Taş Tipleri**
```javascript
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
```

### **Ders Konu Başlıkları (LESSON_TOPICS)**
```javascript
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
```

### **Temel Egzersiz Tipleri**
```javascript
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
    category: 'serbest'  // ← Metadata ile özel açıklama
  }
};
```

### **Sıralama Sistemi (Güncellenmiş)**
```
// Satranç Taşları Konuları (Temel Egzersizler)
001ka1 → 002ka2 → 003ka3 (Kale Dersi - Alma 1-2-3)
004ki1 → 005ki2 → 006ki3 (Kale Dersi - İsteme 1-2-3)  
007kb1 → 008kb2 → 009kb3 (Kale Dersi - Bedava 1-2-3)
010kc1 → 011kc2 → 012kc3 (Kale Dersi - Canavar 1-2-3)

013fa1 → 014fa2 → 015fa3 (Fil Dersi - Alma 1-2-3)
...ve böyle devam eder

// Serbest Bölüm Konuları (Özel metadata ile)
201ms1 → 202ms2 → 203ms3 (Mat Konusu - Serbest 1-2-3)
204ts1 → 205ts2 → 206ts3 (Pat Konusu - Serbest 1-2-3)
```

### **Smart Code Örnekleri (Düzeltilmiş)**
```
"001ka1" → "Kale Dersi - Alma Egzersizi - Seviye 1"
"015fc3" → "Fil Dersi - Canavar Egzersizi - Seviye 3"
"201ms2" → "Mat Konusu - Serbest Egzersiz - Seviye 2" (+ özel metadata)
```

### **Description Format (Güncellenmiş)**
```javascript
static generateDescription(topicCode, exerciseType, difficulty) {
  const topic = LESSON_TOPICS[topicCode]?.name || 'konu';
  const exercise = EXERCISE_TYPES[exerciseType]?.name || 'egzersiz';
  const stars = '⭐'.repeat(parseInt(difficulty));
  
  // YENİ format: ka1 → "Kale dersi taş alma ⭐"
  return `${topic} taş ${exercise} ${stars}`;
}

// Örnekler:
// "001ka1" → "Kale dersi taş alma ⭐"
// "015fc3" → "Fil dersi taş canavar ⭐⭐⭐"
// "201ms2" → "Mat konusu taş serbest ⭐⭐" + metadata açıklaması
```