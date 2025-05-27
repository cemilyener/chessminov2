# ChessMino JSON Format Güncellemesi - GÜNCEL PLAN

## 📋 YENİ HEDEF FORMAT (Basitleştirilmiş)

### 🎯 FİNAL FORMAT (KARARLAŞTIRILDI)
```json
{
  "id": "003ka3",
  "pieceSet": "merida", 
  "nextSetId": "004ka3",
  "puzzles": [
    {
      "id": "003ka3_01",
      "index": 1,
      "fen": "4k3/p1p5/8/8/p1p5/8/R7/4K3 w - - 0 1",
      "mainLine": [
        {
          "move": "Rxa4",
          "fen": "4k3/p1p5/8/8/R1p5/8/8/4K3 w - - 0 1",
          "isLast": false
        }
      ],
      "alternatives": [
        {
          "name": "variant_a",
          "parentVariant": "main",
          "parentMoveIndex": 1,
          "moves": [
            {
              "move": "Rxa7", 
              "fen": "5k2/R1p5/8/8/2p5/8/8/4K3 w - - 0 2",
              "isLast": false
            }
          ]
        }
      ]
    }
  ],
  "puzzleCount": 2
}
```

### ✅ KARARLAŞTIRILDI:
- **Smart Code Parsing:** `003ka3` → Set:003, Piece:k(ale), Exercise:a(lma), Difficulty:3
- **Metadata Eksikliği:** Smart code'dan otomatik parsing yeterli
- **PGN Smart Code:** Otomatik generation (001ka1, 002ka1, vs.)
- **Varyant Sistemi:** Korunacak, alternatives[] formatında

---

## 🚀 UYGULAMA PLANI (Öncelik Sırasına Göre)

### **AŞAMA 1: PuzzleEditorPage.jsx Temizlik (ACİL)**
**Problem:** Dosya çok büyük (1000+ satır), aşırı mühendislik
**Çözüm:** 
- [ ] Debug loglarını temizle (console.log kaldır)
- [ ] Gereksiz fonksiyonları sil
- [ ] exportToJson fonksiyonunu yeni formata güncelle

**Dosya:** `src/pages/PuzzleEditorPage.jsx`

### **AŞAMA 2: PGN Converter Güncelleme**
**Problem:** PGN import edilen dosyalar yeni formatta değil  
**Çözüm:**
- [ ] useChessStore.js → exportAsJson fonksiyonunu güncelle
- [ ] Smart code auto-generation ekle
- [ ] Varyant parsing düzelt

**Dosya:** `src/store/useChessStore.js`

### **AŞAMA 3: Cross-Validation**
**Problem:** İki kaynak farklı format üretebilir
**Çözüm:**
- [ ] Board Editor export == PGN Converter export formatını doğrula
- [ ] Test senaryoları çalıştır

---

## 📂 GÜNCELLENECEK DOSYALAR ve GÖREVLER

### 🔴 **src/pages/PuzzleEditorPage.jsx** (ÖNCELIK 1)
```javascript
// Bu fonksiyonu TAMAMEN YENİ formatla güncelle:
const exportToJson = () => {
  return {
    id: smartCode,
    pieceSet: metadata.pieceSet || "merida",
    nextSetId: generateNextSetId(smartCode), 
    puzzles: questions.map(question => ({
      id: question.id,
      index: question.questionNumber,
      fen: question.startingFen || question.fen,
      mainLine: generateMainLineWithFEN(question.mainLine),
      alternatives: generateAlternativesWithFEN(question.variations || [])
    })),
    puzzleCount: questions.length
  };
};

// Yardımcı fonksiyonlar ekle:
const generateNextSetId = (currentId) => {
  const num = parseInt(currentId.substring(0, 3)) + 1;
  return String(num).padStart(3, '0') + currentId.substring(3);
};

const generateMainLineWithFEN = (moves) => {
  // Chess.js ile her hamle için FEN hesapla
  return moves.map((move, index) => ({
    move: move,
    fen: calculateFENForMove(move, index),
    isLast: index === moves.length - 1
  }));
};
```

### 🟡 **src/store/useChessStore.js** (ÖNCELIK 2)
```javascript
// exportAsJson fonksiyonunu güncelle:
exportAsJson: (setIndex = 0) => {
  const puzzleSet = puzzleSets[setIndex];
  
  return {
    id: generatePgnSmartCode(setIndex), // Auto: 001ka1, 002ka1...
    pieceSet: "merida",
    nextSetId: generatePgnNextSetId(setIndex),
    puzzles: puzzleSet.puzzles.map(puzzle => ({
      id: puzzle.id,
      index: puzzle.index || 1,
      fen: puzzle.fen,
      mainLine: transformMainLine(puzzle.mainLine),
      alternatives: transformAlternatives(puzzle.variations)
    })),
    puzzleCount: puzzleSet.puzzles.length
  };
}

// PGN için smart code generation:
const generatePgnSmartCode = (setIndex) => {
  const num = String(setIndex + 1).padStart(3, '0');
  return `${num}ka1`; // Varsayılan: kale alma kolay
};
```

### 🟢 **src/utils/smartCodeUtils.js** (YENİ DOSYA)
```javascript
// Smart code parsing utilities
export const parseSmartCode = (id) => {
  return {
    setNumber: parseInt(id.substring(0, 3)),
    piece: id.charAt(3), // k=kale, f=fil, v=vezir
    exercise: id.charAt(4), // a=alma, i=isteme, b=bedava
    difficulty: parseInt(id.charAt(5))
  };
};

export const generateDisplayInfo = (id) => {
  const parsed = parseSmartCode(id);
  const pieceNames = { k: 'Kale', f: 'Fil', v: 'Vezir' };
  const exerciseNames = { a: 'Alma', i: 'İsteme', b: 'Bedava' };
  
  return {
    title: `${pieceNames[parsed.piece]} ${exerciseNames[parsed.exercise]} - Set ${parsed.setNumber}`,
    description: `${pieceNames[parsed.piece]} ile ${exerciseNames[parsed.exercise]} egzersizleri`
  };
};
```

---

## 📅 HAFTALIK UYGULAMA PLANI

### **BU HAFTA: Board Editor Güncelleme**
- [ ] **Pazartesi:** PuzzleEditorPage.jsx debug temizliği  
- [ ] **Salı:** exportToJson fonksiyonu yeni format
- [ ] **Çarşamba:** FEN generation helpers
- [ ] **Perşembe:** Test - manuel puzzle oluştur ve export et
- [ ] **Cuma:** smartCodeUtils.js oluştur

### **GELECEKEKİ HAFTA: PGN Converter**
- [ ] **Pazartesi:** useChessStore.js exportAsJson güncelle
- [ ] **Salı:** PGN smart code auto-generation
- [ ] **Çarşamba:** Varyant parsing düzelt  
- [ ] **Perşembe:** Test - PGN import ve export
- [ ] **Cuma:** Cross-validation - her iki kaynak aynı format

---

## 🧪 TEST STRATEJİSİ

### **Test 1: Board Editor Export**
```markdown
1. Puzzle Editor'ı aç
2. Smart code: 001ka3 gir
3. Manuel puzzle oluştur (mainLine + alternatives)
4. Export JSON
5. Format kontrolü: Yeni format ile uyumlu mu?
```

### **Test 2: PGN Import Export**
```markdown
1. PGN Converter'ı aç
2. fc3.pgn dosyasını yükle
3. Export JSON
4. Format kontrolü: Board editor ile aynı format mı?
```

### **Test 3: Cross-Format Validation**
```markdown
1. Board Editor JSON export et
2. PGN Converter JSON export et  
3. İki JSON'ı karşılaştır
4. Format tutarlılığını doğrula
```

---

## ❓ SON KARARLAR VE CEVAPLAR

### ✅ **Smart Code Generation (PGN)**
**Karar:** Otomatik generation
- İlk import: `001ka1`
- İkinci import: `002ka1`  
- Kullanıcı sonradan değiştirebilir

### ✅ **Metadata Parsing**
**Karar:** Smart code'dan otomatik
- `003ka3` → "Kale Alma Set 3 (Zor)"
- UI'da display için yeterli

### ✅ **Varyant Sistemi**
**Karar:** Mevcut sistem korunacak
- Sadece export formatı `alternatives[]` olacak
- Board editor'daki varyant UI değişmeyecek

### ✅ **Performance**
**Karar:** FEN hesaplama lazy
- Export anında hesapla
- Cache'leme şimdilik yok

---

## 🚨 DİKKAT EDİLECEKLER

1. **Mevcut Çalışan Sistemleri Bozmama**
   - Board editor varyant sistemi korunacak
   - PGN converter mevcut parsing'i değişmeyecek

2. **Adım Adım İlerleme**
   - Her değişiklik sonrası test
   - Geri dönüş planı hazır

3. **Format Tutarlılığı**  
   - Board Editor ve PGN Converter aynı format üretmeli
   - Cross-validation şart

---

## 📝 GÜNCEL NOTLAR

- **Durum:** Board Editor temizliği başlanacak
- **Öncelik:** PuzzleEditorPage.jsx dosya boyutu azaltma + format güncelleme
- **Sonraki:** PGN Converter format uyumu
- **Test:** Her aşamada manual test gerekli

---

**Son Güncelleme:** 2025-01-27
**Sorumlu:** Geliştirici  
**Durum:** Aktif uygulama
**İlk Hedef:** Board Editor export formatı güncelleme